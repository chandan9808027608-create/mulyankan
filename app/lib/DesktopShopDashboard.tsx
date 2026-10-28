"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "./dealerBidsData";
import BikeSwipeAppraisal from "./BikeSwipeAppraisal";
import StaffGroupChat from "./StaffGroupChat";
import StaffRecruitmentConsole from "./StaffRecruitmentConsole";
import { ReconditionInventoryDashboard, AcquiredVehicle } from "./ReconditionInventoryDashboard";

// Shop dashboard for desktop browsers: the layout from before the app-style
// redesign (header + text tabs, Live Floor grid, Swipe Deck, Staff War Room).
// Phones and the Android app use the app layout in page.tsx instead.

export interface DesktopBike {
  id: string;
  name: string;
  year: string;
  mileage: string;
  lotNumber: string;
  nepaliPlate?: string;
  province?: string;
  ownership: string;
  location: string;
  condition: string;
  paperwork: string;
  highestBid: string;
  timeLeft: string;
  imageUrl: string;
  images: { url: string; label: string }[];
  notes?: string;
  sellerName: string;
  engineCondition: string;
  tyreCondition: string;
  keysCount: string;
  isTrending?: boolean;
  viewCount?: number;
  hypeBadge?: string;
  createdAt?: string;
}

export type DesktopShopView = "auctions" | "swiper" | "staff_chat" | "recruitment" | "inventory";

interface DesktopShopDashboardProps {
  view: DesktopShopView;
  bikes: DesktopBike[];
  showroomName: string;
  panNumber: string;
  pendingStaffCount: number;
  acquiredVehicles: AcquiredVehicle[];
  onNavigate: (view: DesktopShopView) => void;
  onOpenBike: (bike: DesktopBike) => void;
  onBid: (bike: DesktopBike) => void;
  onDirectBid: (bikeId: string, amountNpr: number) => void;
  onStaffApproved: () => void;
  onBack: () => void;
  onLogout: () => void;
  onSell: () => void;
  onSellerHome: () => void;
  onMyPostings: () => void;
}

