import { NextRequest, NextResponse } from "next/server";

export interface VehiclePostingPayload {
  id: string;
  brand: string;
  name: string;
  year: number;
  lot?: string;
  numberPlate?: string;
  price: string;
  rawPrice: number;
  highestBid: string;
  rawHighestBid: number;
  location: string;
  category: "bike" | "scooter";
  image: string;
  images: string[];
  specs: {
    mileage: string;
    engine: string;
    owners: string;
    condition: string;
  };
  sellerNote?: string;
  createdAt: string;
}

// In-memory store for session persistence
let postingsStore: VehiclePostingPayload[] = [
  {
    id: "post-r15-1",
    brand: "Yamaha",
    name: "Yamaha YZF R15 V3 Dark Knight",
    year: 2022,
    numberPlate: "BA 02 PA 4521",
    price: "NPR 3,45,000",
    rawPrice: 345000,
    highestBid: "NPR 3,20,000",
    rawHighestBid: 320000,
    location: "Baneshwor, Kathmandu",
    category: "bike",
    image: "/r15.png",
    images: ["/r15.png"],
    specs: {
      mileage: "18,400 km",
      engine: "155 cc",
      owners: "1st Owner",
      condition: "Like New",
    },
    sellerNote: "Single hand, regular servicing at Morang Auto Works showroom, bluebook tax paid up to 2082/83.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "post-duke-2",
    brand: "KTM",
    name: "KTM Duke 250 ABS BS6",
    year: 2021,
    numberPlate: "BA 99 PA 7890",
    price: "NPR 4,10,000",
    rawPrice: 410000,
    highestBid: "NPR 3,85,000",
    rawHighestBid: 385000,
    location: "Kupandole, Lalitpur",
    category: "bike",
    image: "/duke.png",
    images: ["/duke.png"],
    specs: {
      mileage: "22,100 km",
      engine: "248.8 cc",
      owners: "1st Owner",
      condition: "Excellent",
    },
    sellerNote: "Metzeler rear tyre recently replaced, zero engine work needed, clean bluebook.",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  let results = [...postingsStore];

  if (category && category !== "all") {
    results = results.filter((p) => p.category === category);
  }

  if (search) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.location.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    data: results,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, name, year, price, location, category, specs, sellerNote, numberPlate, images } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required vehicle information: name and price" },
        { status: 400 }
      );
    }

    const rawPrice = Number(String(price).replace(/[^0-9]/g, "")) || 0;

    const newPosting: VehiclePostingPayload = {
      id: `post_${Date.now()}`,
      brand: brand || "Two-Wheeler",
      name: String(name),
      year: Number(year) || 2022,
      numberPlate: numberPlate ? String(numberPlate) : undefined,
      price: typeof price === "number" ? `NPR ${price.toLocaleString("en-IN")}` : String(price),
      rawPrice: rawPrice,
      highestBid: "No bids yet",
      rawHighestBid: 0,
      location: String(location || "Kathmandu Valley"),
      category: category === "scooter" ? "scooter" : "bike",
      image: images?.[0] || "/r15.png",
      images: Array.isArray(images) && images.length > 0 ? images : ["/r15.png"],
      specs: {
        mileage: specs?.mileage || "N/A",
        engine: specs?.engine || "N/A",
        owners: specs?.owners || "1st Owner",
        condition: specs?.condition || "Good",
      },
      sellerNote: sellerNote ? String(sellerNote) : undefined,
      createdAt: new Date().toISOString(),
    };

    postingsStore.unshift(newPosting);

    return NextResponse.json(
      {
        success: true,
        message: "Vehicle posting created successfully and queued for live dealer auction",
        data: newPosting,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create vehicle posting", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}