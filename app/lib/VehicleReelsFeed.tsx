"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BidRecord } from "./dealerBidsData";
import { timeAgo } from "./dealerBidsData";
import { useLikedBikes } from "./likedBikes";
import { PhotoSlider } from "./PhotoSlider";

export interface ReelVehicle {
  id: string;
  name: string;
  lotNumber: string;
  mileage: string;
  location: string;
  condition: string;
  paperwork: string;
  highestBid: string;
  imageUrl: string;
  images: { url: string; label: string }[];
  notes?: string;
  bidCount?: number;
  createdAt?: string;
}

interface VehicleReelsFeedProps {
  vehicles: ReelVehicle[];
  bids: BidRecord[];
  showroomName: string;
  onBid: (vehicle: ReelVehicle) => void;
  onDetails: (vehicle: ReelVehicle) => void;
  onShareToStaff: (vehicle: ReelVehicle) => void;
  /** Start on this vehicle (used when opening from the Bikes grid) */
  initialIndex?: number;
  /** Shows a back arrow in the top-left when set */
  onClose?: () => void;
  /** Shows a search icon in the top-right when set */
  onSearch?: () => void;
}

export const BOOKMARK_PATH = "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z";

// Full-screen vertical feed: one vehicle per screen, scroll up/down to move
// between vehicles, swipe left/right on a vehicle to flip through its photos.
export const VehicleReelsFeed = React.memo(function VehicleReelsFeed({
  vehicles,
  bids,
  showroomName,
  onBid,
  onDetails,
  onShareToStaff,
  initialIndex = 0,
  onClose,
  onSearch,
}: VehicleReelsFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const { liked, toggleLike, like } = useLikedBikes();

  // Jump straight to the chosen vehicle before the first paint
  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (root && initialIndex > 0) root.scrollTop = initialIndex * root.clientHeight;
  }, [initialIndex]);

  // Vehicles that arrived while the user was scrolled down get a "new" pill
  const seenIds = useRef<Set<string> | null>(null);
  const [newCount, setNewCount] = useState(0);
  useEffect(() => {
    if (!seenIds.current) {
      seenIds.current = new Set(vehicles.map((v) => v.id));
      return;
    }
    const fresh = vehicles.filter((v) => !seenIds.current!.has(v.id));
    fresh.forEach((v) => seenIds.current!.add(v.id));
    if (fresh.length > 0 && (scrollerRef.current?.scrollTop ?? 0) > 50) {
      setNewCount((n) => n + fresh.length);
    }
  }, [vehicles]);

  // Track which vehicle is on screen
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(idx);
            if (idx === 0) setNewCount(0);
          }
        }
      },
      { root, threshold: 0.6 }
    );
    root.querySelectorAll("[data-reel]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [vehicles]);

  const scrollToIndex = (idx: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    const clamped = Math.max(0, Math.min(vehicles.length - 1, idx));
    root.scrollTo({ top: clamped * root.clientHeight, behavior: "smooth" });
  };

  // Arrow keys / J-K move between vehicles on desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [role=dialog]")) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const topBar = (
    <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-2 px-3 pt-3 pointer-events-none">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto w-10 h-10 rounded-xl bg-[#0d0e12]/70 backdrop-blur border border-white/10 text-white flex items-center justify-center cursor-pointer"
          aria-label="Back"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      ) : (
        <span className="px-3 py-1.5 rounded-xl bg-[#0d0e12]/70 backdrop-blur border border-white/10 text-sm font-black tracking-tight text-[#E5B869]">
          Mulyankan
        </span>
      )}

      {vehicles.length > 0 && (
        <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d0e12]/70 backdrop-blur border border-white/10 text-[11px] font-semibold text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
          <span className="text-neutral-400 font-mono">
            {activeIndex + 1}/{vehicles.length}
          </span>
        </span>
      )}

      {onSearch ? (
        <button
          type="button"
          onClick={onSearch}
          className="pointer-events-auto w-10 h-10 rounded-xl bg-[#0d0e12]/70 backdrop-blur border border-white/10 text-white flex items-center justify-center cursor-pointer"
          aria-label="Search bikes"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>
      ) : (
        <span className="w-10" />
      )}
    </div>
  );

  if (vehicles.length === 0) {
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-3 bg-[#0d0e12] text-center px-6">
        {topBar}
        <div className="w-14 h-14 rounded-2xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center text-[#E5B869]">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white">No bikes yet</h3>
        <p className="text-xs text-neutral-400 max-w-xs">New bikes show up here as soon as sellers add them.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#0d0e12] flex justify-center">
      {topBar}

      {newCount > 0 && (
        <button
          type="button"
          onClick={() => {
            scrollToIndex(0);
            setNewCount(0);
          }}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-xl bg-[#E5B869] text-black text-xs font-bold shadow-lg cursor-pointer"
        >
          ↑ {newCount} new {newCount === 1 ? "bike" : "bikes"}
        </button>
      )}

      <div
        ref={scrollerRef}
        className="h-full w-full max-w-[520px] overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-contain"
      >
        {vehicles.map((v, idx) => (
          <ReelItem
            key={v.id}
            index={idx}
            vehicle={v}
            bids={bids}
            showroomName={showroomName}
            isNear={Math.abs(idx - activeIndex) <= 1}
            isSaved={!!liked[v.id]}
            onToggleSave={() => toggleLike(v.id)}
            onDoubleTapSave={() => like(v.id)}
            onBid={onBid}
            onDetails={onDetails}
            onShareToStaff={onShareToStaff}
          />
        ))}
      </div>

      {/* Desktop up/down buttons */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
          title="Previous bike (↑)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === vehicles.length - 1}
          className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
          title="Next bike (↓)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
});

interface ReelItemProps {
  index: number;
  vehicle: ReelVehicle;
  bids: BidRecord[];
  showroomName: string;
  isNear: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
  onDoubleTapSave: () => void;
  onBid: (vehicle: ReelVehicle) => void;
  onDetails: (vehicle: ReelVehicle) => void;
  onShareToStaff: (vehicle: ReelVehicle) => void;
}

function ReelItem({
  index,
  vehicle,
  bids,
  showroomName,
  isNear,
  isSaved,
  onToggleSave,
  onDoubleTapSave,
  onBid,
  onDetails,
  onShareToStaff,
}: ReelItemProps) {
  const photos = vehicle.images.length > 0 ? vehicle.images : [{ url: vehicle.imageUrl, label: "" }];
  // Double-tap the photo to save it, with a badge that pops where you tapped
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const [pops, setPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const handleTap = (e: React.PointerEvent) => {
    const now = Date.now();
    const prev = lastTap.current;
    if (now - prev.t < 300 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 40) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pop = { id: now, x: e.clientX - rect.left, y: e.clientY - rect.top };
      setPops((p) => [...p, pop]);
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== pop.id)), 800);
      onDoubleTapSave();
      lastTap.current = { t: 0, x: 0, y: 0 };
    } else {
      lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    }
  };

  const leadingBid = bids.find((b) => b.bikeId === vehicle.id && (b.status === "active" || b.status === "accepted"));
  const youLead = leadingBid?.dealerName === showroomName;
  const sold = leadingBid?.status === "accepted";

  return (
    <section data-reel data-index={index} className="relative h-full w-full snap-start snap-always overflow-hidden bg-[#0d0e12] flex flex-col">
      {/* Photo area sits above the deal card so nothing covers the bike */}
      <div className="relative flex-1 min-h-0">
      <PhotoSlider photos={photos} alt={vehicle.name} hidden={!isNear} imgClassName="pt-14" onTap={handleTap}>
      {/* Double-tap save badges */}
      {pops.map((p) => (
        <span
          key={p.id}
          className="save-pop pointer-events-none absolute z-20 w-20 h-20 rounded-2xl bg-[#E5B869] text-black flex items-center justify-center shadow-2xl"
          style={{ left: p.x, top: p.y }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <path d={BOOKMARK_PATH} />
          </svg>
        </span>
      ))}

      </PhotoSlider>
      </div>

      {/* Deal card */}
      <div className="relative z-10 shrink-0 px-3 pt-1 pb-3">
        <div className="rounded-3xl bg-[#16171d] border border-white/10 p-3.5 space-y-2.5 shadow-2xl">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => onDetails(vehicle)} className="flex-1 min-w-0 text-left cursor-pointer">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {sold ? (
                  <span className="px-2 py-0.5 rounded-md bg-neutral-600 text-white text-[10px] font-bold uppercase">Sold</span>
                ) : youLead ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold uppercase">You lead</span>
                ) : null}
                {vehicle.createdAt && <span className="text-[11px] text-neutral-400">{timeAgo(vehicle.createdAt)}</span>}
              </div>
              <h2 className="text-lg font-black text-white leading-tight truncate">{vehicle.name}</h2>
              <p className="text-xs text-neutral-400 truncate">
                {vehicle.mileage} • {vehicle.condition} • {vehicle.location}
              </p>
            </button>
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={isSaved ? "Saved" : "Save"}
              title={isSaved ? "Saved" : "Save"}
              className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer active:scale-90 transition ${
                isSaved ? "bg-[#E5B869] border-[#E5B869] text-black" : "bg-white/5 border-white/15 text-white"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill={isSaved ? "currentColor" : "none"}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={BOOKMARK_PATH} />
              </svg>
            </button>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">{vehicle.bidCount ? "Best offer" : "Price"}</p>
              <p className="text-xl font-black text-[#E5B869] leading-none">{vehicle.highestBid}</p>
            </div>
            <button type="button" onClick={() => onDetails(vehicle)} className="text-xs font-semibold text-neutral-300 underline underline-offset-4 cursor-pointer">
              {vehicle.bidCount || 0} {vehicle.bidCount === 1 ? "offer" : "offers"} • details
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onShareToStaff(vehicle)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer active:scale-95 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ask team
            </button>
            <button
              type="button"
              onClick={() => onBid(vehicle)}
              disabled={sold}
              className="flex-1 h-11 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sold ? "Sold" : "Make an offer"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
