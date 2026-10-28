"use client";

import React, { useMemo, useState } from "react";
import type { ReelVehicle } from "./VehicleReelsFeed";
import { BOOKMARK_PATH } from "./VehicleReelsFeed";
import { timeAgo } from "./dealerBidsData";
import { parseNpr, useLikedBikes } from "./likedBikes";

const KNOWN_BRANDS = [
  "Yamaha", "Honda", "Bajaj", "KTM", "Royal Enfield", "TVS", "Hero", "Suzuki",
  "Kawasaki", "Aprilia", "Vespa", "Benelli", "Husqvarna", "CFMoto", "Crossfire", "Niu", "Yadea",
];

export const brandOf = (name: string) =>
  KNOWN_BRANDS.find((b) => name.toLowerCase().includes(b.toLowerCase())) || "Other";

type SortKey = "new" | "cheap" | "offers";

interface BikesExploreProps {
  vehicles: ReelVehicle[];
  /** Open the full-screen viewer on `list[index]` */
  onOpen: (list: ReelVehicle[], index: number) => void;
}

// Browse all bikes: search, brand filter, sort, and a grid of bike cards.
export const BikesExplore = React.memo(function BikesExplore({ vehicles, onOpen }: BikesExploreProps) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState<SortKey>("new");
  const { liked } = useLikedBikes();

  // Only show brand chips for brands that actually have bikes
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of vehicles) counts.set(brandOf(v.name), (counts.get(brandOf(v.name)) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  }, [vehicles]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = vehicles.filter((v) => {
      if (brand !== "All" && brandOf(v.name) !== brand) return false;
      if (!q) return true;
      return [v.name, v.location, v.lotNumber].some((s) => s?.toLowerCase().includes(q));
    });
    if (sort === "cheap") list.sort((a, b) => parseNpr(a.highestBid) - parseNpr(b.highestBid));
    else if (sort === "offers") list.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
    else list.sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));
    return list;
  }, [vehicles, query, brand, sort]);

  const chip = (active: boolean) =>
    `shrink-0 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
      active ? "bg-[#E5B869] border-[#E5B869] text-black" : "bg-transparent border-white/15 text-neutral-300 hover:border-white/30"
    }`;

  return (
    <div className="h-full overflow-y-auto bg-[#0d0e12]">
      {/* Sticky search + filters */}
      <div className="sticky top-0 z-10 bg-[#0d0e12]/95 backdrop-blur border-b border-white/5 pt-4 pb-3 space-y-3">
        <div className="px-4 max-w-5xl mx-auto flex items-end justify-between">
          <h1 className="text-xl font-black text-white">All bikes</h1>
          <span className="text-xs text-neutral-500">{results.length} found</span>
        </div>

        <div className="px-4 max-w-5xl mx-auto">
          <label className="flex items-center gap-2 h-11 px-3.5 rounded-xl bg-[#16171d] border border-white/10 focus-within:border-[#E5B869]/60">
            <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, place or number plate"
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-neutral-400 text-lg leading-none cursor-pointer" aria-label="Clear">
                ×
              </button>
            )}
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 max-w-5xl mx-auto">
          {["All", ...brands].map((b) => (
            <button key={b} type="button" onClick={() => setBrand(b)} className={chip(brand === b)}>
              {b}
            </button>
          ))}
        </div>

        <div className="px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-[#16171d] border border-white/10 text-xs">
            {([
              ["new", "Newest"],
              ["cheap", "Cheapest"],
              ["offers", "Most offers"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={`py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${sort === key ? "bg-white/10 text-white" : "text-neutral-500"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="px-6 py-20 text-center space-y-2">
          <p className="text-base font-bold text-white">{vehicles.length === 0 ? "No bikes yet" : "No bikes found"}</p>
          <p className="text-xs text-neutral-400">
            {vehicles.length === 0 ? "New bikes show up here as soon as sellers add them." : "Try another word or brand."}
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {results.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onOpen(results, idx)}
              className="text-left cursor-pointer group rounded-2xl overflow-hidden bg-[#16171d] border border-white/10 hover:border-[#E5B869]/40 transition-colors"
            >
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imageUrl} alt={v.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {liked[v.id] && (
                  <span className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#E5B869] text-black flex items-center justify-center" title="Saved">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d={BOOKMARK_PATH} />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-2.5 space-y-1">
                <p className="text-sm font-black text-[#E5B869] leading-none">{v.highestBid}</p>
                <p className="text-xs font-semibold text-white truncate">{v.name}</p>
                <p className="text-[10px] text-neutral-500 truncate">
                  {v.location}
                  {v.createdAt ? ` • ${timeAgo(v.createdAt)}` : ""}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {v.bidCount || 0} {v.bidCount === 1 ? "offer" : "offers"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
