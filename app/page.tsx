"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postListing } from "./lib/postListing";
import { useLiveUpdates } from "./lib/useLiveUpdates";
import { VehicleReelsFeed } from "./lib/VehicleReelsFeed";
import { DealerTabBar, TAB_ICONS } from "./lib/DealerTabBar";
import { BikesExplore } from "./lib/BikesExplore";
import { SwipeBikes } from "./lib/SwipeBikes";
import { ChatInbox } from "./lib/ChatInbox";
import { ShopProfile } from "./lib/ShopProfile";
import { clearSession, getSession, saveSession } from "./lib/session";
import { BikeDetailsScreen } from "./lib/BikeDetailsScreen";
import { BidRecord, DirectMessage } from "./lib/dealerBidsData";
import { SellerPostingsDashboard } from "./lib/SellerPostingsDashboard";
import { DirectPostBikeModal, DirectPostData } from "./lib/DirectPostBikeModal";
import { ReconditionInventoryDashboard } from "./lib/ReconditionInventoryDashboard";
import StaffRecruitmentConsole from "./lib/StaffRecruitmentConsole";
import { getStaffApplications, StaffApplication } from "./lib/companyStaffData";
import HowItWorksSection from "./lib/HowItWorksSection";
import AboutUsSection from "./lib/AboutUsSection";
import AppNavbar from "./lib/AppNavbar";
import AppFooter from "./lib/AppFooter";
import LiveMarketplaceSection from "./lib/LiveMarketplaceSection";
import { SellerApp, SellerView } from "./lib/SellerApp";
import { useAppLayout, useIsApp } from "./lib/appMode";
import { DesktopShopDashboard, DesktopShopView } from "./lib/DesktopShopDashboard";
import { DealerBiddingConsole } from "./lib/DealerBiddingConsole";

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
  createdAt?: string;
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

