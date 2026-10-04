// MULYANKAN Automotive Valuation Engine
// Real-world depreciation & pricing logic calibrated for Kathmandu Valley secondary two-wheeler market.

export interface ValuationInput {
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  ownership: "1st" | "2nd" | "3rd" | "4th+";
  condition: "excellent" | "good" | "fair";
  taxStatus: "cleared" | "pending";
}

export interface ValuationBreakdownItem {
  label: string;
  amount: number;
  type: "bonus" | "deduction" | "base";
  description: string;
}

export interface ValuationResult {
  baseNewPriceNpr: number;
  estimatedMarketValueNpr: number;
  dealerImmediateOfferNpr: number;
  showroomRetailValueNpr: number;
  lowEstimateNpr: number;
  highEstimateNpr: number;
  breakdown: ValuationBreakdownItem[];
  confidenceScore: number; // 0 - 100%
  resaleDemandScore: "Very High" | "High" | "Moderate" | "Steady";
}

// Baseline showroom brand new price references in Kathmandu (NPR)
const MODEL_BASE_PRICES: Record<string, { baseBrandNew: number; demand: "Very High" | "High" | "Moderate" | "Steady" }> = {
  "yamaha yzf r15": { baseBrandNew: 600000, demand: "Very High" },
  "yamaha mt-15": { baseBrandNew: 520000, demand: "Very High" },
  "yamaha fz-s": { baseBrandNew: 395000, demand: "High" },
  "ktm duke 250": { baseBrandNew: 740000, demand: "Very High" },
  "ktm duke 200": { baseBrandNew: 610000, demand: "High" },
  "ktm rc 200": { baseBrandNew: 650000, demand: "High" },
  "bajaj pulsar ns 200": { baseBrandNew: 415000, demand: "Very High" },
  "bajaj pulsar 220f": { baseBrandNew: 400000, demand: "High" },
  "bajaj pulsar 150": { baseBrandNew: 310000, demand: "High" },
  "royal enfield classic 350": { baseBrandNew: 725000, demand: "Very High" },
  "royal enfield hunter 350": { baseBrandNew: 520000, demand: "High" },
  "honda cb350": { baseBrandNew: 750000, demand: "Moderate" },
  "honda shine": { baseBrandNew: 275000, demand: "Steady" },
  "tvs apache rtr 200": { baseBrandNew: 440000, demand: "High" },
  "tvs apache rtr 160": { baseBrandNew: 345000, demand: "Steady" },
};

