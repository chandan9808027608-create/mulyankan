import { NextRequest, NextResponse } from "next/server";
import { mutateStore, readStore, StoredPosting } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

const TEXT_FIELD_DEFAULTS: Record<string, string> = {
  year: "Not stated",
  mileage: "Not stated",
  lotNumber: "Not stated",
  location: "Kathmandu Valley",
  ownership: "Not stated",
  condition: "Not stated",
  paperwork: "Not stated",
  timeLeft: "OPEN",
  sellerName: "Private Seller",
  sellerPhone: "",
  sellerAddress: "Kathmandu Valley",
  bluebookStatus: "Not stated",
  taxValidTill: "Not stated",
  keysCount: "Not stated",
  engineCondition: "Not inspected yet",
  tyreCondition: "Not inspected yet",
  simpleHowItRuns: "Not inspected yet.",
  simpleAccidentStatus: "Not inspected yet.",
  simplePapersStatus: "Not stated.",
  simpleKeysStatus: "Not stated.",
};

export async function GET() {
  const { postings } = await readStore();
  return NextResponse.json({ success: true, count: postings.length, data: postings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.name || !body?.highestBid || !Array.isArray(body?.images) || body.images.length === 0) {
      return NextResponse.json(
        { error: "Missing required vehicle information: name, highestBid, at least one photo" },
        { status: 400 }
      );
    }

    const urls = body.images.map((img: any) => String(typeof img === "string" ? img : img?.url || ""));
    if (urls.some((u: string) => !u || u.startsWith("blob:") || u.startsWith("data:"))) {
      return NextResponse.json(
        { error: "Photos must be uploaded first (POST /api/uploads) and referenced by URL" },
        { status: 400 }
      );
    }

    const posting: StoredPosting = {
      ...body,
      images: urls.map((url: string, idx: number) => ({ url, label: body.images[idx]?.label || `${idx + 1}. Photo` })),
      imageUrl: urls[0],
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bidCount: 0,
      createdAt: new Date().toISOString(),
    };
    // Every screen reads these as strings; fill anything the client left out
    for (const [key, fallback] of Object.entries(TEXT_FIELD_DEFAULTS)) {
      if (typeof posting[key] !== "string" || !(posting[key] as string).trim()) posting[key] = fallback;
    }

    await mutateStore("postings", (store) => {
      store.postings.unshift(posting);
    });

    return NextResponse.json({ success: true, data: posting }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create vehicle posting", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