const MulyankanLogo = React.memo(function MulyankanLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 rounded-full border-2 border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10 shadow-[0_0_10px_rgba(229,184,105,0.4)]">
        <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <span className="text-xl sm:text-2xl font-black tracking-wider text-white">MULYANKAN</span>
    </div>
  );
});

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const GlidingNavLinks = React.memo(function GlidingNavLinks({
  items,
  size = "md",
}: {
  items: NavItem[];
  size?: "sm" | "md";
}) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const isSmall = size === "sm";

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (!indicatorRef.current) return;
    const indicator = indicatorRef.current;
    indicator.style.opacity = "1";
    indicator.style.transform = `translate3d(${el.offsetLeft}px, 0, 0)`;
    indicator.style.width = `${el.offsetWidth}px`;
  };

  const handleMouseLeave = () => {
    if (!indicatorRef.current) return;
    indicatorRef.current.style.opacity = "0";
  };

  return (
    <nav
      onMouseLeave={handleMouseLeave}
      className={`relative ${
        isSmall ? "flex p-0.5" : "hidden md:flex p-1"
      } items-center gap-0.5 rounded-full bg-white/[0.04] border border-white/10 shrink-0`}
    >
      {/* 100% GPU-accelerated gliding pill indicator */}
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute top-0.5 bottom-0.5 left-0 rounded-full pointer-events-none opacity-0"
        style={{
          background: "linear-gradient(90deg, rgba(229,184,105,0.24), rgba(229,184,105,0.14))",
          border: "1px solid rgba(229,184,105,0.4)",
          boxShadow: "0 0 16px rgba(229,184,105,0.3)",
          willChange: "transform, width, opacity",
          transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), width 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-out",
          transform: "translate3d(0, 0, 0)",
        }}
      />

      {items.map((item, idx) => {
        const itemClass = `relative z-10 ${
          isSmall ? "px-2.5 sm:px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        } font-medium rounded-full transition-colors duration-150 block select-none whitespace-nowrap ${
          item.isActive
            ? "text-[#E5B869] font-bold"
            : "text-neutral-300 hover:text-white"
        }`;

        if (item.href) {
          return (
            <Link
              key={idx}
              href={item.href}
              onClick={(e) => {
                if (item.href?.startsWith("#")) {
                  e.preventDefault();
                  const targetId = item.href.slice(1);
                  const el = document.getElementById(targetId);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                    try {
                      window.history.pushState(null, "", item.href);
                    } catch {}
                  }
                }
                if (item.onClick) item.onClick();
              }}
              onMouseEnter={handleMouseEnter}
              className={itemClass}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={item.onClick}
            onMouseEnter={handleMouseEnter}
            className={`${itemClass} cursor-pointer`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
});

const VehicleAuctionCard = React.memo(function VehicleAuctionCard({
  bike,
  onOpenDetails,
  onPlaceBid,
  isLatest,
}: {
  bike: DesktopBike;
  onOpenDetails: () => void;
  onPlaceBid: (e: React.MouseEvent) => void;
  isLatest?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState(0);

  // Touch swipe state: swipe the photo left/right on phones to change image
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const canHover = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    swipedRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || bike.images.length < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Mostly-horizontal drag of 30px+ = swipe; anything smaller stays a tap
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swipedRef.current = true;
      setHoverIndex((prev) =>
        Math.max(0, Math.min(bike.images.length - 1, prev + (dx < 0 ? 1 : -1)))
      );
    }
  };

  // Silent glide: smooth image switching without any pop-up or swoosh sounds
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover()) return; // touch devices use swipe instead
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const nextIdx = Math.min(bike.images.length - 1, Math.floor(ratio * bike.images.length));
    if (nextIdx !== hoverIndex) {
      setHoverIndex(nextIdx);
    }
  };

  return (
    <div
      onClick={onOpenDetails}
      className={`min-w-0 rounded-xl sm:rounded-2xl bg-[#14161f] border overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-md group cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] ${
        isLatest
          ? "border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/20"
          : "border-white/10 hover:border-[#E5B869]/50"
      }`}
    >
      <div>
        {/* Silent Glide Slideshow Container */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (canHover()) setHoverIndex(0);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          // A swipe must not also open the details modal
          onClickCapture={(e) => {
            if (swipedRef.current) {
              e.stopPropagation();
              swipedRef.current = false;
            }
          }}
          style={{ touchAction: "pan-y" }}
          className="relative aspect-[16/10] bg-black overflow-hidden select-none"
        >
          {/* Active Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bike.images[hoverIndex]?.url || bike.imageUrl}
            alt={bike.name}
            className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
          />

          {/* Latest Posting Highlight Badge */}
          {isLatest && (
            <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black font-bold text-[10px] shadow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                Latest Posting
              </span>
            </div>
          )}

          {/* Trending Hype Badge for Recondition Houses */}
          {!isLatest && bike.isTrending && (
            <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center gap-1">
                <span>{bike.hypeBadge || "TRENDING"}</span>
              </span>
            </div>
          )}

          {/* Clean Segment Indicator */}
          {bike.images.length > 1 && (
            <div className="absolute top-2.5 inset-x-2.5 flex gap-1 z-10 pointer-events-none">
              {bike.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-150 ${
                    idx === hoverIndex
                      ? "bg-[#E5B869] shadow-[0_0_8px_#E5B869]"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Clean Photo Counter (Number only) */}
          {bike.images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
              <span className="text-[11px] font-medium text-neutral-200 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
                {hoverIndex + 1}/{bike.images.length}
              </span>
            </div>
          )}
        </div>

        {/* Card Content - Humanized, Clean Typography */}
        <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
          {/* Title & Location */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[13px] sm:text-[15px] font-semibold text-white tracking-tight leading-snug group-hover:text-[#E5B869] transition-colors line-clamp-1 min-w-0">
                {bike.name}
              </h3>
              <span className="hidden sm:inline text-xs text-neutral-400 font-medium shrink-0 pt-0.5">
                {bike.location.split(",")[0]}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 font-normal min-w-0">
              <span>{bike.year}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-200 font-medium truncate">{bike.mileage}</span>
              <span className="hidden sm:inline text-neutral-600">·</span>
              <span className="hidden sm:inline">{bike.ownership.split(" (")[0]}</span>
            </p>
          </div>

          {/* Specs in Clean Natural Line */}
          <div className="hidden sm:grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-2.5 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 truncate text-emerald-400 font-medium">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{bike.paperwork.split(" (")[0]}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate text-neutral-300">
              <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>{bike.keysCount || "2 Original Keys"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B869] shrink-0" />
              <span>{bike.engineCondition || "Sealed Engine"}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span>{bike.sellerName.split(" ")[0]} (Owner)</span>
            </div>
          </div>

          {/* Offer & Session Status */}
          <div className="pt-2 sm:pt-2.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-normal">Highest dealer offer</p>
              <p className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{bike.highestBid}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] sm:text-xs font-medium text-amber-400/95 flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{bike.timeLeft}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-2.5 pt-0 sm:p-4 sm:pt-0 space-y-2">
        <button
          type="button"
          onClick={onPlaceBid}
          className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs text-black bg-[#E5B869] hover:bg-[#d8ab5c] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          Make an Offer
        </button>

        <div className="flex items-center justify-between text-xs font-medium text-neutral-400 px-1 pt-0.5">
          <span className="text-[#E5B869] group-hover:underline flex items-center gap-1">
            <span>View Full Details</span>
            <span>→</span>
          </span>
          <div className="hidden sm:flex items-center gap-2.5 text-neutral-500 text-[11px]">
            {bike.viewCount && (
              <span className="flex items-center gap-1 text-neutral-400">
                <svg className="w-3 h-3 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{bike.viewCount} views</span>
              </span>
            )}
            <span>{bike.images.length} Photos</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export function DesktopShopDashboard({
  view,
  bikes,
  showroomName,
  panNumber,
  pendingStaffCount,
  acquiredVehicles,
  onNavigate,
  onOpenBike,
  onBid,
  onDirectBid,
  onStaffApproved,
  onBack,
  onLogout,
  onSell,
  onSellerHome,
  onMyPostings,
}: DesktopShopDashboardProps) {
  // Search & filters for the Live Floor
  const [searchQuery, setSearchQuery] = useState("");
  const [activeListingTab, setActiveListingTab] = useState<"all" | "trending">("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterSort, setFilterSort] = useState<"default" | "price_desc" | "price_asc" | "views" | "year_desc">("default");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showOpsMenu, setShowOpsMenu] = useState(false);

  const filteredAuctionItems = useMemo(() => {
    const parsePrice = (priceStr: string) => Number(priceStr.replace(/[^0-9]/g, "")) || 0;
    return bikes
      .filter((bike) => {
        if (activeListingTab === "trending" && !bike.isTrending) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            bike.name.toLowerCase().includes(q) ||
            bike.location.toLowerCase().includes(q) ||
            bike.year.toLowerCase().includes(q) ||
            bike.sellerName.toLowerCase().includes(q) ||
            (bike.nepaliPlate && bike.nepaliPlate.toLowerCase().includes(q)) ||
            (bike.lotNumber && bike.lotNumber.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (filterBrand !== "all") {
          const nameLower = bike.name.toLowerCase();
          if (filterBrand === "yamaha" && !nameLower.includes("yamaha")) return false;
          if (filterBrand === "ktm" && !nameLower.includes("ktm")) return false;
          if (filterBrand === "bajaj" && !nameLower.includes("bajaj") && !nameLower.includes("pulsar")) return false;
          if (filterBrand === "enfield" && !nameLower.includes("enfield") && !nameLower.includes("bullet")) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filterSort === "price_desc") return parsePrice(b.highestBid) - parsePrice(a.highestBid);
        if (filterSort === "price_asc") return parsePrice(a.highestBid) - parsePrice(b.highestBid);
        if (filterSort === "views") return (b.viewCount || 0) - (a.viewCount || 0);
        if (filterSort === "year_desc") return Number(b.year) - Number(a.year);
        if (activeListingTab === "trending") return (b.viewCount || 0) - (a.viewCount || 0);
        return 0;
      });
  }, [bikes, activeListingTab, searchQuery, filterBrand, filterSort]);

  const swipeBikes = useMemo(
    () =>
      bikes.map((b) => ({
        id: b.id,
        name: b.name,
        year: b.year,
        mileage: b.mileage,
        lotNumber: b.lotNumber,
        nepaliPlate: b.nepaliPlate,
        province: b.province,
        condition: b.condition,
        paperwork: b.paperwork,
        highestBid: b.highestBid,
        imageUrl: b.imageUrl,
        images: b.images,
        engineCondition: b.engineCondition,
        tyreCondition: b.tyreCondition,
        notes: b.notes,
        sellerName: b.sellerName,
      })),
    [bikes]
  );
  const chatBikes = useMemo(
    () =>
      bikes.map((b) => ({
        id: b.id,
        name: b.name,
        lotNumber: b.lotNumber,
        highestBid: b.highestBid,
        imageUrl: b.imageUrl,
        year: b.year,
        mileage: b.mileage,
      })),
    [bikes]
  );

  // Newest listing is first in the list
  const latestBike = bikes[0];
  const openLatest = () => {
    if (view !== "auctions") onNavigate("auctions");
    if (latestBike) onOpenBike(latestBike);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e12]">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121318]/95 backdrop-blur-md">
              {/* Row 1: identity + actions */}
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 shrink-0 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer shadow"
                  title="Undo / Go back"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSellerHome()}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  title="Return to Marketplace Home"
                >
                  <MulyankanLogo />
                </button>

                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate max-w-[180px]">Shop: {showroomName}</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/10">PAN: {panNumber}</span>
                </div>
              </div>

              {/* Right-aligned group: Recruitment Bell + Exit Workshop Session button */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Staff Recruitment Notification Bell */}
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("recruitment");
                  }}
                  className="relative p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-[#E5B869] transition-all cursor-pointer shrink-0"
                  title="Hiring"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {pendingStaffCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[8px] font-black flex items-center justify-center animate-bounce shadow">
                      {pendingStaffCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <span className="sm:hidden">Log Out</span>
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
              </div>
              {/* Row 2: section navigation */}
              <div className="border-t border-white/5">
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar flex md:justify-center">
                  <GlidingNavLinks
                    size="sm"
                    items={[
                      { label: "Live Floor", isActive: view === "auctions", onClick: () => onNavigate("auctions") },
                      { label: "Swipe Deck", isActive: view === "swiper", onClick: () => onNavigate("swiper") },
                      { label: "Staff War Room", isActive: view === "staff_chat", onClick: () => onNavigate("staff_chat") },
                      { label: pendingStaffCount > 0 ? `Hiring (${pendingStaffCount})` : "Hiring", isActive: view === "recruitment", onClick: () => onNavigate("recruitment") },
                      { label: "Bikes I Bought", isActive: view === "inventory", onClick: () => onNavigate("inventory") },
                      { label: "Sell a Bike", onClick: onSell },
                      { label: "Seller View", onClick: onSellerHome },
                      { label: "My Postings", onClick: onMyPostings },
                    ]}
                  />
                </div>
              </div>
            </header>

          {view === "inventory" ? (
            <div className="flex-1">
              <ReconditionInventoryDashboard
                showroomName={showroomName}
                panNumber={panNumber}
                acquiredVehicles={acquiredVehicles}
                onBackToAuctionFloor={() => onNavigate("auctions")}
              />
            </div>
          ) : view === "swiper" ? (
            <div className="flex-1">
              <BikeSwipeAppraisal
                showroomName={showroomName}
                panNumber={panNumber}
                initialBikes={swipeBikes}
                onPlaceBid={onDirectBid}
                onShareToStaffChat={() => onNavigate("staff_chat")}
                onSwitchToStaffChat={() => onNavigate("staff_chat")}
                onSwitchToAuctionFloor={() => onNavigate("auctions")}
              />
            </div>
          ) : view === "staff_chat" ? (
            <div className="flex-1">
              <StaffGroupChat
                showroomName={showroomName}
                panNumber={panNumber}
                availableBikes={chatBikes}
                onPlaceBidFromChat={onDirectBid}
                onSwitchToAuction={() => onNavigate("auctions")}
                onSwitchToSwiper={() => onNavigate("swiper")}
              />
            </div>
          ) : view === "recruitment" ? (
            <div className="flex-1">
              <StaffRecruitmentConsole
                showroomName={showroomName}
                panNumber={panNumber}
                onStaffApproved={onStaffApproved}
                onBackToAuctionFloor={() => onNavigate("auctions")}
              />
            </div>
          ) : (
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row gap-6">
              {/* Left Micro Sidebar */}
              <aside className="w-full md:w-48 shrink-0 grid grid-cols-2 md:flex md:flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setActiveListingTab("all")}
                  className={`w-full p-3 rounded-xl font-medium text-sm flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                    activeListingTab === "all"
                      ? "bg-[#161820] border border-[#E5B869]/40 text-[#E5B869] font-bold shadow-sm"
                      : "hover:bg-white/5 text-neutral-300 hover:text-white"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>All Bikes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveListingTab("trending");
                  }}
                  className={`w-full p-3 rounded-xl font-medium text-sm flex items-center justify-between transition-all text-left group cursor-pointer ${
                    activeListingTab === "trending"
                      ? "bg-gradient-to-r from-amber-500/20 via-[#161820] to-[#161820] border border-amber-500/50 text-[#E5B869] font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "hover:bg-white/5 text-neutral-300 hover:text-white"
                  }`}
                  title="Bikes many people look at"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Trending</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    HYPE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openLatest}
                  className="w-full p-3 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white font-medium text-sm flex items-center justify-between transition-colors text-left group cursor-pointer"
                  title="Newest bike"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span>Newest Bike</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    LATEST
                  </span>
                </button>

                <div className="col-span-2 md:col-span-1 pt-2 border-t border-white/10 space-y-1.5">
                  {/* Phones: tap to reveal. md+: always open (toggle is inert). */}
                  <button
                    type="button"
                    onClick={() => setShowOpsMenu((prev) => !prev)}
                    aria-expanded={showOpsMenu}
                    className="w-full flex items-center justify-between px-1 py-1 md:pointer-events-none cursor-pointer md:cursor-default"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      More
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-neutral-500 md:hidden transition-transform duration-200 ${showOpsMenu ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className={`${showOpsMenu ? "block" : "hidden"} md:block space-y-1.5`}>

                  {/* Swift Swipe & Offer */}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("swiper");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-[#E5B869]/20 hover:border-[#E5B869]/40 bg-[#E5B869]/5"
                    title="Like or skip bikes"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-white group-hover:text-[#E5B869]">Swipe Bikes</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/30">
                      OFFER
                    </span>
                  </button>

                  {/* Staff War Room Chat */}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("staff_chat");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/5"
                    title="Talk to your team"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <span className="text-white group-hover:text-cyan-400">Team Chat</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      ROOM
                    </span>
                  </button>

                  {/* Staff Recruitment & Approvals */}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("recruitment");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5"
                    title="People who want to work for you"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="text-white group-hover:text-amber-400">Hiring</span>
                    </div>
                    {pendingStaffCount > 0 ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-black animate-pulse">
                        {pendingStaffCount} NEW
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">
                        TEAM
                      </span>
                    )}
                  </button>

                  {/* Won Inventory */}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("inventory");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-[#E5B869]/20 hover:border-[#E5B869]/40 bg-[#E5B869]/5"
                    title="Bikes you bought"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-white group-hover:text-[#E5B869]">Bikes I Bought</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      BOUGHT
                    </span>
                  </button>
                  </div>
                </div>

                <button
                  onClick={() => onSellerHome()}
                  className="w-full p-3 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white font-medium text-sm flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Check a Bike&apos;s Price</span>
                </button>
              </aside>

            {/* Main Auction Floor */}
            <main id="auction-floor" className="flex-1 space-y-5">
              {/* Header Title & Notification */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                  LIVE AUCTIONS &amp; LISTINGS
                </h2>
                <button
                  type="button"
                  onClick={openLatest}
                  title="See the newest bike"
                  className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#E5B869] hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-[#E5B869] cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#121318]" />
                </button>
              </div>

              {/* Ticker / Banner Strip - Interactive New Posting Redirection */}
              <div
                id="latest-posting-banner"
                onClick={openLatest}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLatest();
                  }
                }}
                className="group p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#171a24] via-[#14161f] to-[#171a24] border border-[#E5B869]/30 hover:border-[#E5B869] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(229,184,105,0.2)]"
                title="See the newest bike"
              >
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      NEW
                    </span>
                    <strong className="text-white font-bold group-hover:text-[#E5B869] transition-colors">
                      {latestBike?.name || "Newest Bike"}
                    </strong>
                    <span className="text-neutral-400 text-xs hidden md:inline">
                      • {latestBike?.mileage} • {latestBike?.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Added</span>
                    <span className="font-semibold text-emerald-400">
                      {latestBike?.createdAt ? timeAgo(latestBike.createdAt) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-black bg-[#E5B869] group-hover:bg-[#f3c678] px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md">
                    <span>See Bike</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </div>

              {/* Search, Trending Tab, and Filter Bar for Recondition Houses */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Left: Search Listing Input */}
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#E5B869] transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bikes (e.g. R15, KTM, Lalitpur)"
                      className="w-full bg-[#161820] border border-white/15 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all shadow-inner"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                        title="Clear search"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Right: Quick Action Buttons (Trending Tab Pill + Filter Button) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Trending Tab Toggle Pill */}
                    <div className="inline-flex p-1 rounded-xl bg-[#161820] border border-white/15">
                      <button
                        type="button"
                        onClick={() => setActiveListingTab("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeListingTab === "all"
                            ? "bg-[#E5B869] text-black shadow"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        All ({bikes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveListingTab("trending");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeListingTab === "trending"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                            : "text-neutral-300 hover:text-amber-400"
                        }`}
                        title="Bikes many people look at"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Trending</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-bold">
                          {bikes.filter((b) => b.isTrending).length}
                        </span>
                      </button>
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowFilterDrawer((prev) => !prev)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shadow-sm ${
                        showFilterDrawer || filterBrand !== "all" || filterSort !== "default"
                          ? "bg-[#E5B869]/20 border-[#E5B869] text-[#E5B869]"
                          : "bg-[#161820] border-white/15 text-neutral-300 hover:text-white hover:border-white/30"
                      }`}
                      title="Filters"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Filters</span>
                      {(filterBrand !== "all" || filterSort !== "default") && (
                        <span className="w-2 h-2 rounded-full bg-[#E5B869]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilterDrawer && (
                  <div className="p-4 rounded-2xl bg-[#141620] border border-white/15 space-y-3.5 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                        <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span>Filter and Sort</span>
                      </div>
                      {(filterBrand !== "all" || filterSort !== "default" || searchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilterBrand("all");
                            setFilterSort("default");
                            setSearchQuery("");
                          }}
                          className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Brand Select */}
                      <div className="space-y-1.5">
                        <label className="block font-medium text-neutral-400">
                          Brand
                        </label>
                        <select
                          value={filterBrand}
                          onChange={(e) => setFilterBrand(e.target.value)}
                          className="w-full bg-[#1a1c26] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#E5B869] cursor-pointer"
                        >
                          <option value="all">All Brands (Yamaha, KTM, Bajaj, Royal Enfield)</option>
                          <option value="yamaha">Yamaha (R15, MT-15)</option>
                          <option value="ktm">KTM (Duke 250, RC 200)</option>
                          <option value="bajaj">Bajaj (Pulsar NS 200)</option>
                          <option value="enfield">Royal Enfield (Classic 350)</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div className="space-y-1.5">
                        <label className="block font-medium text-neutral-400">
                          Sort By
                        </label>
                        <select
                          value={filterSort}
                          onChange={(e) => setFilterSort(e.target.value as typeof filterSort)}
                          className="w-full bg-[#1a1c26] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#E5B869] cursor-pointer"
                        >
                          <option value="default">Default (Latest Postings First)</option>
                          <option value="views">Most Hyped &amp; Viewed (Trending)</option>
                          <option value="price_desc">Highest Dealer Offer (NPR High → Low)</option>
                          <option value="price_asc">Lowest Starting Offer (NPR Low → High)</option>
                          <option value="year_desc">Newest Model Year First</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trending Hype Insights Banner for Recondition Houses */}
              {activeListingTab === "trending" && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#1a1712] to-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300">
                        Trending &amp; Hyped Vehicles in Valley Market
                      </h4>
                      <p className="text-neutral-400 text-[11px]">
                        These are the bikes people look at the most.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    Popular
                  </span>
                </div>
              )}

              {/* Results Count & Quick Status */}
              <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5">
                <span>
                  Showing <strong className="text-white">{filteredAuctionItems.length}</strong> {filteredAuctionItems.length === 1 ? "vehicle" : "vehicles"}
                  {activeListingTab === "trending" && " in Trending"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                {filteredAuctionItems.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBrand("all");
                      setActiveListingTab("all");
                    }}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear Search &amp; Show All
                  </button>
                )}
              </div>

              {/* 3x2 Grid of Auction Vehicle Cards with Hover Glide Slideshow */}
              {filteredAuctionItems.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
                  {filteredAuctionItems.map((bike) => (
                    <VehicleAuctionCard
                      key={bike.id}
                      bike={bike}
                      isLatest={bike.id === latestBike?.id}
                      onOpenDetails={() => {
                        onOpenBike(bike);
                      }}
                      onPlaceBid={(e) => {
                        e.stopPropagation();
                        onBid(bike);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center rounded-2xl bg-[#14161f] border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-neutral-400 flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-white">No bikes found</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Try another name, like Yamaha or KTM, or clear the filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBrand("all");
                      setFilterSort("default");
                      setActiveListingTab("all");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E5B869] text-black font-bold text-xs hover:bg-[#d8ab5c] transition-all cursor-pointer shadow"
                  >
                    Reset Search &amp; Filters
                  </button>
                </div>
              )}
            </main>
          </div>
          )}

          <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-neutral-500">
            <p>MULYANKAN • For bike shops</p>
          </footer>
    </div>
  );
}
