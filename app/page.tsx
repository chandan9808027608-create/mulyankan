"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DealerBiddingConsole } from "./lib/DealerBiddingConsole";
import { INITIAL_BIDS, INITIAL_MESSAGES, BidRecord, DirectMessage } from "./lib/dealerBidsData";
import { SellerPostingsDashboard } from "./lib/SellerPostingsDashboard";
import { DirectPostBikeModal, DirectPostData } from "./lib/DirectPostBikeModal";
import { ReconditionInventoryDashboard } from "./lib/ReconditionInventoryDashboard";
import StaffGroupChat from "./lib/StaffGroupChat";
import BikeSwipeAppraisal, { SwipeBike } from "./lib/BikeSwipeAppraisal";
import StaffRecruitmentConsole from "./lib/StaffRecruitmentConsole";
import { getStaffApplications, StaffApplication } from "./lib/companyStaffData";
import HowItWorksSection from "./lib/HowItWorksSection";
import AboutUsSection from "./lib/AboutUsSection";
import AppNavbar from "./lib/AppNavbar";
import AppFooter from "./lib/AppFooter";
import LiveMarketplaceSection from "./lib/LiveMarketplaceSection";

// Types
interface BikeImage {
  url: string;
  label: string;
}

interface AuctionBike {
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
  images: BikeImage[];
  notes?: string;
  // Human Seller & Physical Inspection Profile
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  inspectionAvailability?: string;
  bluebookStatus: string;
  taxValidTill: string;
  keysCount: string;
  engineCondition: string;
  tyreCondition: string;
  // Simple plain-English descriptions (5th-grader clear)
  simpleHowItRuns: string;
  simpleAccidentStatus: string;
  simplePapersStatus: string;
  simpleKeysStatus: string;
  // Trending and Hype Analytics for Recondition Houses
  isTrending?: boolean;
  viewCount?: number;
  bidCount?: number;
  hypeBadge?: string;
}

// Reusable Brand Logo
const MulyankanLogo = React.memo(function MulyankanLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 rounded-full border-2 border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10 shadow-[0_0_10px_rgba(229,184,105,0.4)]">
        <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
        MULYANKAN
      </span>
    </div>
  );
});

// Synthesize a subtle luxury UI swoosh sound using Web Audio API
let audioCtx: AudioContext | null = null;
let lastSwooshTime = 0;

function playSwooshSound() {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    // Throttle to keep rapid glides crisp and unclipped
    if (now - lastSwooshTime < 65) return;
    lastSwooshTime = now;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    const duration = 0.085; // 85ms snappy swoosh

    // 1. Air texture: Bandpass-filtered noise sweep
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.Q.value = 2.8;
    bandpass.frequency.setValueAtTime(420, t);
    bandpass.frequency.exponentialRampToValueAtTime(1350, t + 0.035);
    bandpass.frequency.exponentialRampToValueAtTime(320, t + duration);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.06, t + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(t);
    noiseSource.stop(t + duration);

    // 2. Soft harmonic frequency glide for satisfying mechanical tone
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.035);
    osc.frequency.exponentialRampToValueAtTime(240, t + duration);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.025, t + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + duration);
  } catch {
    // AudioContext blocked or not allowed, fail silently
  }
}

// Synthesize high-energy superbike throttle & Doppler rush
function playBikeRevSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const t = audioCtx.currentTime;
    const duration = 0.75;

    // 1. Throaty engine rev oscillator (sawtooth with pitch ramp up then down)
    const osc = audioCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.28);
    osc.frequency.exponentialRampToValueAtTime(120, t + duration);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, t);
    filter.frequency.exponentialRampToValueAtTime(2600, t + 0.3);
    filter.frequency.exponentialRampToValueAtTime(360, t + duration);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + duration);

    // 2. High-speed rushing wind
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.Q.value = 1.8;
    noiseFilter.frequency.setValueAtTime(320, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(1900, t + 0.35);
    noiseFilter.frequency.exponentialRampToValueAtTime(420, t + duration);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.14, t + 0.28);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(t);
    noise.stop(t + duration);
  } catch {}
}

// Smooth Gliding Magnetic Navigation Component (100% GPU Accelerated, Zero Reflow / Zero Lag)
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

    // Trigger subtle luxury aerodynamic swoosh
    playSwooshSound();
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

