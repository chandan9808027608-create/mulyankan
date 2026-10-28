import { NextRequest, NextResponse } from "next/server";
import { DirectMessage } from "@/app/lib/dealerBidsData";
import { mutateStore, readStore } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const { messages } = await readStore();
  return NextResponse.json({ success: true, count: messages.length, data: messages });
}

export async function POST(req: NextRequest) {
  try {
    const { bikeId, sender, senderName, message } = await req.json();
    if (!bikeId || !message || (sender !== "dealer" && sender !== "seller")) {
      return NextResponse.json({ error: "Required: bikeId, sender ('dealer' | 'seller'), message" }, { status: 400 });
    }

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bikeId: String(bikeId),
      sender,
      senderName: String(senderName || (sender === "dealer" ? "Verified Workshop" : "Seller")),
      message: String(message),
      timestamp: new Date().toISOString(),
    };

    await mutateStore("messages", (store) => {
      store.messages.push(newMsg);
    });

    return NextResponse.json({ success: true, data: newMsg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to send message", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
