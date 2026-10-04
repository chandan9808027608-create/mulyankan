import { NextRequest, NextResponse } from "next/server";
import { calculateVehicleValuation, ValuationInput } from "@/app/lib/valuationEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brand, model, year, mileageKm, ownership, condition, taxStatus } = body;

    if (!brand || !model || !year) {
      return NextResponse.json(
        { error: "Missing required fields: brand, model, year" },
        { status: 400 }
      );
    }

    const input: ValuationInput = {
      brand: String(brand),
      model: String(model),
      year: Number(year) || 2022,
      mileageKm: Number(mileageKm) || 15000,
      ownership: (ownership as ValuationInput["ownership"]) || "1st",
      condition: (condition as ValuationInput["condition"]) || "good",
      taxStatus: (taxStatus as ValuationInput["taxStatus"]) || "cleared",
    };

    const valuation = calculateVehicleValuation(input);

    return NextResponse.json({
      success: true,
      data: valuation,
      meta: {
        timestamp: new Date().toISOString(),
        currency: "NPR",
        region: "Bagmati Province / Kathmandu Valley",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to compute valuation", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
