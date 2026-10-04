"use client";

import React, { useState, useMemo } from "react";
import { calculateVehicleValuation } from "./valuationEngine";

interface ValuationCalculatorWidgetProps {
  initialBrand?: string;
  initialModel?: string;
  initialYear?: number;
  initialMileage?: number;
  onProceedToAuction?: (valuationData: {
    model: string;
    year: number;
    estimatedValue: number;
    dealerOffer: number;
  }) => void;
}

export const ValuationCalculatorWidget = React.memo(function ValuationCalculatorWidget({
  initialBrand = "Yamaha",
  initialModel = "Yamaha YZF R15",
  initialYear = 2023,
  initialMileage = 8200,
  onProceedToAuction,
}: ValuationCalculatorWidgetProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);
  const [year, setYear] = useState(initialYear);
  const [mileageKm, setMileageKm] = useState(initialMileage);
  const [ownership, setOwnership] = useState<"1st" | "2nd" | "3rd" | "4th+">("1st");
  const [condition, setCondition] = useState<"excellent" | "good" | "fair">("excellent");
  const [taxStatus, setTaxStatus] = useState<"cleared" | "pending">("cleared");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Available Kathmandu models by brand
  const modelOptions: Record<string, string[]> = {
    Yamaha: ["Yamaha YZF R15", "Yamaha MT-15", "Yamaha FZ-S"],
    KTM: ["KTM Duke 250", "KTM Duke 200", "KTM RC 200"],
    Bajaj: ["Bajaj Pulsar NS 200", "Bajaj Pulsar 220F", "Bajaj Pulsar 150"],
    "Royal Enfield": ["Royal Enfield Classic 350", "Royal Enfield Hunter 350"],
    Honda: ["Honda CB350", "Honda Shine"],
    TVS: ["TVS Apache RTR 200", "TVS Apache RTR 160"],
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const available = modelOptions[newBrand];
    if (available && available.length > 0) {
      setModel(available[0]);
    }
  };

  const valuation = useMemo(() => {
    return calculateVehicleValuation({
      brand,
      model,
      year: Number(year),
      mileageKm: Number(mileageKm) || 5000,
      ownership,
      condition,
      taxStatus,
    });
  }, [brand, model, year, mileageKm, ownership, condition, taxStatus]);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-[#14161f] border border-[#E5B869]/30 p-4 sm:p-7 lg:p-8 shadow-2xl space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4 sm:pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869] shadow-[0_0_15px_rgba(229,184,105,0.3)] shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-white tracking-wide">
              Live Motorcycle Valuation Engine
            </h3>
            <p className="text-xs text-neutral-400">
              Calibrated with authentic Kathmandu Valley recondition market demand &amp; depreciation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {valuation.confidenceScore}% Accuracy Index
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            Demand: {valuation.resaleDemandScore}
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left 6 Cols: Interactive Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Brand */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Make / Brand
              </label>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869] cursor-pointer"
              >
                {Object.keys(modelOptions).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Vehicle Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869] cursor-pointer"
              >
                {(modelOptions[brand] || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Registration Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Registration Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869] cursor-pointer"
              >
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                  <option key={y} value={y}>
                    {y} Model
                  </option>
                ))}
              </select>
            </div>

            {/* Mileage */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Odometer Reading (KM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={mileageKm}
                  onChange={(e) => setMileageKm(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869]"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-neutral-400 font-bold pointer-events-none">
                  KM
                </span>
              </div>
            </div>
          </div>

          {/* Ownership & Condition Pills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300">
              Bluebook Ownership
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["1st", "2nd", "3rd", "4th+"] as const).map((own) => (
                <button
                  key={own}
                  type="button"
                  onClick={() => setOwnership(own)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    ownership === own
                      ? "bg-[#E5B869] text-black border-[#E5B869] shadow"
                      : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/30"
                  }`}
                >
                  {own} Hand
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Condition */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Physical Condition
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["excellent", "good", "fair"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold capitalize transition-all cursor-pointer border ${
                      condition === c
                        ? "bg-[#E5B869] text-black border-[#E5B869] shadow"
                        : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Tax status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Bagmati Road Tax
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTaxStatus("cleared")}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                    taxStatus === "cleared"
                      ? "bg-emerald-500 text-black border-emerald-500 shadow"
                      : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/30"
                  }`}
                >
                  Paid 2081/82
                </button>
                <button
                  type="button"
                  onClick={() => setTaxStatus("pending")}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                    taxStatus === "pending"
                      ? "bg-red-500 text-white border-red-500 shadow"
                      : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/30"
                  }`}
                >
                  Pending Due
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Dynamic Valuation Result & Visual Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#181a26] to-[#10121a] border border-[#E5B869]/40 p-5 sm:p-6 space-y-5 shadow-xl">
            {/* Fair Market Value Highlight */}
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Fair Market Resale Valuation
              </span>
              <div className="flex flex-wrap items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  NPR {valuation.estimatedMarketValueNpr.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  (Estimated Handover)
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Range: NPR {valuation.lowEstimateNpr.toLocaleString()} – NPR {valuation.highEstimateNpr.toLocaleString()}
              </p>
            </div>

            {/* 3-Tier Comparison Box (Quick Cash vs Private Resale vs Showroom) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 font-medium block">
                  Quick Cash Deal
                </span>
                <p className="text-sm sm:text-base font-bold text-[#E5B869]">
                  NPR {valuation.dealerImmediateOfferNpr.toLocaleString()}
                </p>
                <span className="text-[9px] text-neutral-500 block">Same-day payout</span>
              </div>

              <div className="p-3 rounded-xl bg-[#E5B869]/15 border border-[#E5B869]/40 space-y-1 ring-1 ring-[#E5B869]/30">
                <span className="text-[10px] text-[#E5B869] font-bold block">
                  Live Auction Bid
                </span>
                <p className="text-sm sm:text-base font-extrabold text-white">
                  NPR {valuation.estimatedMarketValueNpr.toLocaleString()}
                </p>
                <span className="text-[9px] text-emerald-400 font-medium block">150+ Dealers Compete</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-neutral-400 font-medium block">
                  Showroom Retail
                </span>
                <p className="text-sm sm:text-base font-bold text-neutral-300">
                  NPR {valuation.showroomRetailValueNpr.toLocaleString()}
                </p>
                <span className="text-[9px] text-neutral-500 block">After showroom prep</span>
              </div>
            </div>

            {/* Breakdown Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowBreakdown((prev) => !prev)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>View Mathematical Depreciation Breakdown</span>
                <span>{showBreakdown ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {showBreakdown && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs">
                  {valuation.breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-neutral-400">{item.description}</p>
                      </div>
                      <span
                        className={`font-bold ml-2 shrink-0 ${
                          item.type === "bonus"
                            ? "text-emerald-400"
                            : item.type === "deduction"
                            ? "text-red-400"
                            : "text-[#E5B869]"
                        }`}
                      >
                        {item.type === "bonus" && item.amount > 0 && "+"}
                        {item.amount !== 0 ? `NPR ${item.amount.toLocaleString()}` : "Verified"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call To Action Button */}
            <button
              type="button"
              onClick={() => {
                if (onProceedToAuction) {
                  onProceedToAuction({
                    model,
                    year,
                    estimatedValue: valuation.estimatedMarketValueNpr,
                    dealerOffer: valuation.dealerImmediateOfferNpr,
                  });
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(229,184,105,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Submit for Live Dealer Bidding at This Valuation</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