// Natural, Premium Auction Card for Live Listings (Humanized typography, silent glide)
const VehicleAuctionCard = React.memo(function VehicleAuctionCard({
  bike,
  onOpenDetails,
  onPlaceBid,
  isLatest,
}: {
  bike: AuctionBike;
  onOpenDetails: () => void;
  onPlaceBid: (e: React.MouseEvent) => void;
  isLatest?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState(0);

  // Silent glide: smooth image switching without any pop-up or swoosh sounds
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
      className={`rounded-2xl bg-[#14161f] border overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-md group cursor-pointer hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] ${
        isLatest
          ? "border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/20"
          : "border-white/10 hover:border-[#E5B869]/50"
      }`}
    >
      <div>
        {/* Silent Glide Slideshow Container */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(0)}
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
        <div className="p-4 space-y-3">
          {/* Title & Location */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-white tracking-tight leading-snug group-hover:text-[#E5B869] transition-colors line-clamp-1">
                {bike.name}
              </h3>
              <span className="text-xs text-neutral-400 font-medium shrink-0 pt-0.5">
                {bike.location.split(",")[0]}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2 font-normal">
              <span>{bike.year}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-200 font-medium">{bike.mileage}</span>
              <span className="text-neutral-600">·</span>
              <span>{bike.ownership.split(" (")[0]}</span>
            </p>
          </div>

          {/* Specs in Clean Natural Line */}
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-2.5 border-t border-white/[0.08]">
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
          <div className="pt-2.5 border-t border-white/[0.08] flex items-baseline justify-between">
            <div>
              <p className="text-[11px] text-neutral-400 font-normal">Highest dealer offer</p>
              <p className="text-base font-bold text-white tracking-tight">{bike.highestBid}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-amber-400/95 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{bike.timeLeft}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 pt-0 space-y-2">
        <button
          type="button"
          onClick={onPlaceBid}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-black bg-[#E5B869] hover:bg-[#d8ab5c] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          Make an Offer
        </button>

        <div className="flex items-center justify-between text-xs font-medium text-neutral-400 px-1 pt-0.5">
          <span className="text-[#E5B869] group-hover:underline flex items-center gap-1">
            <span>View Full Details</span>
            <span>→</span>
          </span>
          <div className="flex items-center gap-2.5 text-neutral-500 text-[11px]">
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

export default function MulyankanApp() {
  const router = useRouter();

  const handleEvaluateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playBikeRevSound();
    router.push("/condition-report");
  };

  // Mode Toggle: "seller" | "dealer" | "seller_dashboard"
  const [activeTab, setActiveTab] = useState<"seller" | "dealer" | "seller_dashboard">("seller");

  // Seller Form State
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  // Selected Bike for Detailed Disclosure & Slideshow Modal
  const [selectedBike, setSelectedBike] = useState<AuctionBike | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Live Auction Data with Full Seller Inspection Imagery & Disclosures
  const [auctionItems, setAuctionItems] = useState<AuctionBike[]>([
    {
      id: "r15-1",
      name: "2023 Yamaha YZF R15 V4 Dark Knight",
      year: "2023",
      mileage: "8,200 KM",
      lotNumber: "BA 02-04 PA 8812",
      nepaliPlate: "बा ०२-०४ प ८८१२",
      province: "BAGMATI",
      ownership: "Single Hand (1st Owner Bluebook)",
      location: "New Baneshwor, Kathmandu",
      condition: "Like New (10/10)",
      paperwork: "Tax Cleared (Fiscal Year 2081/82)",
      highestBid: "NPR 3,45,000",
      timeLeft: "01:24:10 LEFT",
      imageUrl: "/black-yamaha-r15.jpg",
      images: [
        { url: "/black-yamaha-r15.jpg", label: "1. Front Profile & Headlights" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Meter Console (8,200 KM Odometer)" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "3. Engine Chamber & USD Forks" },
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "4. Swingarm, Sprocket & Chainset" },
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "5. Rear Tyre Tread & Dual ABS Discs" },
      ],
      sellerName: "Prashant Shrestha",
      sellerPhone: "+977 9841-892341",
      sellerAddress: "Baneshwor Heights (Near Eyeplex Mall), Kathmandu",
      inspectionAvailability: "Available for test ride today after 4:00 PM",
      bluebookStatus: "In Hand • 1st Hand Single Owner (नामसारी तयार)",
      taxValidTill: "Paid till Ashadh 2082 (Current Fiscal Year)",
      keysCount: "2 Original Keys + Barcode Tag",
      engineCondition: "Runs like new, super quiet",
      tyreCondition: "Tyres have strong grip (80% life)",
      simpleHowItRuns: "Starts with 1 push button. Runs like brand new, very quiet engine with zero smoke.",
      simpleAccidentStatus: "Never dropped or crashed. No dents, shiny paint like a new showroom bike.",
      simplePapersStatus: "Original Bluebook is ready in hand, and all government taxes are 100% paid.",
      simpleKeysStatus: "Both 2 original keys included.",
      notes: "I bought this bike brand new and used it only to ride to college. It has never fallen down and has zero problems. The engine is super quiet and smooth. I am only selling it because I am going abroad for studies. You and your mechanic are welcome to come test-ride it anytime today!",
      isTrending: true,
      viewCount: 428,
      bidCount: 19,
      hypeBadge: "TOP TRENDING",
    },
    {
      id: "ktm-1",
      name: "2022 KTM Duke 250 BS6",
      year: "2022",
      mileage: "14,500 KM",
      lotNumber: "BA 98 PA 4120",
      nepaliPlate: "बा ९८ प ४१२०",
      province: "BAGMATI",
      ownership: "Single Hand (1st Owner Bluebook)",
      location: "Baluwatar, Kathmandu",
      condition: "Like New (9.5/10)",
      paperwork: "Tax Cleared (Fiscal Year 2081/82)",
      highestBid: "NPR 3,10,000",
      timeLeft: "02:45:12 LEFT",
      imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
      images: [
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "1. Front Profile & Orange Trellis Frame" },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "2. Digital Meter Console (14,500 KM)" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "3. Engine Chamber & Underbelly Exhaust" },
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "4. Chain Sprocket & Monoshock" },
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "5. Metzeler Tyres & ByBre Calipers" },
      ],
      sellerName: "Bikash Tamang",
      sellerPhone: "+977 9813-449012",
      sellerAddress: "Baluwatar (Near Russian Embassy), Kathmandu",
      inspectionAvailability: "Available for inspection anytime between 10 AM - 6 PM",
      bluebookStatus: "Single Hand Clear Bluebook in hand",
      taxValidTill: "Cleared up to 2082 (Current Fiscal Year)",
      keysCount: "2 Factory Keys + Security Code Card",
      engineCondition: "Crisp and powerful • Zero sound",
      tyreCondition: "New tyres and brake pads",
      simpleHowItRuns: "Starts on the first try. Engine has lots of power, sounds very healthy with zero problems.",
      simpleAccidentStatus: "Never been in any accident or fall. Handle and body are 100% straight.",
      simplePapersStatus: "Bluebook in hand with no bank loan. Road tax is fully cleared.",
      simpleKeysStatus: "Both 2 factory keys + security code card included.",
      notes: "This bike is in wonderful condition. I always took it to the official KTM service shop on time. It has never had any crash. The brakes stop quickly and tyres grip well. You can take it for a spin around my neighborhood before deciding!",
      isTrending: true,
      viewCount: 382,
      bidCount: 15,
      hypeBadge: "HIGH DEMAND",
    },
    {
      id: "ns200-1",
      name: "2021 Bajaj Pulsar NS 200 BS6",
      year: "2021",
      mileage: "18,200 KM",
      lotNumber: "BA 92 PA 1104",
      nepaliPlate: "बा ९२ प ११०४",
      province: "BAGMATI",
      ownership: "Single Hand (1st Owner Bluebook)",
      location: "Koteshwor, Kathmandu",
      condition: "Very Good (9/10)",
      paperwork: "Tax Cleared (Fiscal Year 2081/82)",
      highestBid: "NPR 2,25,000",
      timeLeft: "03:15:40 LEFT",
      imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
      images: [
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "1. Front Mask & Wolf-Eye Headlight" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Semi-Digital Meter (18,200 KM)" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "3. Perimeter Frame & Engine Chamber" },
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "4. Nitrox Monoshock & Drive Chain" },
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "5. Rear Tyre Tread & Petal Disc" },
      ],
      sellerName: "Sunil Maharjan",
      sellerPhone: "+977 9860-221985",
      sellerAddress: "Koteshwor (Near Mahadevsthan), Kathmandu",
      inspectionAvailability: "Available after 5:00 PM at Koteshwor",
      bluebookStatus: "In hand, 1st Owner, Ready for transfer",
      taxValidTill: "Cleared till Ashadh 2082",
      keysCount: "2 Original Bajaj Keys",
      engineCondition: "Untouched factory seal • Smooth pick-up",
      tyreCondition: "70% Good Tread Remaining",
      simpleHowItRuns: "Runs very smoothly every day. Engine has never been opened or repaired.",
      simpleAccidentStatus: "Never in an accident. Has only 1 small scratch on the side guard from parking.",
      simplePapersStatus: "1st Owner Bluebook in hand. All government taxes are fully paid.",
      simpleKeysStatus: "Both 2 original Bajaj keys included.",
      notes: "Rides really nicely and feels solid on the road. Engine is completely untouched from factory. It has one tiny scratch on the side protector from parking, but no dents at all. Selling only because I am switching to an electric scooter for city traffic. Come test it anytime!",
      isTrending: false,
      viewCount: 195,
      bidCount: 8,
    },
    {
      id: "re-1",
      name: "2020 Royal Enfield Classic 350",
      year: "2020",
      mileage: "12,100 KM",
      lotNumber: "PROV 3 - 02 PA 9012",
      nepaliPlate: "प्रदेश ३ - ०२ प ९०१२",
      province: "BAGMATI",
      ownership: "2nd Hand (Name Transfer Completed)",
      location: "Jhamsikhel, Lalitpur",
      condition: "Clean / Showroom (10/10)",
      paperwork: "Tax Cleared (Fiscal Year 2081/82)",
      highestBid: "NPR 3,85,000",
      timeLeft: "00:45:18 LEFT",
      imageUrl: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85",
      images: [
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "1. Stealth Black Vintage Profile" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Chrome Speedometer (12,100 KM)" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "3. Matte Black Long Bottle Exhaust & Engine" },
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "4. Spoke Rims & Swingarm" },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "5. Ceat Zoom Plus Vintage Tyres" },
      ],
      sellerName: "Aman Thapa",
      sellerPhone: "+977 9801-778832",
      sellerAddress: "Jhamsikhel (Near St. Mary's School), Lalitpur",
      inspectionAvailability: "Available on weekends or morning 8 AM - 11 AM",
      bluebookStatus: "Transferred in my name • 100% Clear Documents",
      taxValidTill: "Fully cleared for current fiscal year",
      keysCount: "2 Factory Keys",
      engineCondition: "Heavy thump • Zero oil leak or sweat",
      tyreCondition: "85% Life Remaining",
      simpleHowItRuns: "Starts easily. Deep relaxing sound, rides comfortably with zero oil leaks.",
      simpleAccidentStatus: "Zero dents or scratches. Kept covered in garage like new.",
      simplePapersStatus: "Clean bluebook in my name. Government road tax is 100% paid.",
      simpleKeysStatus: "Both 2 original keys included.",
      notes: "This motorcycle has been cared for like family. The matte black paint looks clean and shiny. I only rode it on relaxed weekend family trips, never in bad mud. No oil leaks anywhere. Both original and comfort silencers are included. Ready to ride today!",
      isTrending: true,
      viewCount: 310,
      bidCount: 14,
      hypeBadge: "HYPED CLASSIC",
    },
    {
      id: "mt15-1",
      name: "2022 Yamaha MT-15 V2",
      year: "2022",
      mileage: "11,800 KM",
      lotNumber: "BA 02-03 PA 5521",
      nepaliPlate: "बा ०२-०३ प ५५२१",
      province: "BAGMATI",
      ownership: "Single Hand (1st Owner Bluebook)",
      location: "Thamel, Kathmandu",
      condition: "Like New (10/10)",
      paperwork: "Tax Cleared (Fiscal Year 2081/82)",
      highestBid: "NPR 2,90,000",
      timeLeft: "04:12:30 LEFT",
      imageUrl: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
      images: [
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "1. Front Mask & Bi-Functional LED" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Negative LCD Meter (11,800 KM)" },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "3. Deltabox Frame & 155cc VVA Engine" },
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "4. Aluminum Swingarm & Monoshock" },
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "5. 140-section Rear Radial Tyre" },
      ],
      sellerName: "Rabin Gurung",
      sellerPhone: "+977 9849-651230",
      sellerAddress: "Chhetrapati / Thamel, Kathmandu",
      inspectionAvailability: "Available daily from 11 AM - 5 PM at Thamel",
      bluebookStatus: "1st Hand Bluebook in hand (नामसारी तयार)",
      taxValidTill: "Paid up to Ashadh 2082",
      keysCount: "2 Original Keys",
      engineCondition: "Factory Sealed Engine • High Mileage",
      tyreCondition: "75% Radial Tyres Remaining",
      simpleHowItRuns: "Very smooth and easy to handle. Good petrol mileage (45 km per liter).",
      simpleAccidentStatus: "No dents, no scratches, never dropped. 100% clean body.",
      simplePapersStatus: "Single owner bluebook in hand. Road tax cleared up to 2082.",
      simpleKeysStatus: "Both 2 original keys included.",
      notes: "Very fun and easy bike to ride. The golden front shocks are totally clean with no oil leaks. Digital speed meter, headlights, and horn all work like new. Cared for with love since day one. Both original keys are ready for the buyer.",
      isTrending: true,
      viewCount: 275,
      bidCount: 12,
      hypeBadge: "POPULAR",
    },
    {
      id: "ktm-2",
      name: "2021 KTM RC 200 BS6",
      year: "2021",
      mileage: "16,400 KM",
      lotNumber: "BA 95 PA 7731",
      nepaliPlate: "बा ९५ प ७७३१",
      province: "BAGMATI",
      ownership: "Single Hand (1st Owner Bluebook)",
      location: "Suryabinayak, Bhaktapur",
      condition: "Good Health (8.5/10)",
      paperwork: "1 Year Tax Pending (Deductible at payout)",
      highestBid: "NPR 2,65,000",
      timeLeft: "05:50:00 LEFT",
      imageUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85",
      images: [
        { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "1. Track Aerodynamic Front Fairing" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Clip-On Cockpit & LCD Meter (16,400 KM)" },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "3. DOHC Liquid Cooled Engine & Exhaust" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "4. Trellis Subframe & Rear Wheel" },
        { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "5. MRF Revz Tyres & 300mm Disc" },
      ],
      sellerName: "Dinesh Karki",
      sellerPhone: "+977 9818-903421",
      sellerAddress: "Suryabinayak (Near Hospital), Bhaktapur",
      inspectionAvailability: "Available after 3:00 PM at Suryabinayak",
      bluebookStatus: "Original Bluebook in hand (1st Owner)",
      taxValidTill: "1 Year Pending (NPR 5,000 deductible from deal)",
      keysCount: "2 Factory Keys",
      engineCondition: "Tight compression • Revs smoothly",
      tyreCondition: "70% MRF Revz Tyres",
      simpleHowItRuns: "Fast and smooth. Quick throttle response, gears shift easily.",
      simpleAccidentStatus: "Never had a crash. Fairing, clip-ons, and wheels are straight and solid.",
      simplePapersStatus: "Original bluebook in hand. 1 year tax (Rs. 5,000) will be discounted from price for you.",
      simpleKeysStatus: "Both 2 keys included.",
      notes: "This bike runs fast and clean. It has zero accidental damage and the frame is 100% straight. Road tax for 1 year is due, but I will reduce that Rs. 5,000 directly from the selling price so you don't pay anything extra. Ready to transfer and ride!",
      isTrending: false,
      viewCount: 160,
      bidCount: 6,
    },
  ]);

  const [activeBidModal, setActiveBidModal] = useState<AuctionBike | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  // Live Dealer Bids & In-App Direct Messages (Part 2)
  const [liveBids, setLiveBids] = useState<BidRecord[]>(INITIAL_BIDS);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(INITIAL_MESSAGES);

  // Search & Filter State for Recondition Dealers
  const [searchQuery, setSearchQuery] = useState("");
  const [activeListingTab, setActiveListingTab] = useState<"all" | "trending">("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterSort, setFilterSort] = useState<"default" | "price_desc" | "price_asc" | "views" | "year_desc">("default");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Recondition Access Control (Gatekeeping live auction from normal posters)
  const [isReconditionVerified, setIsReconditionVerified] = useState(false);
  const [selectedReconditionHub, setSelectedReconditionHub] = useState("Teku Moto Recondition Hub");
  const [dealerViewMode, setDealerViewMode] = useState<"auctions" | "inventory" | "swiper" | "staff_chat" | "recruitment">("auctions");
  const [reconditionPan, setReconditionPan] = useState("601928471");
  const [pendingStaffCount, setPendingStaffCount] = useState(0);

  const HUB_PAN_MAP: Record<string, string> = {
    "Teku Moto Recondition Hub": "601928471",
    "Lalitpur Wheels & Exchange": "602849182",
    "Kupandole Superbikes Workshop": "604128945",
    "Balaju Riders Recondition Point": "603518290",
    "Bhaktapur Two-Wheeler Exchange": "605912431",
  };

  // Direct Post (Zero Sign-up) Modal State
  const [showDirectPostModal, setShowDirectPostModal] = useState(false);
  const [directPostSuccessToast, setDirectPostSuccessToast] = useState<string | null>(null);

  const handleDirectPostSubmit = (newPost: DirectPostData) => {
    // 1. Add to local state
    setAuctionItems((prev) => [newPost as AuctionBike, ...prev]);

    // 2. Persist to localStorage for seller dashboard
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("mulyankan_user_postings") || "[]");
        localStorage.setItem("mulyankan_user_postings", JSON.stringify([newPost, ...existing]));
      } catch {}
    }

    // 3. Asynchronously call API route
    try {
      fetch("/api/postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: newPost.name.split(" ")[1] || "Two-Wheeler",
          name: newPost.name,
          year: Number(newPost.year) || 2023,
          price: newPost.highestBid,
          location: newPost.location,
          numberPlate: newPost.lotNumber,
          category: "bike",
          specs: {
            mileage: newPost.mileage,
            engine: "Standard cc",
            owners: newPost.ownership,
            condition: newPost.condition,
          },
          sellerNote: newPost.notes,
          images: newPost.images.map((i) => i.url),
        }),
      }).catch(() => {});
    } catch {}

    // 4. Toast and redirect to My Postings (Poster sees their own vehicle, NOT the dealer auction floor)
    setDirectPostSuccessToast(
      `"${newPost.name}" posted directly without signing up! Recondition houses are now reviewing it.`
    );
    navigateTo("seller_dashboard");
    setTimeout(() => {
      setDirectPostSuccessToast(null);
    }, 4500);
  };

  // Computed / Filtered Listings
  const filteredAuctionItems = React.useMemo(() => {
    return auctionItems
      .filter((bike) => {
        // Trending Tab filter
        if (activeListingTab === "trending" && !bike.isTrending) {
          return false;
        }

        // Search Query filter (matches bike title, model year, location, seller, notes)
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

        // Brand filter
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
        const parsePrice = (priceStr: string) =>
          Number(priceStr.replace(/[^0-9]/g, "")) || 0;

        if (filterSort === "price_desc") {
          return parsePrice(b.highestBid) - parsePrice(a.highestBid);
        }
        if (filterSort === "price_asc") {
          return parsePrice(a.highestBid) - parsePrice(b.highestBid);
        }
        if (filterSort === "views") {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        if (filterSort === "year_desc") {
          return Number(b.year) - Number(a.year);
        }
        // Default sort: if trending tab, sort top hyped/trending first
        if (activeListingTab === "trending") {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        return 0;
      });
  }, [auctionItems, activeListingTab, searchQuery, filterBrand, filterSort]);

  // Countdown timer simulation for ticker
  const [countdown, setCountdown] = useState(821);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Unified History & Navigation Handler (Enables browser Back/Forward & Undo buttons)
  const navigateTo = (
    tab: "seller" | "dealer" | "seller_dashboard",
    view?: "auctions" | "inventory" | "swiper" | "staff_chat" | "recruitment",
    pushHistory: boolean = true
  ) => {
    setActiveTab(tab);
    if (view) {
      setDealerViewMode(view);
    }
    playSwooshSound();

    if (pushHistory && typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (tab !== "seller") {
        params.set("tab", tab);
      }
      if (tab === "dealer") {
        params.set("view", view || dealerViewMode);
      }
      const qs = params.toString();
      const newUrl = qs ? `?${qs}` : window.location.pathname;
      window.history.pushState({ tab, view: view || (tab === "dealer" ? dealerViewMode : undefined) }, "", newUrl);
    }
  };

  // Undo / Go Back handler (used by Back buttons across all headers, dashboards, and modals)
  const handleUndoBack = () => {
    playSwooshSound();

    // 1. If any modal is active, dismiss modal first
    if (selectedBike) {
      setSelectedBike(null);
      if (typeof window !== "undefined" && window.history.state?.bikeId) {
        window.history.back();
        return;
      }
    }
    if (showDirectPostModal) {
      setShowDirectPostModal(false);
      return;
    }
    if (activeBidModal) {
      setActiveBidModal(null);
      return;
    }

    // 2. If browser has stored state, pop back one level
    if (typeof window !== "undefined" && window.history.length > 1 && window.history.state) {
      window.history.back();
      return;
    }

    // 3. Fallback hierarchical undo
    if (activeTab === "dealer") {
      if (dealerViewMode !== "auctions") {
        navigateTo("dealer", "auctions", true);
        return;
      }
      navigateTo("seller", undefined, true);
      return;
    }
    if (activeTab === "seller_dashboard") {
      navigateTo("seller", undefined, true);
      return;
    }
  };

  const openBikeModal = (bike: AuctionBike) => {
    setSelectedBike(bike);
    setActiveSlideIndex(0);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("bikeId", bike.id);
      window.history.pushState(
        { tab: activeTab, view: dealerViewMode, bikeId: bike.id },
        "",
        `?${params.toString()}`
      );
    }
  };

  const closeBikeModal = () => {
    setSelectedBike(null);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("bikeId")) {
        if (window.history.state?.bikeId) {
          window.history.back();
        } else {
          params.delete("bikeId");
          const qs = params.toString();
          window.history.replaceState({ tab: activeTab, view: dealerViewMode }, "", qs ? `?${qs}` : window.location.pathname);
        }
      }
    }
  };

  // Product posted latest (top of list)
  const latestBike = auctionItems[0];

  // Redirect and open modal for the product that is posted latest
  const handleOpenLatestPosting = () => {
    playSwooshSound();
    navigateTo("dealer", "auctions", true);
    setAuctionItems((items) => {
      if (items.length > 0) {
        setSelectedBike(items[0]);
        setActiveSlideIndex(0);
      }
      return items;
    });

    if (typeof window !== "undefined") {
      const el = document.getElementById("auction-floor");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Sync state on browser Back/Forward (popstate event)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const params = new URLSearchParams(window.location.search);
      const tabParam = state?.tab || params.get("tab") || "seller";
      const viewParam = state?.view || params.get("view");
      const bikeIdParam = state?.bikeId || params.get("bikeId");

      if (tabParam === "seller_dashboard") {
        setActiveTab("seller_dashboard");
      } else if (tabParam === "dealer") {
        setActiveTab("dealer");
        if (viewParam && ["auctions", "inventory", "swiper", "staff_chat", "recruitment"].includes(viewParam)) {
          setDealerViewMode(viewParam as any);
        } else {
          setDealerViewMode("auctions");
        }
      } else {
        setActiveTab("seller");
      }

      if (bikeIdParam) {
        setAuctionItems((items) => {
          const match = items.find((b) => b.id === bikeIdParam);
          if (match) {
            setSelectedBike(match);
            setActiveSlideIndex(0);
          }
          return items;
        });
      } else {
        setSelectedBike(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Check URL query parameters and load any dynamically posted vehicles from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const latestParam = params.get("latest");
    const bikeIdParam = params.get("bikeId");

    // Initialize history state if none exists yet
    if (!window.history.state) {
      window.history.replaceState(
        { tab: tabParam || "seller", view: params.get("view") || "auctions" },
        "",
        window.location.href
      );
    }

    let loadedLatestId: string | null = null;
    try {
      const saved = localStorage.getItem("mulyankan_user_postings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedLatestId = parsed[0].id;
          setAuctionItems((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const fresh = parsed.filter((p: AuctionBike) => !existingIds.has(p.id));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {}

    if (tabParam === "seller_dashboard") {
      setActiveTab("seller_dashboard");
    } else if (tabParam === "dealer" || tabParam === "inventory" || tabParam === "swiper" || tabParam === "staff_chat" || tabParam === "recruitment") {
      setActiveTab("dealer");
      if (tabParam === "inventory" || params.get("view") === "inventory") {
        setDealerViewMode("inventory");
        setIsReconditionVerified(true);
      } else if (tabParam === "swiper" || params.get("view") === "swiper") {
        setDealerViewMode("swiper");
        setIsReconditionVerified(true);
      } else if (tabParam === "staff_chat" || params.get("view") === "staff_chat") {
        setDealerViewMode("staff_chat");
        setIsReconditionVerified(true);
      } else if (tabParam === "recruitment" || params.get("view") === "recruitment") {
        setDealerViewMode("recruitment");
        setIsReconditionVerified(true);
      }
    } else if (tabParam === "how-it-works" || params.get("section") === "how-it-works" || (typeof window !== "undefined" && window.location.hash === "#how-it-works")) {
      setActiveTab("seller");
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else if (tabParam === "about" || params.get("section") === "about" || (typeof window !== "undefined" && window.location.hash === "#about")) {
      setActiveTab("seller");
      setTimeout(() => {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }

    // Refresh pending staff count
    try {
      const apps = getStaffApplications();
      const count = apps.filter((a) => a.companyPan === reconditionPan && a.status === "pending_owner_approval").length;
      setPendingStaffCount(count);
    } catch {}

    if (latestParam === "1" || latestParam === "true" || bikeIdParam) {
      setTimeout(() => {
        setAuctionItems((items) => {
          const targetId = bikeIdParam || loadedLatestId;
          const targetBike = targetId ? items.find((b) => b.id === targetId) || items[0] : items[0];
          if (targetBike) {
            setSelectedBike(targetBike);
            setActiveSlideIndex(0);
          }
          return items;
        });
      }, 150);
    }
  }, []);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedBike) setSelectedBike(null);
        if (activeBidModal) setActiveBidModal(null);
      }
    };
    if (selectedBike || activeBidModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBike, activeBidModal]);

  const handleStartEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const model = vehicleModel.trim() || "Bajaj Pulsar NS200";
    const year = vehicleYear.trim() || "2021";
    router.push(`/condition-report?model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`);
  };

  const handlePlaceBid = (bike: AuctionBike) => {
    setActiveBidModal(bike);
    setBidAmount("250000");
  };

  const submitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBidModal) return;
    setAuctionItems((prev) =>
      prev.map((b) =>
        b.id === activeBidModal.id
          ? { ...b, highestBid: `NPR ${Number(bidAmount).toLocaleString()}` }
          : b
      )
    );
    setBidSuccess(true);
    setTimeout(() => {
      setBidSuccess(false);
      setActiveBidModal(null);
    }, 1200);
  };

  const handleDirectBidAmount = (bikeId: string, amountNpr: number) => {
    setAuctionItems((prev) =>
      prev.map((b) =>
        b.id === bikeId
          ? { ...b, highestBid: `NPR ${amountNpr.toLocaleString()}` }
          : b
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white font-sans antialiased selection:bg-[#E5B869] selection:text-black">
      {/* Toast notification for Zero Sign-up Direct Bike Post */}
      {directPostSuccessToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-base shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-white">Direct Listing Live!</h4>
            <p className="text-emerald-200 mt-0.5">{directPostSuccessToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setDirectPostSuccessToast(null)}
            className="text-neutral-400 hover:text-white text-xs p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Unified Global Navigation Header (Hidden on Recondition Owner & Staff Dashboard) */}
      {activeTab !== "dealer" && (
        <AppNavbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            navigateTo(tab);
          }}
          onBack={handleUndoBack}
          onOpenDirectPost={() => setShowDirectPostModal(true)}
          isReconditionVerified={isReconditionVerified}
          selectedReconditionHub={selectedReconditionHub}
          reconditionPan={reconditionPan}
          pendingStaffCount={pendingStaffCount}
          onLogoutRecondition={() => {
            setIsReconditionVerified(false);
            navigateTo("seller");
          }}
          postingsCount={auctionItems.filter((b) => b.sellerPhone === "+977 9841-283912" || b.id.startsWith("direct-")).length}
        />
      )}

      {/* ========================================================= */}
      {/* 1. SELLER (POSTER) VIEW                                    */}
      {/* ========================================================= */}
      {activeTab === "seller" && (
        <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#13151b] via-[#0d0e12] to-[#0a0a0d]">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-10 h-[450px] w-[450px] rounded-full bg-[#E5B869]/10 blur-[130px]" />
            <div className="absolute -bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[150px]" />
          </div>

          {/* Hero Main Content */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 lg:py-16 flex-1 flex flex-col justify-center">
            <div className="relative rounded-2xl sm:rounded-3xl bg-[#14161e] border border-white/10 p-5 sm:p-10 lg:p-14 overflow-hidden shadow-2xl backdrop-blur-xl">
              {/* Full Cover Bike Graphic with Seamless Multi-Directional Gradient Blend */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {/* 1. Base Image - Fully covers the entire box container */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/black-yamaha-r15.jpg"
                  alt="Black Yamaha YZF R15"
                  className="w-full h-full object-cover object-[75%_50%] sm:object-[78%_50%] lg:object-[82%_50%] brightness-[0.98] contrast-[1.06] scale-100"
                />

                {/* 2. Left-to-Right Heavy Obsidian Mask (Ensures text & form readability) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#14161e] from-20% via-[#14161e]/95 via-45% lg:via-48% to-transparent" />

                {/* 3. Bottom-to-Top Blend (Steppers sit on seamless solid obsidian) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14161e] from-15% via-[#14161e]/75 via-30% to-transparent" />

                {/* 4. Top-to-Bottom Subtle Shadow */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#14161e]/80 from-0% via-transparent via-25% to-transparent" />

                {/* 5. Right Edge Subtle Vignette (Prevents hard border cutoffs) */}
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#14161e]/40 to-transparent" />

                {/* 6. Subtle Luxury Warm Gold Backlight behind the motorcycle engine */}
                <div className="absolute top-1/3 right-[18%] w-[380px] h-[380px] rounded-full bg-[#E5B869]/10 blur-[110px] pointer-events-none" />
              </div>

              {/* Left Column: Typography & Gold Evaluation Card */}
              <div className="relative z-10 max-w-xl space-y-5 sm:space-y-6">
                {/* Headline */}
                <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.15]">
                  KNOW YOUR VEHICLE&apos;S <br />
                  <span className="text-white">TRUE VALUE.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-base text-neutral-300 font-normal leading-relaxed max-w-lg">
                  Receive transparent, expert offers from verified recondition owners instantly. Trustworthy valuations for a confident sale.
                </p>

                {/* Sleek Action Buttons: Evaluate or Post Directly */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleEvaluateClick}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full font-bold text-sm text-black bg-gradient-to-r from-[#E5B869] to-[#D4A352] hover:brightness-110 hover:shadow-[0_0_25px_rgba(229,184,105,0.4)] active:scale-[0.98] transition-all duration-200 cursor-pointer group w-full sm:w-auto"
                  >
                    <span>Post My Vehicle</span>
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDirectPostModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#E5B869] hover:shadow-[0_0_20px_rgba(229,184,105,0.25)] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow w-full sm:w-auto"
                  >
                    <span>Post Bike Directly</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold uppercase">
                      No Sign-up
                    </span>
                  </button>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Free to post &amp; receive offers from verified showrooms</span>
                  </div>
                </div>
              </div>

              {/* Bottom 3-Step Process Stepper Pills */}
              <div className="relative z-10 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10 flex flex-col items-center">
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <div className="w-8 h-8 rounded-full bg-[#E5B869] text-black flex items-center justify-center font-bold text-xs shrink-0 shadow">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white">1. Post bike (No sign-up)</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <div className="w-8 h-8 rounded-full bg-[#E5B869] text-black flex items-center justify-center font-bold text-xs shrink-0 shadow">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white">2. Owners bid privately</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <div className="w-8 h-8 rounded-full bg-[#E5B869] text-black flex items-center justify-center font-bold text-xs shrink-0 shadow">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white">3. Review in My Postings</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-neutral-400 font-medium">
                  Over 150+ Verified Recondition Owners Active.
                </p>
              </div>
            </div>

            {/* Live Kathmandu Exchange Floor / Vehicle Postings (Protected: Staff / Showrooms Only) */}
            {isReconditionVerified && (
              <LiveMarketplaceSection
                bikes={auctionItems}
                isAuthorized={isReconditionVerified}
                onSelectBike={(bike) => {
                  const found = auctionItems.find((b) => b.id === bike.id);
                  if (found) {
                    openBikeModal(found);
                  }
                }}
                onOpenDirectPost={() => setShowDirectPostModal(true)}
                onEnterShowroomBidding={() => {
                  navigateTo("dealer", "auctions");
                  playBikeRevSound();
                }}
              />
            )}

          </main>

          {/* 1. Operating Protocol: How It Works Section */}
          <HowItWorksSection
            onOpenDirectPost={() => setShowDirectPostModal(true)}
          />

          {/* 2. Teku Corridor & Transparency: About Us Section */}
          <AboutUsSection />

          {/* 3. Global App Footer */}
          <AppFooter
            onOpenDirectPost={() => setShowDirectPostModal(true)}
            onNavigateTab={(tab) => {
              navigateTo(tab);
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SELLER POSTINGS & INQUIRIES DASHBOARD VIEW             */}
      {/* ========================================================= */}
      {activeTab === "seller_dashboard" && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between bg-[#0d0e12]">
          <div className="w-full border-b border-white/10 bg-[#121318]/60 px-4 sm:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <button
                type="button"
                onClick={handleUndoBack}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer mr-1"
                title="Undo / Go back"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("seller")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-[#E5B869] font-bold">My Postings</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectPostModal(true)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#E5B869] text-black hover:bg-[#d8ab5c] transition-all cursor-pointer shadow flex items-center gap-1.5"
            >
              <span>+ Post Another Bike</span>
            </button>
          </div>

          <main className="flex-1">
            <SellerPostingsDashboard
              postings={auctionItems}
              bids={liveBids}
              messages={directMessages}
              onAcceptOffer={(bikeId, bidId, dealerName, amountNpr) => {
                setLiveBids((prev) =>
                  prev.map((b) =>
                    b.id === bidId
                      ? { ...b, status: "accepted" as const }
                      : b.bikeId === bikeId
                      ? { ...b, status: "outbid" as const }
                      : b
                  )
                );
              }}
              onRejectOffer={(bikeId, bidId) => {
                setLiveBids((prev) =>
                  prev.map((b) =>
                    b.id === bidId ? { ...b, status: "outbid" as const } : b
                  )
                );
              }}
              onPostNewVehicle={() => setShowDirectPostModal(true)}
            />
          </main>

          <AppFooter
            onOpenDirectPost={() => setShowDirectPostModal(true)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              playSwooshSound();
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. RECONDITION OWNER DASHBOARD VIEW                        */}
      {/* ========================================================= */}
      {activeTab === "dealer" && (
        !isReconditionVerified ? (
          <div className="min-h-[calc(100vh-50px)] flex flex-col justify-between bg-[#0d0e12]">
            {/* Minimal Header */}
            <header className="border-b border-white/10 bg-[#121318] px-4 sm:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUndoBack}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer shadow"
                  title="Undo / Go back"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("seller")}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  title="Return to Marketplace Home"
                >
                  <MulyankanLogo />
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigateTo("seller")}
                className="shrink-0 whitespace-nowrap text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border border-white/20 hover:border-[#E5B869] text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <span className="sm:hidden">← Home</span>
                <span className="hidden sm:inline">← Return to Home</span>
              </button>
            </header>

            {/* Verification Gate Box */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="w-full max-w-lg rounded-3xl bg-[#14161e] border border-[#E5B869]/30 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E5B869]/15 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869] mx-auto text-2xl shadow-[0_0_25px_rgba(229,184,105,0.25)]">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E5B869] bg-[#E5B869]/10 px-3 py-1 rounded-full border border-[#E5B869]/20">
                    Recondition Showrooms Only
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                    Live Auction Floor
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
                    Live vehicle auctions, competing workshop bids, and wholesale exchanges are strictly restricted to verified Recondition Showroom owners in Kathmandu Valley.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 text-left space-y-3">
                  <label className="text-xs text-neutral-300 font-bold uppercase tracking-wider block">
                    Select Your Verified Workshop Hub:
                  </label>
                  <select
                    value={selectedReconditionHub}
                    onChange={(e) => {
                      const hub = e.target.value;
                      setSelectedReconditionHub(hub);
                      setReconditionPan(HUB_PAN_MAP[hub] || "601928471");
                    }}
                    className="w-full bg-[#181a24] border border-white/20 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#E5B869]"
                  >
                    <option value="Teku Moto Recondition Hub">Teku Moto Recondition Hub (Teku, Kathmandu) • PAN: 601928471</option>
                    <option value="Lalitpur Wheels & Exchange">Lalitpur Wheels & Exchange (Gwarko, Lalitpur) • PAN: 602849182</option>
                    <option value="Kupandole Superbikes Workshop">Kupandole Superbikes Workshop (Kupandole, Lalitpur) • PAN: 604128945</option>
                    <option value="Balaju Riders Recondition Point">Balaju Riders Recondition Point (Balaju, Kathmandu) • PAN: 603518290</option>
                    <option value="Bhaktapur Two-Wheeler Exchange">Bhaktapur Two-Wheeler Exchange (Suryabinayak, Bhaktapur) • PAN: 605912431</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      playBikeRevSound();
                      setIsReconditionVerified(true);
                      navigateTo("dealer", "auctions");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(229,184,105,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Authorize &amp; Enter Live Auction Floor</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="text-xs text-neutral-400">
                    Are you a bike seller or poster?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo("seller_dashboard")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View My Offers in My Postings →
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirectPostModal(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#E5B869]/10 hover:bg-[#E5B869]/20 border border-[#E5B869]/30 text-[#E5B869] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>Post Bike (No Sign-up)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-neutral-500">
              <p>Recondition Hub Portal • Authorized Access Only</p>
            </footer>
          </div>
        ) : (
          <div className="min-h-screen flex flex-col bg-[#0d0e12]">
            {/* Dashboard Header Bar - Single row, sleek and compact as before */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121318]/95 backdrop-blur-md">
              {/* Row 1: identity + actions */}
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleUndoBack}
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
                  onClick={() => navigateTo("seller")}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  title="Return to Marketplace Home"
                >
                  <MulyankanLogo />
                </button>

                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate max-w-[180px]">Workshop: {selectedReconditionHub}</span>
                  <span className="text-[10px] text-neutral-400 font-mono bg-black/40 px-1.5 py-0.5 rounded border border-white/10">PAN: {reconditionPan}</span>
                </div>
              </div>

              {/* Right-aligned group: Recruitment Bell + Exit Workshop Session button */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Staff Recruitment Notification Bell */}
                <button
                  type="button"
                  onClick={() => {
                    navigateTo("dealer", "recruitment");
                  }}
                  className="relative p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-[#E5B869] transition-all cursor-pointer shrink-0"
                  title="Staff Recruitment & Approvals"
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
                  onClick={() => {
                    setIsReconditionVerified(false);
                    navigateTo("seller");
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white transition-all cursor-pointer shrink-0"
                >
                  <span className="sm:hidden">Exit</span>
                  <span className="hidden sm:inline">Exit Workshop Mode</span>
                </button>
              </div>
              </div>

              {/* Row 2: section navigation (swipeable on phones) */}
              <div className="border-t border-white/5">
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 overflow-x-auto no-scrollbar flex md:justify-center">
                  <GlidingNavLinks
                    size="sm"
                    items={[
                      {
                        label: "Live Floor",
                        isActive: dealerViewMode === "auctions",
                        onClick: () => {
                          navigateTo("dealer", "auctions");
                        },
                      },
                      {
                        label: "Swipe Deck",
                        isActive: dealerViewMode === "swiper",
                        onClick: () => {
                          navigateTo("dealer", "swiper");
                        },
                      },
                      {
                        label: "Staff War Room",
                        isActive: dealerViewMode === "staff_chat",
                        onClick: () => {
                          navigateTo("dealer", "staff_chat");
                        },
                      },
                      {
                        label: "Recruitment",
                        isActive: dealerViewMode === "recruitment",
                        onClick: () => {
                          navigateTo("dealer", "recruitment");
                        },
                      },
                      {
                        label: "Won Vehicles",
                        isActive: dealerViewMode === "inventory",
                        onClick: () => {
                          navigateTo("dealer", "inventory");
                        },
                      },
                      { label: "Seller View", onClick: () => navigateTo("seller") },
                      { label: "My Postings", onClick: () => navigateTo("seller_dashboard") },
                    ]}
                  />
                </div>
              </div>
            </header>

          {/* Dashboard Body: Toggle between Live Auction Floor, Showroom Purchase & Handover Console, Swiper Deck, and Staff Room */}
          {dealerViewMode === "inventory" ? (
            <div className="flex-1">
              <ReconditionInventoryDashboard
                showroomName={selectedReconditionHub}
                panNumber={reconditionPan}
                onBackToAuctionFloor={() => {
                  navigateTo("dealer", "auctions");
                }}
              />
            </div>
          ) : dealerViewMode === "swiper" ? (
            <div className="flex-1">
              <BikeSwipeAppraisal
                showroomName={selectedReconditionHub}
                panNumber={reconditionPan}
                initialBikes={auctionItems.map((b) => ({
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
                }))}
                onPlaceBid={(bikeId, amountNpr) => {
                  handleDirectBidAmount(bikeId, amountNpr);
                }}
                onShareToStaffChat={() => {
                  navigateTo("dealer", "staff_chat");
                }}
                onSwitchToStaffChat={() => {
                  navigateTo("dealer", "staff_chat");
                }}
                onSwitchToAuctionFloor={() => {
                  navigateTo("dealer", "auctions");
                }}
              />
            </div>
          ) : dealerViewMode === "staff_chat" ? (
            <div className="flex-1">
              <StaffGroupChat
                showroomName={selectedReconditionHub}
                panNumber={reconditionPan}
                availableBikes={auctionItems.map((b) => ({
                  id: b.id,
                  name: b.name,
                  lotNumber: b.lotNumber,
                  highestBid: b.highestBid,
                  imageUrl: b.imageUrl,
                  year: b.year,
                  mileage: b.mileage,
                }))}
                onPlaceBidFromChat={(bikeId: string, amountNpr: number) => {
                  handleDirectBidAmount(bikeId, amountNpr);
                }}
                onSwitchToAuction={() => {
                  navigateTo("dealer", "auctions");
                }}
                onSwitchToSwiper={() => {
                  navigateTo("dealer", "swiper");
                }}
              />
            </div>
          ) : dealerViewMode === "recruitment" ? (
            <div className="flex-1">
              <StaffRecruitmentConsole
                showroomName={selectedReconditionHub}
                panNumber={reconditionPan}
                onStaffApproved={() => {
                  setPendingStaffCount((prev) => Math.max(0, prev - 1));
                }}
                onBackToAuctionFloor={() => {
                  navigateTo("dealer", "auctions");
                }}
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
                  <span>All Listings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveListingTab("trending");
                    playSwooshSound();
                  }}
                  className={`w-full p-3 rounded-xl font-medium text-sm flex items-center justify-between transition-all text-left group cursor-pointer ${
                    activeListingTab === "trending"
                      ? "bg-gradient-to-r from-amber-500/20 via-[#161820] to-[#161820] border border-amber-500/50 text-[#E5B869] font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "hover:bg-white/5 text-neutral-300 hover:text-white"
                  }`}
                  title="View vehicles with highest market demand and hype"
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
                  onClick={handleOpenLatestPosting}
                  className="w-full p-3 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-white font-medium text-sm flex items-center justify-between transition-colors text-left group cursor-pointer"
                  title="View product posted latest"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span>New Posting</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    LATEST
                  </span>
                </button>

                <div className="col-span-2 md:col-span-1 pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-1">
                    Showroom Ops
                  </span>

                  {/* Swift Swipe & Offer */}
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo("dealer", "swiper");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-[#E5B869]/20 hover:border-[#E5B869]/40 bg-[#E5B869]/5"
                    title="Tinder-like swipe cards to rapidly like, pass, and offer prices"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-white group-hover:text-[#E5B869]">Swipe Deck</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/30">
                      OFFER
                    </span>
                  </button>

                  {/* Staff War Room Chat */}
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo("dealer", "staff_chat");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 bg-cyan-500/5"
                    title="Staff internal discussion room on valuations and repair deductions"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <span className="text-white group-hover:text-cyan-400">Staff Chat</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      ROOM
                    </span>
                  </button>

                  {/* Staff Recruitment & Approvals */}
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo("dealer", "recruitment");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5"
                    title="Review incoming staff applicants registered with your showroom PAN"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="text-white group-hover:text-amber-400">Recruitment</span>
                    </div>
                    {pendingStaffCount > 0 ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-black animate-pulse">
                        {pendingStaffCount} NEW
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">
                        ROSTER
                      </span>
                    )}
                  </button>

                  {/* Won Inventory */}
                  <button
                    type="button"
                    onClick={() => {
                      navigateTo("dealer", "inventory");
                    }}
                    className="w-full p-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all text-left group cursor-pointer hover:bg-white/5 text-neutral-300 hover:text-white border border-[#E5B869]/20 hover:border-[#E5B869]/40 bg-[#E5B869]/5"
                    title="Manage won auctions and spot handover schedule"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-white group-hover:text-[#E5B869]">Won Inventory</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACQUIRED
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => navigateTo("seller")}
                  className="w-full p-3 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white font-medium text-sm flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Evaluation</span>
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
                  onClick={handleOpenLatestPosting}
                  title="New Posting Notification - Click to view latest vehicle"
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
                onClick={handleOpenLatestPosting}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenLatestPosting();
                  }
                }}
                className="group p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#171a24] via-[#14161f] to-[#171a24] border border-[#E5B869]/30 hover:border-[#E5B869] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(229,184,105,0.2)]"
                title="Click to redirect to the product posted latest"
              >
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      New Posting
                    </span>
                    <strong className="text-white font-bold group-hover:text-[#E5B869] transition-colors">
                      {latestBike?.name || "Latest Vehicle"}
                    </strong>
                    <span className="text-neutral-400 text-xs hidden md:inline">
                      • {latestBike?.mileage} • {latestBike?.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Session</span>
                    <span className="font-mono font-bold text-red-500 tracking-wider">
                      {formatCountdown(countdown)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-black bg-[#E5B869] group-hover:bg-[#f3c678] px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md">
                    <span>View Product</span>
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
                      placeholder="Search listings by model, year, city (e.g. R15, KTM, Kathmandu)..."
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
                        All ({auctionItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveListingTab("trending");
                          playSwooshSound();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeListingTab === "trending"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                            : "text-neutral-300 hover:text-amber-400"
                        }`}
                        title="Show only trending vehicles getting high market hype"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Trending</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-bold">
                          {auctionItems.filter((b) => b.isTrending).length}
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
                      title="Toggle filters"
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
                        <span>Filter &amp; Sort Listings</span>
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
                          Reset Filters
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Brand Select */}
                      <div className="space-y-1.5">
                        <label className="block font-medium text-neutral-400">
                          Brand / Manufacturer
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
                          Sort Order
                        </label>
                        <select
                          value={filterSort}
                          onChange={(e) => setFilterSort(e.target.value as any)}
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
                        Recondition houses: These models currently receive the highest customer inquiries, test-ride requests, and dealer bidding volume.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    High Resale Velocity
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredAuctionItems.map((bike, idx) => (
                    <VehicleAuctionCard
                      key={bike.id}
                      bike={bike}
                      isLatest={bike.id === latestBike?.id}
                      onOpenDetails={() => {
                        openBikeModal(bike);
                      }}
                      onPlaceBid={(e) => {
                        e.stopPropagation();
                        handlePlaceBid(bike);
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
                  <h3 className="text-base font-bold text-white">No vehicles matched your search</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Try searching for another motorcycle brand (like Yamaha, KTM, Bajaj) or reset your active filters.
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

          {/* Recondition Dashboard Footer */}
          <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-neutral-500">
            <p>Recondition Owner dashboard • MULYANKAN Live Bidding Portal</p>
          </footer>
        </div>
        )
      )}

      {/* ========================================================= */}
      {/* 3. PLACE BID QUICK MODAL                                  */}
      {/* ========================================================= */}
      {activeBidModal && (
        <div
          onClick={() => setActiveBidModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#161820] border border-[#E5B869]/40 p-6 shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black text-white tracking-wide">
                  {activeBidModal.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {activeBidModal.year} • {activeBidModal.mileage} • Owner: {activeBidModal.sellerName} ({activeBidModal.location.split(",")[0]})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBidModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {bidSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-white">Dealer Offer Recorded!</h4>
                <p className="text-xs text-neutral-400">
                  Communicated directly to seller {activeBidModal.sellerName} at {activeBidModal.sellerPhone}.
                </p>
              </div>
            ) : (
              <form onSubmit={submitBid} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Current Highest Offer:</span>
                  <span className="font-black text-[#E5B869] text-base">{activeBidModal.highestBid}</span>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="bid-amount" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Your Dealer Offer (NPR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-neutral-400">
                      NPR
                    </span>
                    <input
                      id="bid-amount"
                      type="number"
                      step="1000"
                      min="100000"
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-black border border-white/20 rounded-xl pl-14 pr-4 py-3 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#E5B869] focus:border-[#E5B869]"
                    />
                  </div>

                  {/* Quick Bid Increment Helpers */}
                  <div className="flex gap-2 pt-1">
                    {[2000, 5000, 10000].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => {
                          playSwooshSound();
                          const current = Number(bidAmount) || 250000;
                          setBidAmount(String(current + inc));
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-[#E5B869]/20 hover:border-[#E5B869]/40 border border-white/10 text-[11px] font-mono font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        +{inc.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveBidModal(null)}
                    className="flex-1 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-xs font-semibold text-neutral-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                  >
                    Submit Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VEHICLE CONDITION & SLIDESHOW DETAILS MODAL            */}
      {/* ========================================================= */}
      {selectedBike && (
        <div
          onClick={closeBikeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-3xl bg-[#14161e] border border-[#E5B869]/40 shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
          >
            {/* Modal Top Header - Featuring Large, High-Visibility Number Plate */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#181a24] shrink-0">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Authentic Vehicular Plate Badge */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-neutral-400 mb-1">
                    Registered Vehicle Plate
                  </span>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-b from-[#1c1e28] to-[#12141c] border border-white/20 shadow-inner">
                    <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase border-r border-white/15 pr-2.5">
                      NEPAL
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-sans">
                      {selectedBike.lotNumber}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col gap-1 pl-4 border-l border-white/10">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium w-fit">
                    Direct Owner Sale (No Broker)
                  </span>
                  <span className="text-xs text-neutral-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{selectedBike.inspectionAvailability || "Spot inspection available today"}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Direct Call to Seller Button */}
                <a
                  href={`tel:${selectedBike.sellerPhone}`}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold transition-all shadow cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="hidden sm:inline">Call Owner:</span>
                  <span>{selectedBike.sellerPhone}</span>
                </a>

                {/* Close / Exit Button */}
                <button
                  type="button"
                  onClick={closeBikeModal}
                  title="Back / Close (or tap outside / press Esc)"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back / Close</span>
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left 7 Cols: Slideshow of Seller Photos */}
              <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                <div>
                  {/* Main Display */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl bg-black border border-white/10 overflow-hidden group select-none shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedBike.images[activeSlideIndex]?.url || selectedBike.imageUrl}
                      alt={selectedBike.images[activeSlideIndex]?.label || selectedBike.name}
                      className="w-full h-full object-cover transition-all duration-200"
                    />

                    {/* Photo Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-xs font-medium text-white shadow flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#E5B869]" />
                        <span>Photo {activeSlideIndex + 1} of {selectedBike.images.length}</span>
                      </span>
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-xs text-neutral-300">
                        {activeSlideIndex + 1} / {selectedBike.images.length}
                      </span>
                    </div>

                    {/* Left / Right Arrow Buttons */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex((prev) =>
                          prev > 0 ? prev - 1 : selectedBike.images.length - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/75 hover:bg-[#E5B869] text-white hover:text-black border border-white/20 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex((prev) =>
                          prev < selectedBike.images.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/75 hover:bg-[#E5B869] text-white hover:text-black border border-white/20 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                    >
                      ›
                    </button>
                  </div>

                  {/* Thumbnail Strip - Silent Glide (No sound) */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 px-1">
                      <span className="font-medium text-xs text-neutral-300">
                        Photos from seller:
                      </span>
                      <span className="text-xs text-neutral-400">
                        {selectedBike.images.length} photos
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 select-none">
                      {selectedBike.images.map((img, idx) => (
                        <div
                          key={idx}
                          onMouseEnter={() => {
                            if (activeSlideIndex !== idx) {
                              setActiveSlideIndex(idx);
                            }
                          }}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`relative aspect-[16/10] rounded-xl overflow-hidden border cursor-pointer transition-all duration-150 group ${
                            idx === activeSlideIndex
                              ? "border-[#E5B869] ring-2 ring-[#E5B869]/50 scale-[1.02] shadow-[0_0_12px_rgba(229,184,105,0.3)]"
                              : "border-white/15 opacity-60 hover:opacity-100 hover:border-white/40"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                          <span className="absolute bottom-1 inset-x-1 text-[9px] font-medium text-white truncate text-center">
                            Photo {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recondition Dealer Bidding Box - Directly Below Image Slideshow (Visible to verified recondition owners only) */}
                {activeTab === "dealer" && isReconditionVerified ? (
                  <DealerBiddingConsole
                    bikeId={selectedBike.id}
                    bikeName={selectedBike.name}
                    sellerName={selectedBike.sellerName}
                    sellerPhone={selectedBike.sellerPhone}
                    currentHighestBidNpr={Number(selectedBike.highestBid.replace(/[^0-9]/g, "")) || 250000}
                    bids={liveBids}
                    messages={directMessages}
                    onNewBidSubmit={(amountNpr, dealerName, location) => {
                      const newBid: BidRecord = {
                        id: `bid-${Date.now()}`,
                        bikeId: selectedBike.id,
                        dealerName,
                        dealerLocation: location,
                        amountNpr,
                        timestamp: "Just now",
                        status: "active",
                        verifiedDealer: true,
                      };

                      setLiveBids((prev) => [
                        newBid,
                        ...prev.map((b) => (b.bikeId === selectedBike.id ? { ...b, status: "outbid" as const } : b)),
                      ]);

                      setAuctionItems((prev) =>
                        prev.map((b) =>
                          b.id === selectedBike.id
                            ? {
                                ...b,
                                highestBid: `NPR ${amountNpr.toLocaleString()}`,
                                bidCount: (b.bidCount || 0) + 1,
                              }
                            : b
                        )
                      );

                      setSelectedBike((prev) =>
                        prev
                          ? {
                              ...prev,
                              highestBid: `NPR ${amountNpr.toLocaleString()}`,
                              bidCount: (prev.bidCount || 0) + 1,
                            }
                          : null
                      );
                    }}
                    onSendMessage={(messageText) => {
                      const newMsg: DirectMessage = {
                        id: `msg-${Date.now()}`,
                        bikeId: selectedBike.id,
                        sender: "dealer",
                        senderName: "Verified Workshop",
                        message: messageText,
                        timestamp: "Just now",
                      };
                      setDirectMessages((prev) => [...prev, newMsg]);
                    }}
                  />
                ) : (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#181a24] border border-[#E5B869]/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#E5B869]">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <svg className="w-3.5 h-3.5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Live Auction Active (Verified Recondition Showrooms Only)</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Confidential Bids
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        To protect fair market price discovery and prevent dealer collusion, active bids, workshop margins, and counter-offers are visible exclusively to registered recondition houses.
                      </p>

                      <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-neutral-400">Current Highest Standing Offer</div>
                          <div className="text-xl font-black text-[#E5B869] tracking-wide">{selectedBike.highestBid}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBike(null);
                            setActiveTab("seller_dashboard");
                          }}
                          className="px-4 py-2 rounded-xl bg-[#E5B869] text-black font-black text-xs hover:bg-[#d8ab5c] transition-all cursor-pointer shadow-[0_0_15px_rgba(229,184,105,0.3)] flex items-center gap-1.5"
                        >
                          <span>View My Offers in My Postings</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Fair Deal & Spot Check Guarantee */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs text-neutral-300">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      ✓
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-emerald-300">Physical inspection before final payment</p>
                      <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                        Place your offer with confidence. If you notice any undisclosed engine sound or frame damage during the physical checkup, you can withdraw your offer without penalty.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Vehicle Dossier & Condition */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    {/* Bike Title & Specs */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                        {selectedBike.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {selectedBike.isTrending && (
                          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-[#E5B869] text-xs font-bold flex items-center gap-1">
                            <span>{selectedBike.hypeBadge || "High Hype Listing"}</span>
                          </span>
                        )}
                      {selectedBike.viewCount && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-neutral-300 text-xs font-medium flex items-center gap-1.5 border border-white/10">
                          <svg className="w-3.5 h-3.5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{selectedBike.viewCount} Views</span>
                          {selectedBike.bidCount && <span>• {selectedBike.bidCount} Bids placed</span>}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-medium">
                        Model: {selectedBike.year}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                        {selectedBike.mileage} genuine
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-neutral-300 text-xs font-medium">
                        {selectedBike.ownership.split(" (")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Seller Contact Card */}
                  <div className="rounded-2xl bg-[#181a24] border border-white/10 p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E5B869] text-black font-bold text-sm flex items-center justify-center shadow">
                          {selectedBike.sellerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                            <span>{selectedBike.sellerName}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30">
                              Direct Owner
                            </span>
                          </h4>
                          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-[#E5B869] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{selectedBike.sellerAddress}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <a
                        href={`tel:${selectedBike.sellerPhone}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Call Owner ({selectedBike.sellerPhone})</span>
                      </a>
                    </div>
                  </div>

                  {/* Clear Condition Report */}
                  <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          Overall vehicle condition
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        {selectedBike.condition}
                      </span>
                    </div>

                    {/* 4 Simple, Clear Answers */}
                    <div className="space-y-2.5 text-xs">
                      {/* 1. How it runs */}
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-white text-xs">Does it start and ride well?</p>
                          <p className="text-neutral-300 mt-0.5 text-xs leading-relaxed font-normal">{selectedBike.simpleHowItRuns}</p>
                        </div>
                      </div>

                      {/* 2. Any accidents or scratches */}
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-white text-xs">Any crashes, falls, or dents?</p>
                          <p className="text-neutral-300 mt-0.5 text-xs leading-relaxed font-normal">{selectedBike.simpleAccidentStatus}</p>
                        </div>
                      </div>

                      {/* 3. Official Papers */}
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-white text-xs">Are the official papers (bluebook) ready?</p>
                          <p className="text-neutral-300 mt-0.5 text-xs leading-relaxed font-normal">{selectedBike.simplePapersStatus}</p>
                        </div>
                      </div>

                      {/* 4. Keys */}
                      <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <p className="font-semibold text-white text-xs">Are keys included?</p>
                          <p className="text-neutral-300 mt-0.5 text-xs leading-relaxed font-normal">{selectedBike.simpleKeysStatus}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seller Remarks - Real Human Voice */}
                  {selectedBike.notes && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E5B869]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <span>Note from the owner:</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                        &ldquo;{selectedBike.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Post (Zero Sign-up) Modal */}
      <DirectPostBikeModal
        isOpen={showDirectPostModal}
        onClose={() => setShowDirectPostModal(false)}
        onSubmit={handleDirectPostSubmit}
      />
    </div>
  );
}



