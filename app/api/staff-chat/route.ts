import { NextRequest, NextResponse } from "next/server";
import { mutateStore, readStore, StaffChatRecord } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

// Staff room messages, scoped to one showroom by its PAN number.
export async function GET(req: NextRequest) {
  const pan = new URL(req.url).searchParams.get("pan");
  if (!pan) return NextResponse.json({ error: "Required: pan" }, { status: 400 });
  const { staffMessages } = await readStore();
  const data = staffMessages.filter((m) => m.panNumber === pan);
  return NextResponse.json({ success: true, count: data.length, data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { panNumber, senderId, senderName, content, bikeRef, proposedOfferNpr, isOfferCard } = body;
    if (!panNumber || !senderId || !senderName || !String(content || "").trim()) {
      return NextResponse.json({ error: "Required: panNumber, senderId, senderName, content" }, { status: 400 });
    }

    const msg: StaffChatRecord = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      panNumber: String(panNumber),
      senderId: String(senderId),
      senderName: String(senderName),
      timestamp: new Date().toISOString(),
      content: String(content).trim(),
      ...(bikeRef ? { bikeRef } : {}),
      ...(isOfferCard ? { isOfferCard: true, proposedOfferNpr: Number(proposedOfferNpr) || undefined } : {}),
    };

    await mutateStore("staffMessages", (store) => {
      store.staffMessages.push(msg);
    });

    return NextResponse.json({ success: true, data: msg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to send message", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
