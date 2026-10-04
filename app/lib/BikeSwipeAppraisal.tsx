"use client";

import React, { useState, useRef } from "react";

export interface SwipeBike {
  id: string;
  name: string;
  year?: string;
  mileage?: string;
  lotNumber: string;
  nepaliPlate?: string;
  province?: string;
  condition?: string;
  paperwork?: string;
  highestBid: string;
  imageUrl: string;
  images?: Array<{ url: string; label?: string }>;
  engineCondition?: string;
  tyreCondition?: string;
  notes?: string;
  sellerName?: string;
  sellerAskingNpr?: number;
}

interface LikedOfferRecord {
  bike: SwipeBike;
  offerAmountNpr: number;
  timestamp: string;
  status: "submitted" | "sent_to_chat";
  projectedProfitMarginNpr: number;
}

interface BikeSwipeAppraisalProps {
  showroomName: string;
  panNumber: string;
  initialBikes?: SwipeBike[];
  onPlaceBid?: (bikeId: string, amountNpr: number) => void;
  onShareToStaffChat?: (bike: SwipeBike, proposedOfferNpr?: number) => void;
  onSwitchToStaffChat?: () => void;
  onSwitchToAuctionFloor?: () => void;
}

const PRESET_SAMPLE_BIKES: SwipeBike[] = [
  {
    id: "swipe-1",
    name: "2023 Yamaha MT-15 V2 BS6",
    year: "2023",
    mileage: "8,200 KM",
    lotNumber: "BA 98 PA 4521",
    nepaliPlate: "बा ९८ प ४५२१",
    province: "BAGMATI",
    condition: "Showroom Condition (9.5/10)",
    paperwork: "Tax Cleared 2082/83 • Single Hand",
    highestBid: "NPR 3,10,000",
    sellerAskingNpr: 335000,
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "Cockpit & USD Forks" },
      { url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85", label: "Deltabox Frame" },
    ],
    engineCondition: "Sealed VVA Engine • Zero Noise",
    tyreCondition: "85% Remaining MRF Radial",
    notes: "First owner doctor ridden. Regular servicing at Yamaha Blue Square Teku. Original spare key and tool kit intact.",
    sellerName: "Suman Maharjan",
  },
  {
    id: "swipe-2",
    name: "2022 Royal Enfield Classic 350 Reborn",
    year: "2022",
    mileage: "11,500 KM",
    lotNumber: "BA 92 PA 8820",
    nepaliPlate: "बा ९२ प ८८२०",
    province: "BAGMATI",
    condition: "Well Preserved (9.0/10)",
    paperwork: "Road Tax Paid • Bluebook In Hand",
    highestBid: "NPR 3,65,000",
    sellerAskingNpr: 390000,
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
    images: [
      { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85", label: "J-Series Engine & Dual Channel ABS" },
      { url: "https://images.unsplash.com/photo-1558981420-87aa92103ac8?auto=format&fit=crop&w=1200&q=85", label: "Halcyon Green Tank" },
    ],
    engineCondition: "Smooth J-Series • Factory Oil Specs",
    tyreCondition: "80% Ceat Zoom Plus",
    notes: "Dual-channel ABS variant. Engine guard, sump guard, and touring mirrors installed by Royal Enfield authorized centre.",
    sellerName: "Bikash Shrestha",
  },
  {
    id: "swipe-3",
    name: "2021 KTM Duke 250 BS6",
    year: "2021",
    mileage: "15,800 KM",
    lotNumber: "BA 89 PA 1294",
    nepaliPlate: "बा ८९ प १२९४",
    province: "BAGMATI",
    condition: "Aggressive Tracker (8.6/10)",
    paperwork: "1 Year Tax Pending (Deductible)",
    highestBid: "NPR 3,45,000",
    sellerAskingNpr: 375000,
    imageUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=85",
    engineCondition: "High compression • Slipper clutch smooth",
    tyreCondition: "70% Metzeler Sportec",
    notes: "Original orange trellis chassis. Minor paint chips on footpeg hanger, otherwise pristine mechanical shape.",
    sellerName: "Prashant Gurung",
  },
  {
    id: "swipe-4",
    name: "2022 Bajaj Pulsar NS 200 FI ABS",
    year: "2022",
    mileage: "14,200 KM",
    lotNumber: "BA 94 PA 3302",
    nepaliPlate: "बा ९४ प ३३०२",
    province: "BAGMATI",
    condition: "Good Daily Commuter (8.8/10)",
    paperwork: "Tax Cleared Up to 2083",
    highestBid: "NPR 2,40,000",
    sellerAskingNpr: 260000,
    imageUrl: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
    engineCondition: "Triple Spark DTS-i • Responsive",
    tyreCondition: "75% MRF Zapper",
    notes: "Single owner commuting from Bhaktapur to Teku daily. Chain sprockets replaced recently. Ready for immediate resell.",
    sellerName: "Roshan Adhikari",
  },
];

