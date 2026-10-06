"use client";

import React, { useState, useMemo } from "react";

export interface MarketplaceBike {
  id: string;
  name: string;
  year: string;
  mileage: string;
  lotNumber: string;
  nepaliPlate?: string;
  location: string;
  condition: string;
  paperwork: string;
  highestBid: string;
  timeLeft: string;
  imageUrl: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  bluebookStatus: string;
  taxValidTill: string;
  engineCondition: string;
  simpleHowItRuns: string;
  isTrending?: boolean;
  bidCount?: number;
  hypeBadge?: string;
  notes?: string;
}

interface LiveMarketplaceSectionProps {
  bikes: MarketplaceBike[];
  isAuthorized?: boolean;
  onSelectBike: (bike: MarketplaceBike) => void;
  onOpenDirectPost: () => void;
  onEnterShowroomBidding: () => void;
}

const BRAND_PILLS = [
  { id: "all", label: "All Vehicles" },
  { id: "yamaha", label: "Yamaha" },
  { id: "bajaj", label: "Bajaj" },
  { id: "ktm", label: "KTM" },
  { id: "enfield", label: "Royal Enfield" },
  { id: "honda", label: "Honda" },
];

export default function LiveMarketplaceSection({
  bikes,
  isAuthorized = false,
  onSelectBike,
  onOpenDirectPost,
  onEnterShowroomBidding,
}: LiveMarketplaceSectionProps) {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBikes = useMemo(() => {
    return bikes.filter((bike) => {
      // Brand filter
      if (selectedBrand !== "all") {
        const lower = bike.name.toLowerCase();
        if (selectedBrand === "yamaha" && !lower.includes("yamaha")) return false;
        if (selectedBrand === "bajaj" && !lower.includes("bajaj") && !lower.includes("pulsar")) return false;
        if (selectedBrand === "ktm" && !lower.includes("ktm")) return false;
        if (selectedBrand === "enfield" && !lower.includes("enfield") && !lower.includes("bullet") && !lower.includes("classic")) return false;
        if (selectedBrand === "honda" && !lower.includes("honda") && !lower.includes("dio")) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          bike.name.toLowerCase().includes(q) ||
          bike.location.toLowerCase().includes(q) ||
          bike.lotNumber.toLowerCase().includes(q) ||
          bike.year.toLowerCase().includes(q) ||
          (bike.nepaliPlate && bike.nepaliPlate.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [bikes, selectedBrand, searchQuery]);

  // If user is NOT logged in as staff or recondition owner, do not show live vehicle postings or section at all
  if (!isAuthorized) {
    return null;
  }

  return (
    <section id="live-floor" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-16 scroll-mt-20">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5B869] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Authorized Floor • Staff &amp; Showrooms Only</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Live Vehicle Postings
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
            Browse bikes currently receiving verified showroom offers. Filter by brand or search specific lots across the valley.
          </p>
        </div>

        {/* Action Button: Post bike into exchange */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDirectPost}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(229,184,105,0.3)] transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 4v16m8-8H4" />
            </svg>
            <span>List Your Bike Here</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 rounded-2xl bg-[#14161e] border border-white/10 mb-8">
        {/* Brand Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {BRAND_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedBrand(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedBrand === pill.id
                  ? "bg-[#E5B869] text-black shadow-md"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search model, lot (e.g. Ba 92 Pa), location..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5B869] transition-colors"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredBikes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/15 rounded-3xl bg-white/[0.02] space-y-3">
          <p className="text-sm text-neutral-300 font-semibold">No vehicle listings match your criteria.</p>
          <p className="text-xs text-neutral-500">Try clearing filters or post the first bike of this model!</p>
          <button
            type="button"
            onClick={onOpenDirectPost}
            className="mt-2 px-4 py-2 rounded-xl bg-[#E5B869] text-black font-extrabold text-xs"
          >
            Post Bike Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredBikes.map((bike) => (
            <div
              key={bike.id}
              className="group min-w-0 rounded-2xl sm:rounded-3xl bg-[#14161e] border border-white/10 hover:border-[#E5B869]/40 shadow-xl hover:shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bike.imageUrl}
                  alt={bike.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1.5">
                  <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[9px] sm:text-[11px] font-mono font-bold text-[#E5B869] truncate">
                    {bike.lotNumber}
                  </span>
                  {bike.isTrending && (
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      Trending
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between gap-2 text-white text-xs">
                  <span className="font-semibold text-neutral-300 text-[10px] sm:text-xs truncate">{bike.location}</span>
                  <span className="hidden sm:inline text-[11px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                    Tax Paid {bike.taxValidTill}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] sm:text-lg font-bold text-white group-hover:text-[#E5B869] transition-colors line-clamp-1 min-w-0">
                      {bike.name}
                    </h3>
                    <span className="hidden sm:inline text-xs font-mono text-neutral-400 shrink-0">
                      {bike.year}
                    </span>
                  </div>
                  <p className="sm:hidden text-[10px] text-neutral-400 mt-0.5 truncate">
                    {bike.year} · {bike.mileage}
                  </p>
                  <p className="hidden sm:block text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {bike.simpleHowItRuns || "Verified engine sound, clean chassis frame, original bluebook on hand."}
                  </p>
                </div>

                {/* Specs Row */}
                <div className="hidden sm:grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Odometer</span>
                    <span className="font-bold text-neutral-200">{bike.mileage}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Condition</span>
                    <span className="font-bold text-neutral-200">{bike.condition}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Bids</span>
                    <span className="font-bold text-[#E5B869]">{bike.bidCount || 3} Offers</span>
                  </div>
                </div>

                {/* Highest Standing Bid & Action */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-semibold block">Standing Offer</span>
                    <span className="text-sm sm:text-lg font-black text-white block truncate">
                      {bike.highestBid}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBike(bike)}
                    className="w-full sm:w-auto justify-center px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-[#E5B869] hover:text-black text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Inspect</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Showroom Network CTA Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181a24] via-[#14161f] to-[#121318] border border-[#E5B869]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="text-xs font-bold text-[#E5B869] uppercase tracking-wider">
            Licensed Recondition Showrooms Only
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-white">
            Want to bid wholesale on all incoming Kathmandu stock?
          </h3>
          <p className="text-xs text-neutral-400 max-w-lg">
            Access confidential bidding, swipe evaluation decks, and mechanic war rooms with verified PAN authentication.
          </p>
        </div>

        <button
          type="button"
          onClick={onEnterShowroomBidding}
          className="px-6 py-3.5 rounded-full bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(229,184,105,0.4)] shrink-0"
        >
          Enter Showroom Hub
        </button>
      </div>
    </section>
  );
}