export default function MulyankanApp() {
  const router = useRouter();

  const handleEvaluateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playBikeRevSound();
    router.push("/condition-report");
  };

  // Mode Toggle: "seller" | "dealer" | "seller_dashboard"
  const [activeTab, setActiveTab] = useState<"seller" | "dealer" | "seller_dashboard">("seller");
  // Android app and phone browsers use the app layout; desktop browsers keep the website layout
  const appLayout = useAppLayout();
  const isApp = useIsApp();
  const sellerInApp = appLayout && activeTab !== "dealer";
  const [sellerAppView, setSellerAppView] = useState<Exclude<SellerView, "bikes">>("home");

  // Seller Form State
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  // Selected Bike for Detailed Disclosure & Slideshow Modal
  const [selectedBike, setSelectedBike] = useState<AuctionBike | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Live auction listings, loaded from /api/postings (empty until sellers post)
  const [auctionItems, setAuctionItems] = useState<AuctionBike[]>([]);

  const [activeBidModal, setActiveBidModal] = useState<AuctionBike | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  // Live Dealer Bids & In-App Direct Messages (Part 2)
  const [liveBids, setLiveBids] = useState<BidRecord[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

  // Ids of postings created from this device (there are no seller accounts yet)
  const MY_POSTINGS_KEY = "mulyankan_my_posting_ids";
  const [myPostingIds, setMyPostingIds] = useState<string[]>([]);
  // Listing to open once the first fetch lands (from ?latest / ?bikeId deep links)
  const pendingOpenRef = useRef<{ bikeId: string | null; latest: boolean } | null>(null);

  const refreshMarketplace = React.useCallback(async () => {
    try {
      const [p, b, m] = await Promise.all([
        fetch("/api/postings", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/bids", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/messages", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (Array.isArray(p?.data)) {
        setAuctionItems(p.data);
        const pending = pendingOpenRef.current;
        if (pending && p.data.length > 0) {
          pendingOpenRef.current = null;
          const target = (pending.bikeId && p.data.find((x: AuctionBike) => x.id === pending.bikeId)) || p.data[0];
          setSelectedBike(target);
          setActiveSlideIndex(0);
        }
        // Keep an open detail modal in sync with the latest bid
        setSelectedBike((cur) => (cur ? p.data.find((x: AuctionBike) => x.id === cur.id) || cur : cur));
      }
      if (Array.isArray(b?.data)) setLiveBids(b.data);
      if (Array.isArray(m?.data)) setDirectMessages(m.data);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      setMyPostingIds(JSON.parse(localStorage.getItem(MY_POSTINGS_KEY) || "[]"));
    } catch {}
    refreshMarketplace();
  }, [refreshMarketplace]);

  // Real-time: refetch as soon as the server reports a marketplace change
  useLiveUpdates((topic) => {
    if (topic !== "staffMessages") refreshMarketplace();
  });

  const myPostings = React.useMemo(
    () => auctionItems.filter((b) => myPostingIds.includes(b.id)),
    [auctionItems, myPostingIds]
  );

  // Recondition Access Control (Gatekeeping live auction from normal posters)
  const [isReconditionVerified, setIsReconditionVerified] = useState(false);
  const [selectedReconditionHub, setSelectedReconditionHub] = useState("Teku Moto Recondition Hub");
  const [dealerViewMode, setDealerViewMode] = useState<"feed" | "auctions" | "inventory" | "swiper" | "staff_chat" | "recruitment" | "profile">("auctions");
  const [reconditionPan, setReconditionPan] = useState("601928471");
  const [pendingStaffCount, setPendingStaffCount] = useState(0);
  // Who is logged in to the workshop (from the saved session)
  const [workshopRole, setWorkshopRole] = useState<"recondition" | "staff">("recondition");
  const [workshopUser, setWorkshopUser] = useState<string | undefined>(undefined);

  const HUB_PAN_MAP: Record<string, string> = {
    "Teku Moto Recondition Hub": "601928471",
    "Lalitpur Wheels & Exchange": "602849182",
    "Kupandole Superbikes Workshop": "604128945",
    "Balaju Riders Recondition Point": "603518290",
    "Bhaktapur Two-Wheeler Exchange": "605912431",
  };

  // Vehicles this showroom won: listings where its bid was accepted by the seller
  const acquiredVehicles = React.useMemo(
    () =>
      liveBids
        .filter((bid) => bid.status === "accepted" && bid.dealerName === selectedReconditionHub)
        .flatMap((bid) => {
          const bike = auctionItems.find((b) => b.id === bid.bikeId);
          if (!bike) return [];
          return [
            {
              id: bid.id,
              name: bike.name,
              year: bike.year,
              lotNumber: bike.lotNumber,
              nepaliPlate: bike.nepaliPlate || bike.lotNumber,
              sellerName: bike.sellerName,
              sellerPhone: bike.sellerPhone,
              meetingLocation: bike.sellerAddress,
              meetingTime: bike.inspectionAvailability || "To be arranged with seller",
              purchasePriceNpr: bid.amountNpr,
              reconditionCostNpr: 0,
              expectedResalePriceNpr: bid.amountNpr,
              status: "inspection_scheduled" as const,
              imageUrl: bike.imageUrl,
              notes: bike.notes,
            },
          ];
        }),
    [liveBids, auctionItems, selectedReconditionHub]
  );

  // Direct Post (Zero Sign-up) Modal State
  const [showDirectPostModal, setShowDirectPostModal] = useState(false);
  const [directPostSuccessToast, setDirectPostSuccessToast] = useState<string | null>(null);

  const handleDirectPostSubmit = async (newPost: DirectPostData) => {
    // Errors propagate to the modal, which shows them and keeps the form open
    const saved = (await postListing(newPost)) as unknown as AuctionBike;
    setAuctionItems((prev) => [saved, ...prev]);
    setMyPostingIds((prev) => [saved.id, ...prev]);

    // 4. Toast and redirect to My Postings (Poster sees their own vehicle, NOT the dealer auction floor)
    setDirectPostSuccessToast(
      `"${newPost.name}" posted directly without signing up! Recondition houses are now reviewing it.`
    );
    navigateTo("seller_dashboard");
    setTimeout(() => {
      setDirectPostSuccessToast(null);
    }, 4500);
  };

  // Unified History & Navigation Handler (Enables browser Back/Forward & Undo buttons)
  const navigateTo = (
    tab: "seller" | "dealer" | "seller_dashboard",
    view?: "feed" | "auctions" | "inventory" | "swiper" | "staff_chat" | "recruitment" | "profile",
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
        if (viewParam && ["feed", "auctions", "inventory", "swiper", "staff_chat", "recruitment", "profile"].includes(viewParam)) {
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

    // Logged-in showroom owners and staff open straight into the vehicle feed
    const session = getSession();
    if (session) {
      setSelectedReconditionHub(session.showroomName);
      setReconditionPan(session.panNumber);
      setWorkshopRole(session.role);
      setWorkshopUser(session.userName);
    }

    const WORKSHOP_VIEWS = ["feed", "auctions", "inventory", "swiper", "staff_chat", "recruitment", "profile"] as const;
    const viewParam = params.get("view") as (typeof WORKSHOP_VIEWS)[number] | null;
    if (session && (!tabParam || tabParam === "dealer")) {
      const view = viewParam && WORKSHOP_VIEWS.includes(viewParam) ? viewParam : "feed";
      setActiveTab("dealer");
      setDealerViewMode(view);
      setIsReconditionVerified(true);
      window.history.replaceState({ tab: "dealer", view }, "", `?tab=dealer&view=${view}`);
    } else if (tabParam === "seller_dashboard") {
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
      pendingOpenRef.current = { bikeId: bikeIdParam, latest: true };
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
    const current = Number(bike.highestBid.replace(/[^0-9]/g, "")) || 0;
    setBidAmount(String(current + 1000));
  };

  // Sends a bid to the server; the server updates the listing's highest bid and bid count.
  const sendBid = async (bikeId: string, amountNpr: number, dealerName: string, dealerLocation: string) => {
    const res = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bikeId, amountNpr, dealerName, dealerLocation }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      window.alert(json?.error || "Could not place your bid.");
      return false;
    }
    await refreshMarketplace();
    return true;
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBidModal) return;
    const ok = await sendBid(activeBidModal.id, Number(bidAmount), selectedReconditionHub, "Kathmandu Valley");
    if (!ok) return;
    setBidSuccess(true);
    setTimeout(() => {
      setBidSuccess(false);
      setActiveBidModal(null);
    }, 1200);
  };

  // Workshop screens
  const [reelOverlay, setReelOverlay] = useState<{ ids: string[]; index: number } | null>(null);
  const [shareBikeId, setShareBikeId] = useState<string | null>(null);
  const clearShareBike = React.useCallback(() => setShareBikeId(null), []);

  const findBike = (id: string) => auctionItems.find((b) => b.id === id);
  const openBidFor = (v: { id: string }) => {
    const bike = findBike(v.id);
    if (bike) handlePlaceBid(bike);
  };
  const openDetailsFor = (v: { id: string }) => {
    const bike = findBike(v.id);
    if (bike) openBikeModal(bike);
  };
  const shareToTeam = (v: { id: string }) => {
    setReelOverlay(null);
    setShareBikeId(v.id);
    navigateTo("dealer", "staff_chat");
  };
  const sendSellerMessage = async (bikeId: string, text: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bikeId, sender: "dealer", senderName: selectedReconditionHub, message: text }),
    }).catch(() => null);
    if (!res?.ok) return false;
    refreshMarketplace();
    return true;
  };
  const logOutWorkshop = () => {
    clearSession();
    setIsReconditionVerified(false);
    // The Android app starts on the login page, so logging out goes back there
    if (isApp) {
      router.push("/login");
      return;
    }
    navigateTo("seller");
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
      {activeTab !== "dealer" && !sellerInApp && (
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
            clearSession();
            setIsReconditionVerified(false);
            navigateTo("seller");
          }}
          postingsCount={myPostings.length}
        />
      )}

      {/* ========================================================= */}
      {/* 1. SELLER (POSTER) VIEW                                    */}
      {/* ========================================================= */}
      {activeTab === "seller" && !sellerInApp && (
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
      {sellerInApp && (
        <SellerApp
          view={activeTab === "seller_dashboard" ? "bikes" : sellerAppView}
          onViewChange={(v) => {
            if (v === "bikes") {
              navigateTo("seller_dashboard");
              return;
            }
            setSellerAppView(v);
            if (activeTab !== "seller") navigateTo("seller");
          }}
          postings={myPostings}
          bids={liveBids}
          messages={directMessages}
          onSell={() => setShowDirectPostModal(true)}
          onAccept={async (bidId) => {
            await fetch("/api/bids", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bidId, action: "accept" }),
            }).catch(() => {});
            await refreshMarketplace();
          }}
          onReject={async (bidId) => {
            await fetch("/api/bids", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bidId, action: "reject" }),
            }).catch(() => {});
            await refreshMarketplace();
          }}
          onSendMessage={async (bikeId, text) => {
            const bike = myPostings.find((b) => b.id === bikeId);
            const res = await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bikeId, sender: "seller", senderName: bike?.sellerName || "Seller", message: text }),
            }).catch(() => null);
            if (!res?.ok) return false;
            refreshMarketplace();
            return true;
          }}
          onShopLogin={() => router.push("/login")}
          onSignup={() => router.push("/signup")}
        />
      )}

      {activeTab === "seller_dashboard" && !sellerInApp && (
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
              postings={myPostings}
              bids={liveBids}
              messages={directMessages}
              onAcceptOffer={async (_bikeId, bidId) => {
                await fetch("/api/bids", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ bidId, action: "accept" }),
                }).catch(() => {});
                refreshMarketplace();
              }}
              onRejectOffer={async (_bikeId, bidId) => {
                await fetch("/api/bids", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ bidId, action: "reject" }),
                }).catch(() => {});
                refreshMarketplace();
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
                    For Bike Shops
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                    Shop Login
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
                    Only bike shops can see the bikes and make offers.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 text-left space-y-3">
                  <label className="text-xs text-neutral-300 font-bold uppercase tracking-wider block">
                    Pick Your Shop:
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
                      saveSession({ role: "recondition", showroomName: selectedReconditionHub, panNumber: reconditionPan });
                      setIsReconditionVerified(true);
                      navigateTo("dealer", "feed");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(229,184,105,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Go In</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="text-xs text-neutral-400">
                    Selling a bike?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo("seller_dashboard")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      See My Offers →
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirectPostModal(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#E5B869]/10 hover:bg-[#E5B869]/20 border border-[#E5B869]/30 text-[#E5B869] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>Sell a Bike</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-neutral-500">
              <p>For bike shops only</p>
            </footer>
          </div>
        ) : !appLayout ? (
          <DesktopShopDashboard
            view={(["auctions", "swiper", "staff_chat", "recruitment", "inventory"].includes(dealerViewMode) ? dealerViewMode : "auctions") as DesktopShopView}
            bikes={auctionItems}
            showroomName={selectedReconditionHub}
            panNumber={reconditionPan}
            pendingStaffCount={pendingStaffCount}
            acquiredVehicles={acquiredVehicles}
            onNavigate={(v) => navigateTo("dealer", v)}
            onOpenBike={openDetailsFor}
            onBid={openBidFor}
            onDirectBid={(bikeId, amountNpr) => {
              sendBid(bikeId, amountNpr, selectedReconditionHub, "Kathmandu Valley");
            }}
            onStaffApproved={() => setPendingStaffCount((prev) => Math.max(0, prev - 1))}
            onBack={handleUndoBack}
            onLogout={logOutWorkshop}
            onSell={() => setShowDirectPostModal(true)}
            onSellerHome={() => navigateTo("seller")}
            onMyPostings={() => navigateTo("seller_dashboard")}
          />
        ) : (
          <div className="h-[100dvh] flex flex-col bg-[#0d0e12]">
            <main className="relative flex-1 min-h-0 overflow-hidden">
              {dealerViewMode === "feed" ? (
                <VehicleReelsFeed
                  vehicles={auctionItems}
                  bids={liveBids}
                  showroomName={selectedReconditionHub}
                  onBid={openBidFor}
                  onDetails={openDetailsFor}
                  onShareToStaff={shareToTeam}
                  onSearch={() => navigateTo("dealer", "auctions")}
                />
              ) : dealerViewMode === "auctions" ? (
                <BikesExplore
                  vehicles={auctionItems}
                  onOpen={(list, index) => setReelOverlay({ ids: list.map((v) => v.id), index })}
                />
              ) : dealerViewMode === "swiper" ? (
                <SwipeBikes
                  vehicles={auctionItems}
                  onSendOffer={(id, amount) => sendBid(id, amount, selectedReconditionHub, "Kathmandu Valley")}
                  onAskTeam={shareToTeam}
                  onDetails={openDetailsFor}
                />
              ) : dealerViewMode === "staff_chat" ? (
                <ChatInbox
                  showroomName={selectedReconditionHub}
                  panNumber={reconditionPan}
                  vehicles={auctionItems}
                  sellerMessages={directMessages}
                  onSendSellerMessage={sendSellerMessage}
                  onSendOffer={(id, amount) => sendBid(id, amount, selectedReconditionHub, "Kathmandu Valley")}
                  onOpenBike={(id) => openDetailsFor({ id })}
                  shareBikeId={shareBikeId}
                  onShareHandled={clearShareBike}
                />
              ) : dealerViewMode === "profile" ? (
                <ShopProfile
                  showroomName={selectedReconditionHub}
                  panNumber={reconditionPan}
                  userName={workshopUser}
                  role={workshopRole}
                  vehicles={auctionItems}
                  offersMade={liveBids.filter((b) => b.dealerName === selectedReconditionHub).length}
                  boughtCount={acquiredVehicles.length}
                  pendingStaffCount={pendingStaffCount}
                  onOpen={(list, index) => setReelOverlay({ ids: list.map((v) => v.id), index })}
                  onBought={() => navigateTo("dealer", "inventory")}
                  onHire={() => navigateTo("dealer", "recruitment")}
                  onSell={() => setShowDirectPostModal(true)}
                  onMyBikes={() => navigateTo("seller_dashboard")}
                  onSellerHome={() => navigateTo("seller")}
                  onLogout={logOutWorkshop}
                />
              ) : (
                <div className="h-full overflow-y-auto bg-[#0d0e12]">
                  {dealerViewMode === "inventory" ? (
                    <ReconditionInventoryDashboard
                      showroomName={selectedReconditionHub}
                      panNumber={reconditionPan}
                      acquiredVehicles={acquiredVehicles}
                      onBackToAuctionFloor={() => navigateTo("dealer", "profile")}
                    />
                  ) : (
                    <StaffRecruitmentConsole
                      showroomName={selectedReconditionHub}
                      panNumber={reconditionPan}
                      onStaffApproved={() => {
                        setPendingStaffCount((prev) => Math.max(0, prev - 1));
                      }}
                      onBackToAuctionFloor={() => navigateTo("dealer", "profile")}
                    />
                  )}
                </div>
              )}
            </main>

            {/* Bottom tab bar */}
            <DealerTabBar
              tabs={[
                { key: "home", label: "Home", icon: TAB_ICONS.home, isActive: dealerViewMode === "feed", onClick: () => navigateTo("dealer", "feed") },
                { key: "bikes", label: "Bikes", icon: TAB_ICONS.bikes, isActive: dealerViewMode === "auctions", onClick: () => navigateTo("dealer", "auctions") },
                { key: "swipe", label: "Swipe", icon: TAB_ICONS.swipe, center: true, isActive: dealerViewMode === "swiper", onClick: () => navigateTo("dealer", "swiper") },
                { key: "chat", label: "Chat", icon: TAB_ICONS.chat, isActive: dealerViewMode === "staff_chat", onClick: () => navigateTo("dealer", "staff_chat") },
                {
                  key: "shop",
                  label: "My Shop",
                  icon: TAB_ICONS.shop,
                  badge: pendingStaffCount,
                  isActive: dealerViewMode === "profile" || dealerViewMode === "inventory" || dealerViewMode === "recruitment",
                  onClick: () => navigateTo("dealer", "profile"),
                },
              ]}
            />

            {/* Full-screen viewer opened from a grid (Bikes / Me) */}
            {reelOverlay && (
              <div className="fixed inset-0 z-40 bg-[#0d0e12]">
                <VehicleReelsFeed
                  vehicles={reelOverlay.ids.map(findBike).filter((b): b is AuctionBike => !!b)}
                  bids={liveBids}
                  showroomName={selectedReconditionHub}
                  initialIndex={reelOverlay.index}
                  onClose={() => setReelOverlay(null)}
                  onBid={openBidFor}
                  onDetails={openDetailsFor}
                  onShareToStaff={shareToTeam}
                />
              </div>
            )}
          </div>
        )
      )}

      {/* ========================================================= */}
      {/* 3. PLACE BID QUICK MODAL                                  */}
      {/* ========================================================= */}
      {activeBidModal && !appLayout && (
        <div
          onClick={() => setActiveBidModal(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer"
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
                <h4 className="text-base font-bold text-white">Offer Sent!</h4>
                <p className="text-xs text-neutral-400">
                  {activeBidModal.sellerName} can see your offer now.
                </p>
              </div>
            ) : (
              <form onSubmit={submitBid} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Best Offer Now:</span>
                  <span className="font-black text-[#E5B869] text-base">{activeBidModal.highestBid}</span>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="bid-amount" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Your Offer (NPR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-neutral-400">
                      NPR
                    </span>
                    <input
                      id="bid-amount"
                      type="number"
                      step="1000"
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
                          setBidAmount(String((Number(bidAmount) || 0) + inc));
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
                    Send Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeBidModal && appLayout && (
        <div onClick={() => setActiveBidModal(null)} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 cursor-pointer">
          <div
            onClick={(e) => e.stopPropagation()}
            className="sheet-up w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#16171d] border border-white/10 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 cursor-default"
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-white/20 sm:hidden" />
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeBidModal.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover bg-neutral-900" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{activeBidModal.name}</p>
                <p className="text-xs text-neutral-400">Price now: <span className="text-[#E5B869] font-bold">{activeBidModal.highestBid}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBidModal(null)}
                aria-label="Close"
                className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/10 text-neutral-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bidSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto text-xl font-black">✓</div>
                <p className="text-base font-black text-white">Offer sent!</p>
                <p className="text-xs text-neutral-400">{activeBidModal.sellerName} can see your offer now.</p>
              </div>
            ) : (
              <form onSubmit={submitBid} className="space-y-3">
                <p className="text-xs font-semibold text-neutral-300">How much do you want to offer?</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBidAmount(String(Math.max(0, (Number(bidAmount) || 0) - 1000)))}
                    className="w-11 h-11 rounded-xl bg-white/10 text-white text-xl cursor-pointer"
                    aria-label="Less"
                  >
                    −
                  </button>
                  <input
                    id="bid-amount"
                    type="number"
                    step="1000"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="flex-1 min-w-0 h-11 rounded-xl bg-black text-center text-lg font-black text-white border border-white/15 focus:outline-none focus:border-[#E5B869]"
                  />
                  <button
                    type="button"
                    onClick={() => setBidAmount(String((Number(bidAmount) || 0) + 1000))}
                    className="w-11 h-11 rounded-xl bg-white/10 text-white text-xl cursor-pointer"
                    aria-label="More"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2">
                  {[5000, 10000, 25000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        playSwooshSound();
                        setBidAmount(String((Number(bidAmount) || 0) + inc));
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-neutral-300 cursor-pointer"
                    >
                      +{inc.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <button type="submit" className="w-full h-12 rounded-xl bg-[#E5B869] text-black font-black text-sm cursor-pointer">
                  Send offer NPR {(Number(bidAmount) || 0).toLocaleString("en-IN")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VEHICLE CONDITION & SLIDESHOW DETAILS MODAL            */}
      {/* ========================================================= */}
      {selectedBike && activeTab === "dealer" && isReconditionVerified && appLayout && (
        <BikeDetailsScreen
          bike={findBike(selectedBike.id) ?? selectedBike}
          bids={liveBids}
          messages={directMessages}
          showroomName={selectedReconditionHub}
          onClose={closeBikeModal}
          onOffer={() => openBidFor(selectedBike)}
          onShareToTeam={() => {
            const id = selectedBike.id;
            closeBikeModal();
            shareToTeam({ id });
          }}
          onSendMessage={(text) => sendSellerMessage(selectedBike.id, text)}
        />
      )}

      {selectedBike && !(activeTab === "dealer" && isReconditionVerified && appLayout) && (
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
                    Number Plate
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
                    Sold by the owner
                  </span>
                  <span className="text-xs text-neutral-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{selectedBike.inspectionAvailability || "Ask the seller when you can see it"}</span>
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
                  <span className="hidden sm:inline">Call:</span>
                  <span>{selectedBike.sellerPhone}</span>
                </a>

                {/* Close / Exit Button */}
                <button
                  type="button"
                  onClick={closeBikeModal}
                  title="Close"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer text-xs font-bold shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Close</span>
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
                        Photos:
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

                {/* Shops (desktop) make offers and chat here; sellers see the best offer */}
                {activeTab === "dealer" && isReconditionVerified ? (
                  <DealerBiddingConsole
                    bikeId={selectedBike.id}
                    bikeName={selectedBike.name}
                    defaultDealerName={selectedReconditionHub}
                    sellerName={selectedBike.sellerName}
                    sellerPhone={selectedBike.sellerPhone}
                    currentHighestBidNpr={Number(selectedBike.highestBid.replace(/[^0-9]/g, "")) || 0}
                    bids={liveBids}
                    messages={directMessages}
                    onNewBidSubmit={(amountNpr, dealerName, location) => {
                      sendBid(selectedBike.id, amountNpr, dealerName, location);
                    }}
                    onSendMessage={(messageText) => {
                      sendSellerMessage(selectedBike.id, messageText);
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
                          <span>Only bike shops can make offers</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Private
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        To protect fair market price discovery and prevent dealer collusion, active bids, workshop margins, and counter-offers are visible exclusively to registered recondition houses.
                      </p>

                      <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-neutral-400">Best Offer Now</div>
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
                          <span>See My Offers</span>
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
                      <p className="font-semibold text-emerald-300">See the bike before you pay</p>
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
                            <span>{selectedBike.hypeBadge || "For Sale"}</span>
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
                          How good is the bike?
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
                          <p className="font-semibold text-white text-xs">Is the bluebook ready?</p>
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
                        <span>Seller says:</span>
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
        fullScreen={appLayout}
      />
    </div>
  );
}