export default function BikeSwipeAppraisal({
  showroomName,
  panNumber,
  initialBikes,
  onPlaceBid,
  onShareToStaffChat,
  onSwitchToStaffChat,
  onSwitchToAuctionFloor,
}: BikeSwipeAppraisalProps) {
  // Active Deck State
  const [deck, setDeck] = useState<SwipeBike[]>(() => {
    if (initialBikes && initialBikes.length > 0) {
      return initialBikes;
    }
    return PRESET_SAMPLE_BIKES;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedList, setLikedList] = useState<LikedOfferRecord[]>([]);
  const [passedList, setPassedList] = useState<SwipeBike[]>([]);
  const [historyStack, setHistoryStack] = useState<Array<{ bike: SwipeBike; action: "liked" | "passed" }>>([]);

  // Active View Tab: Deck vs Liked History vs Add Bike
  const [activeTab, setActiveTab] = useState<"deck" | "liked" | "passed">("deck");

  // Swipe Dragging Physics State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeFeedback, setSwipeFeedback] = useState<"like" | "pass" | null>(null);

  // Offer Modal State (When liked / swiped right)
  const [offerBike, setOfferBike] = useState<SwipeBike | null>(null);
  const [offerPriceNpr, setOfferPriceNpr] = useState<number>(300000);
  const [offerSuccessToast, setOfferSuccessToast] = useState<string | null>(null);

  // Add Custom Bike Modal State
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [newBikeForm, setNewBikeForm] = useState({
    name: "",
    lotNumber: "",
    year: "2023",
    mileage: "10,000 KM",
    province: "BAGMATI",
    paperwork: "Tax Cleared Up to 2082",
    condition: "Excellent Health (9.0/10)",
    highestBid: "NPR 2,50,000",
    sellerAskingNpr: 280000,
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
    notes: "Direct customer drop-in appraisal at showroom desk.",
  });
  const [imagePreviewMode, setImagePreviewMode] = useState<"preset" | "url" | "file">("file");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileDragActive, setFileDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBike = deck[currentIndex];

  // Helper to parse NPR string to number
  const parseNpr = (str: string): number => {
    const clean = str.replace(/[^0-9]/g, "");
    return clean ? parseInt(clean, 10) : 250000;
  };

  // Open Offer Modal when swiping right
  const triggerLikeAndOffer = (bike: SwipeBike) => {
    const base = bike.sellerAskingNpr || parseNpr(bike.highestBid) + 5000;
    setOfferPriceNpr(base);
    setOfferBike(bike);
  };

  // Trigger Pass (Swipe Left)
  const triggerPass = (bike: SwipeBike) => {
    setPassedList((prev) => [bike, ...prev]);
    setHistoryStack((prev) => [...prev, { bike, action: "passed" }]);
    setCurrentIndex((prev) => prev + 1);
  };

  // Undo / Rewind last swipe
  const handleUndo = () => {
    if (historyStack.length === 0 || currentIndex === 0) return;
    const lastAction = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));

    if (lastAction.action === "passed") {
      setPassedList((prev) => prev.filter((b) => b.id !== lastAction.bike.id));
    } else {
      setLikedList((prev) => prev.filter((item) => item.bike.id !== lastAction.bike.id));
    }
  };

  // Mouse / Touch Gesture Handlers
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });

    if (deltaX > 80) {
      setSwipeFeedback("like");
    } else if (deltaX < -80) {
      setSwipeFeedback("pass");
    } else {
      setSwipeFeedback(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardRef.current) {
      try {
        cardRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }

    // Threshold for complete swipe
    if (dragOffset.x > 130 && currentBike) {
      // Swiped Right -> Like
      setDragOffset({ x: 500, y: dragOffset.y });
      setTimeout(() => {
        setDragOffset({ x: 0, y: 0 });
        setSwipeFeedback(null);
        triggerLikeAndOffer(currentBike);
        setHistoryStack((prev) => [...prev, { bike: currentBike, action: "liked" }]);
        setCurrentIndex((prev) => prev + 1);
      }, 180);
    } else if (dragOffset.x < -130 && currentBike) {
      // Swiped Left -> Pass
      setDragOffset({ x: -500, y: dragOffset.y });
      setTimeout(() => {
        setDragOffset({ x: 0, y: 0 });
        setSwipeFeedback(null);
        triggerPass(currentBike);
      }, 180);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
      setSwipeFeedback(null);
    }
  };

  // Submit Final Offer
  const handleConfirmOffer = (sendToStaffChatOnly: boolean = false) => {
    if (!offerBike) return;

    const estResale = Math.round(offerPriceNpr * 1.14);
    const refurbCost = 7000;
    const projectedProfit = estResale - offerPriceNpr - refurbCost;

    const record: LikedOfferRecord = {
      bike: offerBike,
      offerAmountNpr: offerPriceNpr,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: sendToStaffChatOnly ? "sent_to_chat" : "submitted",
      projectedProfitMarginNpr: projectedProfit,
    };

    setLikedList((prev) => [record, ...prev]);

    if (sendToStaffChatOnly) {
      if (onShareToStaffChat) {
        onShareToStaffChat(offerBike, offerPriceNpr);
      }
      setOfferSuccessToast(`Offer proposal of NPR ${offerPriceNpr.toLocaleString()} forwarded to ${showroomName} staff room!`);
    } else {
      if (onPlaceBid) {
        onPlaceBid(offerBike.id, offerPriceNpr);
      }
      setOfferSuccessToast(`Offer bid of NPR ${offerPriceNpr.toLocaleString()} dispatched to live auction floor!`);
    }

    setOfferBike(null);
    setTimeout(() => setOfferSuccessToast(null), 4000);
  };

  // Handle Add Bike Form Submit
  const handleAddNewBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBikeForm.name.trim() || !newBikeForm.lotNumber.trim()) return;

    const newEntry: SwipeBike = {
      id: `custom-${Date.now()}`,
      name: newBikeForm.name,
      lotNumber: newBikeForm.lotNumber,
      year: newBikeForm.year,
      mileage: newBikeForm.mileage,
      province: newBikeForm.province,
      paperwork: newBikeForm.paperwork,
      condition: newBikeForm.condition,
      highestBid: newBikeForm.highestBid,
      sellerAskingNpr: Number(newBikeForm.sellerAskingNpr) || 280000,
      imageUrl: newBikeForm.imageUrl || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
      notes: newBikeForm.notes,
      sellerName: "Showroom Direct Appraisal",
    };

    // Insert next in queue so dealer can swipe it right now
    setDeck((prev) => {
      const copy = [...prev];
      copy.splice(currentIndex, 0, newEntry);
      return copy;
    });

    setShowAddBikeModal(false);
    setActiveTab("deck");
    setOfferSuccessToast(`Added ${newEntry.name} to active appraisal deck!`);
    setTimeout(() => setOfferSuccessToast(null), 3500);
  };

  // Handle Image Upload from File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBikeForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBikeForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-6 text-neutral-200">
      {/* Toast Notification */}
      {offerSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#181a24] border border-[#E5B869] text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-top-4">
          <div className="w-7 h-7 rounded-full bg-[#E5B869]/20 text-[#E5B869] flex items-center justify-center font-bold text-xs shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold tracking-wide">{offerSuccessToast}</p>
        </div>
      )}

      {/* Header Bar: Recondition Hub info & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E5B869] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#E5B869] uppercase font-bold">
              Rapid Showroom Appraisal Deck
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-black/40 text-neutral-400 border border-white/10 font-mono">
              PAN: {panNumber}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Swift Swipe & Valuation Desk
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Swipe Right to Like & Offer • Swipe Left to Pass • Add custom inventory photos directly into deck
          </p>
        </div>

        {/* View Switchers & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 rounded-xl bg-[#14161f] border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("deck")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "deck"
                  ? "bg-[#E5B869] text-black font-bold shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Swipe Deck ({deck.length - currentIndex > 0 ? deck.length - currentIndex : 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("liked")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "liked"
                  ? "bg-[#E5B869] text-black font-bold shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Offers & Liked</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{likedList.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("passed")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "passed"
                  ? "bg-[#E5B869] text-black font-bold shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Passed ({passedList.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddBikeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E5B869]/20 to-[#E5B869]/10 border border-[#E5B869]/50 hover:border-[#E5B869] text-[#E5B869] hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Bike / Photo</span>
          </button>

          {onSwitchToStaffChat && (
            <button
              type="button"
              onClick={onSwitchToStaffChat}
              className="px-3 py-2 rounded-xl bg-[#171924] border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Staff Room to debate values with mechanics"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span>Staff Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container by Tab */}
      {activeTab === "deck" && (
        <div className="mt-6 flex flex-col items-center justify-center min-h-[580px]">
          {currentBike ? (
            <div className="relative w-full max-w-md flex flex-col items-center select-none">
              {/* Stack visual hints (Background card silhouette) */}
              {deck[currentIndex + 1] && (
                <div
                  className="absolute w-full h-[520px] rounded-3xl bg-[#151722]/80 border border-white/5 top-3 scale-[0.95] pointer-events-none -z-10 transition-transform shadow-xl"
                />
              )}
              {deck[currentIndex + 2] && (
                <div
                  className="absolute w-full h-[520px] rounded-3xl bg-[#12141c]/50 border border-white/5 top-6 scale-[0.90] pointer-events-none -z-20 transition-transform shadow-lg"
                />
              )}

              {/* Active Swipe Card */}
              <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.4}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
                  transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  touchAction: "none",
                }}
                className="w-full bg-[#161823] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative cursor-grab active:cursor-grabbing"
              >
                {/* Stamp Feedback Overlays */}
                {swipeFeedback === "like" && (
                  <div className="absolute top-8 right-8 z-30 pointer-events-none border-4 border-emerald-400 text-emerald-400 px-4 py-1.5 rounded-xl font-black text-2xl tracking-wider uppercase rotate-12 shadow-2xl bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    LIKE & OFFER
                  </div>
                )}
                {swipeFeedback === "pass" && (
                  <div className="absolute top-8 left-8 z-30 pointer-events-none border-4 border-rose-500 text-rose-500 px-4 py-1.5 rounded-xl font-black text-2xl tracking-wider uppercase -rotate-12 shadow-2xl bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    PASS
                  </div>
                )}

                {/* Bike Image Container */}
                <div className="relative w-full h-72 bg-black overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentBike.imageUrl}
                    alt={currentBike.name}
                    className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161823] via-black/30 to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs font-bold">
                    <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[#E5B869] border border-[#E5B869]/30 font-mono tracking-wider">
                      {currentBike.lotNumber}
                    </span>
                    <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {currentBike.condition || "Inspected"}
                    </span>
                  </div>

                  {/* Price & KM Banner */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                        Current Live Valuation
                      </span>
                      <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                        {currentBike.highestBid}
                      </span>
                    </div>
                    {currentBike.sellerAskingNpr && (
                      <div className="text-right bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 block">Seller Target</span>
                        <span className="text-xs font-bold text-[#E5B869]">
                          NPR {currentBike.sellerAskingNpr.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bike Specification & Inspection Details */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                      {currentBike.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400 font-medium">
                      <span>{currentBike.year || "2022"}</span>
                      <span>•</span>
                      <span>{currentBike.mileage || "Low Mileage"}</span>
                      <span>•</span>
                      <span className="text-neutral-300">{currentBike.province || "BAGMATI"}</span>
                    </div>
                  </div>

                  {/* Mechanical Highlights Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-neutral-400 block font-mono uppercase">Engine & Chassis</span>
                      <span className="font-semibold text-neutral-200 truncate block mt-0.5">
                        {currentBike.engineCondition || "Clean compression, no noise"}
                      </span>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-neutral-400 block font-mono uppercase">Papers & Tax</span>
                      <span className="font-semibold text-neutral-200 truncate block mt-0.5">
                        {currentBike.paperwork || "Bluebook in hand"}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Inspector Remarks */}
                  {currentBike.notes && (
                    <div className="bg-[#11121a] rounded-xl p-2.5 border border-white/5 text-xs text-neutral-300 line-clamp-2 italic">
                      "{currentBike.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {/* Undo / Rewind */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyStack.length === 0}
                  className="w-12 h-12 rounded-full bg-[#191b26] border border-white/10 text-neutral-400 hover:text-amber-400 hover:border-amber-400/40 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                  title="Undo previous swipe"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>

                {/* Pass (Swipe Left) */}
                <button
                  type="button"
                  onClick={() => triggerPass(currentBike)}
                  className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/40 hover:border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 group"
                  title="Pass this bike (Swipe Left)"
                >
                  <svg className="w-7 h-7 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Like & Offer (Swipe Right) */}
                <button
                  type="button"
                  onClick={() => triggerLikeAndOffer(currentBike)}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E5B869] to-amber-400 text-black border-2 border-[#E5B869] hover:scale-105 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_20px_rgba(229,184,105,0.4)] active:scale-90 font-black"
                  title="Like & Offer Price (Swipe Right)"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                {/* Send to Staff Chat */}
                {onShareToStaffChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onShareToStaffChat(currentBike);
                      setOfferSuccessToast(`Shared ${currentBike.name} to staff chat!`);
                      setTimeout(() => setOfferSuccessToast(null), 3000);
                    }}
                    className="w-12 h-12 rounded-full bg-[#191b26] border border-cyan-500/30 text-cyan-400 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Ask mechanics in Staff Chat before bidding"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="text-center mt-3 text-[11px] text-neutral-500 font-mono">
                Listing {currentIndex + 1} of {deck.length} • Drag card or tap buttons
              </div>
            </div>
          ) : (
            /* Empty State when deck finished */
            <div className="bg-[#151722] border border-white/10 rounded-3xl p-10 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/40 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                All Current Listings Reviewed!
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You have appraised every two-wheeler currently pending in the live queue.
                You can reload the deck, inspect your {likedList.length} submitted offers, or upload new customer photos.
              </p>
              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setHistoryStack([]);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#E5B869] text-black font-bold text-xs hover:bg-[#d4a758] transition-all cursor-pointer"
                >
                  Reload Deck from Start
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("liked")}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  View Offers & Liked ({likedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(true)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-all cursor-pointer"
                >
                  + Add Custom Walk-in Bike
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offers & Liked History Tab */}
      {activeTab === "liked" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Submitted Offers & Liked Vehicles</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/30 font-mono">
                {likedList.length} Units
              </span>
            </h2>
          </div>

          {likedList.length === 0 ? (
            <div className="text-center py-16 bg-[#141620] border border-white/5 rounded-2xl text-neutral-400 text-xs">
              No liked vehicles yet. Swipe right on bikes in the Deck view to formulate offers!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {likedList.map((rec, i) => (
                <div
                  key={i}
                  className="bg-[#161823] border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-lg hover:border-[#E5B869]/40 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rec.bike.imageUrl}
                    alt={rec.bike.name}
                    className="w-24 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#E5B869] uppercase font-bold tracking-wider">
                        {rec.bike.lotNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        rec.status === "submitted"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}>
                        {rec.status === "submitted" ? "AUCTION DISPATCHED" : "STAFF ROOM DRAFT"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{rec.bike.name}</h3>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <div>
                        <span className="text-[9px] text-neutral-400 block">Offered Amount</span>
                        <span className="font-bold text-[#E5B869]">NPR {rec.offerAmountNpr.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-neutral-400 block">Est. Profit Margin</span>
                        <span className="font-bold text-emerald-400">+NPR {rec.projectedProfitMarginNpr.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passed Tab */}
      {activeTab === "passed" && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Passed / Unliked Vehicles</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              {passedList.length} Units
            </span>
          </h2>

          {passedList.length === 0 ? (
            <div className="text-center py-16 bg-[#141620] border border-white/5 rounded-2xl text-neutral-400 text-xs">
              No passed vehicles.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passedList.map((bike) => (
                <div
                  key={bike.id}
                  className="bg-[#161823] border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-lg opacity-85 hover:opacity-100 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bike.imageUrl}
                    alt={bike.name}
                    className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0 grayscale hover:grayscale-0 transition-all"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{bike.lotNumber}</span>
                    <h3 className="text-sm font-bold text-white truncate">{bike.name}</h3>
                    <p className="text-xs text-neutral-400">Valuation: {bike.highestBid}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPassedList((prev) => prev.filter((b) => b.id !== bike.id));
                        setDeck((prev) => [bike, ...prev]);
                        setActiveTab("deck");
                        setCurrentIndex(0);
                      }}
                      className="text-xs font-semibold text-[#E5B869] hover:underline pt-1 block cursor-pointer"
                    >
                      Restore to Active Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OFFER CONSOLE MODAL (Triggered when swiping right or clicking Like) */}
      {offerBike && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151722] border border-[#E5B869]/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-neutral-200 relative">
            {/* Close */}
            <button
              type="button"
              onClick={() => setOfferBike(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-mono uppercase text-[#E5B869] font-bold tracking-widest">
                Showroom Valuation Offer
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Formulate Offer: {offerBike.name}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Lot: {offerBike.lotNumber} • Current Live: {offerBike.highestBid}
              </p>
            </div>

            {/* Selected Bike Preview Strip */}
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={offerBike.imageUrl}
                alt={offerBike.name}
                className="w-16 h-16 object-cover rounded-xl border border-white/10 shrink-0"
              />
              <div className="text-xs min-w-0">
                <p className="font-bold text-white truncate">{offerBike.name}</p>
                <p className="text-neutral-400 truncate">{offerBike.condition || "Inspected Condition"}</p>
                {offerBike.sellerAskingNpr && (
                  <p className="text-[#E5B869] font-mono text-[11px] mt-0.5">
                    Seller Expected: NPR {offerBike.sellerAskingNpr.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Offer Amount Controls */}
            <div className="space-y-3 bg-[#11121a] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Your Proposed Offer (NPR)
                </label>
                <span className="text-xs font-mono text-[#E5B869] font-bold">
                  NPR {offerPriceNpr.toLocaleString()}
                </span>
              </div>

              {/* Increments Buttons */}
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setOfferPriceNpr((prev) => Math.max(50000, prev - 5000))}
                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 active:scale-95 transition-all cursor-pointer"
                >
                  -5,000
                </button>
                <button
                  type="button"
                  onClick={() => setOfferPriceNpr((prev) => Math.max(50000, prev - 1000))}
                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 active:scale-95 transition-all cursor-pointer"
                >
                  -1,000
                </button>
                <button
                  type="button"
                  onClick={() => setOfferPriceNpr((prev) => prev + 1000)}
                  className="py-2 rounded-xl bg-[#E5B869]/10 hover:bg-[#E5B869]/20 border border-[#E5B869]/30 text-[#E5B869] active:scale-95 transition-all cursor-pointer"
                >
                  +1,000
                </button>
                <button
                  type="button"
                  onClick={() => setOfferPriceNpr((prev) => prev + 5000)}
                  className="py-2 rounded-xl bg-[#E5B869]/20 hover:bg-[#E5B869]/30 border border-[#E5B869]/40 text-[#E5B869] font-bold active:scale-95 transition-all cursor-pointer"
                >
                  +5,000
                </button>
              </div>

              {/* Direct Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">
                  NPR
                </span>
                <input
                  type="number"
                  value={offerPriceNpr}
                  onChange={(e) => setOfferPriceNpr(Number(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#E5B869]"
                />
              </div>

              {/* Showroom Margin Projection */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-neutral-400">
                  <span>Est. Retail Resell: </span>
                  <span className="text-white font-bold">NPR {Math.round(offerPriceNpr * 1.14).toLocaleString()}</span>
                </div>
                <div className="text-right text-emerald-400 font-bold">
                  <span>Net Margin: </span>
                  <span>+NPR {Math.round(offerPriceNpr * 0.14 - 7000).toLocaleString()} (approx 12%)</span>
                </div>
              </div>
            </div>

            {/* Submission Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmOffer(true)}
                className="py-3 rounded-xl bg-[#1a1e2d] border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Send to Staff Chat</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmOffer(false)}
                className="py-3 rounded-xl bg-gradient-to-r from-[#E5B869] to-amber-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(229,184,105,0.4)] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit to Live Auction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM BIKE / PHOTO MODAL */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#151722] border border-[#E5B869]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-neutral-200 relative my-6">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowAddBikeModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#E5B869] font-bold tracking-widest">
                Showroom Inventory Addition
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Add Two-Wheeler / Photo to Swipe Deck
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload local bike photos or pick a sample to immediately appraise and place showroom offers.
              </p>
            </div>

            <form onSubmit={handleAddNewBike} className="space-y-4 text-xs">
              {/* Photo Upload / Selection */}
              <div className="space-y-2 bg-[#10121a] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-300 uppercase tracking-wider font-mono text-[11px]">
                    Vehicle Image
                  </label>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImagePreviewMode("preset")}
                      className={`px-2 py-0.5 rounded ${imagePreviewMode === "preset" ? "bg-[#E5B869] text-black font-bold" : "bg-white/5 text-neutral-400"}`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreviewMode("file")}
                      className={`px-2 py-0.5 rounded ${imagePreviewMode === "file" ? "bg-[#E5B869] text-black font-bold" : "bg-white/5 text-neutral-400"}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreviewMode("url")}
                      className={`px-2 py-0.5 rounded ${imagePreviewMode === "url" ? "bg-[#E5B869] text-black font-bold" : "bg-white/5 text-neutral-400"}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Preset Picker */}
                {imagePreviewMode === "preset" && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      {
                        name: "Yamaha MT-15",
                        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        name: "KTM RC 200",
                        url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        name: "Classic 350",
                        url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        name: "Pulsar NS",
                        url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=600&q=80",
                      },
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewBikeForm((prev) => ({ ...prev, imageUrl: sample.url }))}
                        className={`relative rounded-xl overflow-hidden border transition-all h-16 ${
                          newBikeForm.imageUrl === sample.url ? "border-[#E5B869] ring-2 ring-[#E5B869]/50" : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-white truncate px-1">
                          {sample.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* File Upload Picker */}
                {imagePreviewMode === "file" && (
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploadedFileName && newBikeForm.imageUrl ? (
                      <div className="rounded-xl border border-[#E5B869]/50 bg-black/60 p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={newBikeForm.imageUrl}
                            alt="Uploaded bike preview"
                            className="w-14 h-14 object-cover rounded-lg border border-[#E5B869]/40 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{uploadedFileName}</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Photo successfully loaded
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFileName(null);
                              setNewBikeForm((prev) => ({
                                ...prev,
                                imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
                              }));
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setFileDragActive(true);
                        }}
                        onDragLeave={() => setFileDragActive(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          fileDragActive
                            ? "border-[#E5B869] bg-[#E5B869]/10 scale-[1.01]"
                            : "border-white/20 hover:border-[#E5B869]/60 bg-black/40 hover:bg-white/[0.02]"
                        }`}
                      >
                        <svg className="w-7 h-7 text-[#E5B869] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-white">Click or drag photo here</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">Supports JPG, PNG, WEBP (Camera or device gallery)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* URL Input */}
                {imagePreviewMode === "url" && (
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newBikeForm.imageUrl.startsWith("data:") ? "" : newBikeForm.imageUrl}
                    onChange={(e) => setNewBikeForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                )}

                {/* Selected Preview Thumbnail (when not in file mode or for presets/urls) */}
                {imagePreviewMode !== "file" && newBikeForm.imageUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newBikeForm.imageUrl}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-white/20 shrink-0"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono truncate">
                      Active preview image selected
                    </span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Bike Model & Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2023 Yamaha Aerox 155"
                    value={newBikeForm.name}
                    onChange={(e) => setNewBikeForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Lot / Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BA 99 PA 7412"
                    value={newBikeForm.lotNumber}
                    onChange={(e) => setNewBikeForm((prev) => ({ ...prev, lotNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Odometer / Mileage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9,400 KM"
                    value={newBikeForm.mileage}
                    onChange={(e) => setNewBikeForm((prev) => ({ ...prev, mileage: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                    Seller Expected / Asking Price (NPR)
                  </label>
                  <input
                    type="number"
                    placeholder="280000"
                    value={newBikeForm.sellerAskingNpr}
                    onChange={(e) => setNewBikeForm((prev) => ({ ...prev, sellerAskingNpr: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1">
                  Mechanical & Body Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Single hand owner, minor fairing scratch on left side, front tyre 80%..."
                  value={newBikeForm.notes}
                  onChange={(e) => setNewBikeForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E5B869] hover:bg-[#d4a758] text-black font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add to Deck Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