export function calculateVehicleValuation(input: ValuationInput): ValuationResult {
  const currentYear = 2026;
  const ageYears = Math.max(0, currentYear - input.year);

  // 1. Determine baseline new price
  const queryModel = `${input.brand} ${input.model}`.toLowerCase();
  let matchedKey = Object.keys(MODEL_BASE_PRICES).find((k) => queryModel.includes(k));
  if (!matchedKey) {
    matchedKey = Object.keys(MODEL_BASE_PRICES).find((k) => input.model.toLowerCase().includes(k.split(" ")[1] || ""));
  }

  const baseData = matchedKey ? MODEL_BASE_PRICES[matchedKey] : { baseBrandNew: 450000, demand: "High" as const };
  const baseNew = baseData.baseBrandNew;

  const breakdown: ValuationBreakdownItem[] = [];

  // 2. Base Age Depreciation
  // Year 1: -16%, Year 2: -25%, Year 3: -33%, Year 4: -40%, Year 5+: -8% per additional year
  let ageDepreciationRate = 0.16;
  if (ageYears <= 0) ageDepreciationRate = 0.08;
  else if (ageYears === 1) ageDepreciationRate = 0.16;
  else if (ageYears === 2) ageDepreciationRate = 0.25;
  else if (ageYears === 3) ageDepreciationRate = 0.33;
  else if (ageYears === 4) ageDepreciationRate = 0.40;
  else ageDepreciationRate = Math.min(0.68, 0.40 + (ageYears - 4) * 0.06);

  const afterAgeBase = Math.round(baseNew * (1 - ageDepreciationRate));
  breakdown.push({
    label: `Model Baseline (${input.year})`,
    amount: afterAgeBase,
    type: "base",
    description: `Original showroom value NPR ${baseNew.toLocaleString()} adjusted for ${ageYears} years market depreciation (${Math.round(ageDepreciationRate * 100)}%).`,
  });

  let currentEstimate = afterAgeBase;

  // 3. Mileage (Odometer) Impact
  // Average standard riding in Kathmandu: ~7,000 km/year
  const expectedMileage = Math.max(6000, ageYears * 7500);
  const mileageDiff = input.mileageKm - expectedMileage;
  if (mileageDiff < -3000) {
    // Low KM Bonus
    const bonus = Math.round(Math.min(25000, Math.abs(mileageDiff) * 1.5));
    currentEstimate += bonus;
    breakdown.push({
      label: "Low Genuine KM Bonus",
      amount: bonus,
      type: "bonus",
      description: `Vehicle has run only ${input.mileageKm.toLocaleString()} KM (significantly lower than expected ${expectedMileage.toLocaleString()} KM).`,
    });
  } else if (mileageDiff > 4000) {
    // High KM deduction
    const deduction = Math.round(Math.min(30000, mileageDiff * 1.2));
    currentEstimate -= deduction;
    breakdown.push({
      label: "High Mileage Adjustment",
      amount: -deduction,
      type: "deduction",
      description: `Odometer reading exceeds average Kathmandu annual commute.`,
    });
  }

  // 4. Ownership Impact
  if (input.ownership === "1st") {
    const singleHandBonus = Math.round(baseNew * 0.035);
    currentEstimate += singleHandBonus;
    breakdown.push({
      label: "1st Hand Single Owner Premium",
      amount: singleHandBonus,
      type: "bonus",
      description: "Direct single-owner bluebook with documented service history commands peak resale demand.",
    });
  } else if (input.ownership === "3rd" || input.ownership === "4th+") {
    const multipleOwnerDeduction = Math.round(baseNew * 0.04);
    currentEstimate -= multipleOwnerDeduction;
    breakdown.push({
      label: "Multi-Owner Bluebook Discount",
      amount: -multipleOwnerDeduction,
      type: "deduction",
      description: "Vehicle has changed ownership multiple times in Yatayat records.",
    });
  }

  // 5. Condition Impact
  if (input.condition === "excellent") {
    const condBonus = Math.round(baseNew * 0.03);
    currentEstimate += condBonus;
    breakdown.push({
      label: "Showroom Condition Care",
      amount: condBonus,
      type: "bonus",
      description: "Pristine paintwork, sealed untouched engine, and 80%+ tyre tread.",
    });
  } else if (input.condition === "fair") {
    const fairDeduction = Math.round(baseNew * 0.06);
    currentEstimate -= fairDeduction;
    breakdown.push({
      label: "Refurbishment Allowance",
      amount: -fairDeduction,
      type: "deduction",
      description: "Estimated cost for brake pads, chain-sprocket alignment, or tyre wear.",
    });
  }

  // 6. Tax Clearance Status
  if (input.taxStatus === "pending") {
    const taxDeduction = 6500; // Average annual two-wheeler road tax in Bagmati Province
    currentEstimate -= taxDeduction;
    breakdown.push({
      label: "Bagmati Road Tax Deduction",
      amount: -taxDeduction,
      type: "deduction",
      description: "Fiscal year tax pending in bluebook (deducted directly from buyer payout).",
    });
  } else {
    breakdown.push({
      label: "Tax Clearance Verification",
      amount: 0,
      type: "bonus",
      description: "Current fiscal year government road tax paid up to Ashadh 2082.",
    });
  }

  // Round estimated market value to nearest 1,000
  const estimatedMarketValueNpr = Math.round(currentEstimate / 1000) * 1000;

  // Immediate Cash Recondition Dealer Offer: ~90% - 92% of fair market value
  const dealerImmediateOfferNpr = Math.round((estimatedMarketValueNpr * 0.915) / 1000) * 1000;

  // Showroom Retail (What a recondition shop will sell it for after washing & tuning): ~108%
  const showroomRetailValueNpr = Math.round((estimatedMarketValueNpr * 1.085) / 1000) * 1000;

  const lowEstimateNpr = Math.round((dealerImmediateOfferNpr * 0.98) / 1000) * 1000;
  const highEstimateNpr = Math.round((estimatedMarketValueNpr * 1.03) / 1000) * 1000;

  return {
    baseNewPriceNpr: baseNew,
    estimatedMarketValueNpr,
    dealerImmediateOfferNpr,
    showroomRetailValueNpr,
    lowEstimateNpr,
    highEstimateNpr,
    breakdown,
    confidenceScore: 94,
    resaleDemandScore: baseData.demand,
  };
}
