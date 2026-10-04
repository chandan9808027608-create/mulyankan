import { NextRequest, NextResponse } from "next/server";
import { INITIAL_BIDS, BidRecord } from "@/app/lib/dealerBidsData";

// In-memory store for session persistence
let bidsStore: BidRecord[] = [...INITIAL_BIDS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bikeId = searchParams.get("bikeId") || searchParams.get("vehicleId");

  if (bikeId) {
    const filtered = bidsStore.filter((b) => b.bikeId === bikeId);
    return NextResponse.json({ success: true, count: filtered.length, data: filtered });
  }

  return NextResponse.json({ success: true, count: bidsStore.length, data: bidsStore });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bikeId, vehicleId, dealerName, dealerLocation, amountNpr } = body;
    const targetBikeId = bikeId || vehicleId;

    if (!targetBikeId || !dealerName || !amountNpr) {
      return NextResponse.json(
        { error: "Missing required fields: bikeId, dealerName, amountNpr" },
        { status: 400 }
      );
    }

    const newBid: BidRecord = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bikeId: String(targetBikeId),
      dealerName: String(dealerName),
      dealerLocation: String(dealerLocation || "Kathmandu Valley"),
      amountNpr: Number(amountNpr),
      timestamp: "Just now",
      status: "active",
      verifiedDealer: true,
    };

    bidsStore.unshift(newBid);

    return NextResponse.json(
      {
        success: true,
        message: "Bid successfully broadcast to seller and platform",
        data: newBid,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to submit bid", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}