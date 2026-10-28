import { NextRequest, NextResponse } from "next/server";
import { BidRecord } from "@/app/lib/dealerBidsData";
import { formatNpr, mutateStore, readStore } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bikeId = searchParams.get("bikeId") || searchParams.get("vehicleId");
  const { bids } = await readStore();
  const data = bikeId ? bids.filter((b) => b.bikeId === bikeId) : bids;
  return NextResponse.json({ success: true, count: data.length, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bikeId, vehicleId, dealerName, dealerLocation } = body;
    const targetBikeId = bikeId || vehicleId;
    const amountNpr = Number(body.amountNpr);

    if (!targetBikeId || !dealerName || !Number.isFinite(amountNpr) || amountNpr <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: bikeId, dealerName, amountNpr" },
        { status: 400 }
      );
    }

    const result = await mutateStore("bids", (store) => {
      const posting = store.postings.find((p) => p.id === targetBikeId);
      if (!posting) return { error: "Vehicle not found", status: 404 } as const;

      const current = Number(String(posting.highestBid).replace(/[^0-9]/g, "")) || 0;
      if (amountNpr <= current && (posting.bidCount || 0) > 0) {
        return { error: `Bid must be higher than the current bid of ${posting.highestBid}`, status: 409 } as const;
      }

      const newBid: BidRecord = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        bikeId: String(targetBikeId),
        dealerName: String(dealerName),
        dealerLocation: String(dealerLocation || "Kathmandu Valley"),
        amountNpr,
        timestamp: new Date().toISOString(),
        status: "active",
        verifiedDealer: true,
      };

      for (const b of store.bids) {
        if (b.bikeId === newBid.bikeId && b.status === "active") b.status = "outbid";
      }
      store.bids.unshift(newBid);
      posting.highestBid = formatNpr(amountNpr);
      posting.bidCount = (posting.bidCount || 0) + 1;

      return { bid: newBid, posting } as const;
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      { success: true, message: "Bid successfully broadcast to seller and platform", data: result.bid, posting: result.posting },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit bid", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// Seller accepts or rejects a bid.
export async function PATCH(req: NextRequest) {
  try {
    const { bidId, action } = await req.json();
    if (!bidId || (action !== "accept" && action !== "reject")) {
      return NextResponse.json({ error: "Required: bidId and action ('accept' | 'reject')" }, { status: 400 });
    }

    const bids = await mutateStore("bids", (store) => {
      const target = store.bids.find((b) => b.id === bidId);
      if (!target) return null;
      if (action === "accept") {
        for (const b of store.bids) {
          if (b.bikeId === target.bikeId) b.status = b.id === bidId ? "accepted" : "outbid";
        }
      } else {
        target.status = "outbid";
      }
      return store.bids;
    });

    if (!bids) return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: bids });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update bid", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
