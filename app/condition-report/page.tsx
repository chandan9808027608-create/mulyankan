"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { calculateVehicleValuation } from "../lib/valuationEngine";

interface UploadedPhoto {
  id: string;
  name: string;
  url: string;
  size: string;
}

let audioCtx: AudioContext | null = null;
function playSlideSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;
    const duration = 0.08;

    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(260, t + duration);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch {}
}

function ConditionReportContent() {
  const searchParams = useSearchParams();
  const bikeModelParam = searchParams.get("model") || "Bajaj Pulsar NS200";
  const bikeYearParam = searchParams.get("year") || "2021";

  const [dragActive, setDragActive] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [odometer, setOdometer] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [ownership, setOwnership] = useState("1st");
  const [condition, setCondition] = useState("excellent");
  const [taxStatus, setTaxStatus] = useState<"cleared" | "pending">("cleared");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [createdListingId, setCreatedListingId] = useState("");

  // Real-time live valuation calculation as seller fills form
  const liveValuation = React.useMemo(() => {
    const km = Number(odometer) || 10000;
    const yr = Number(bikeYearParam) || 2021;
    const cond = condition === "scratches" ? "good" : condition === "repair" ? "fair" : "excellent";
    const own = (ownership === "2nd" || ownership === "3rd" || ownership === "4th+" ? ownership : "1st") as "1st" | "2nd" | "3rd" | "4th+";

    return calculateVehicleValuation({
      brand: bikeModelParam.split(" ")[0] || "Motorcycle",
      model: bikeModelParam,
      year: yr,
      mileageKm: km,
      ownership: own,
      condition: cond,
      taxStatus,
    });
  }, [bikeModelParam, bikeYearParam, odometer, ownership, condition, taxStatus]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setPhotos((prev) => [...prev, ...newItems].slice(0, 6));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newId = `user-post-${Date.now()}`;
    setCreatedListingId(newId);

    const newVehicle = {
      id: newId,
      name: `${bikeYearParam} ${bikeModelParam}`,
      year: bikeYearParam,
      mileage: odometer ? `${Number(odometer).toLocaleString()} KM` : "10,200 KM",
      lotNumber: lotNumber ? lotNumber.toUpperCase() : "BA 02-05 PA 9921",
      nepaliPlate: lotNumber ? lotNumber.toUpperCase() : "बा ०२-०५ प ९९२१",
      province: "BAGMATI",
      ownership: `${ownership} Hand Bluebook`,
      location: sellerAddress || "Kathmandu Valley",
      condition: condition === "excellent" ? "Like New (10/10)" : condition === "good" ? "Very Good (9/10)" : "Fair Condition",
      paperwork: taxStatus === "cleared" ? "Tax Cleared (Fiscal Year 2081/82)" : "Tax Pending (Deductible at payout)",
      highestBid: `NPR ${liveValuation.dealerImmediateOfferNpr.toLocaleString()}`,
      timeLeft: "02:00:00 LEFT",
      imageUrl: photos[0]?.url || "/black-yamaha-r15.jpg",
      images: photos.length > 0 ? photos.map((p, idx) => ({
        url: p.url,
        label: `${idx + 1}. ${slotLabels[idx] || "Inspection Photo"}`
      })) : [
        { url: "/black-yamaha-r15.jpg", label: "1. Front Angle" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85", label: "2. Meter Console" },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85", label: "3. Engine Chamber" }
      ],
      sellerName: "Direct Verified Seller",
      sellerPhone: phoneNumber ? `+977 ${phoneNumber}` : "+977 9841-000000",
      sellerAddress: sellerAddress || "Kathmandu Valley",
      inspectionAvailability: "Available for test-ride and inspection anytime",
      bluebookStatus: `${ownership} Hand Bluebook in hand`,
      taxValidTill: taxStatus === "cleared" ? "Paid till Ashadh 2082" : "Tax pending",
      keysCount: "2 Keys",
      engineCondition: "Clean running • Well maintained",
      tyreCondition: "Good tread remaining",
      simpleHowItRuns: "Starts nicely on first try. Very smooth and healthy engine.",
      simpleAccidentStatus: "No major damage or dents. Straight chassis.",
      simplePapersStatus: taxStatus === "cleared" ? "Original Bluebook in hand. Government road tax cleared." : "Bluebook in hand.",
      simpleKeysStatus: "Keys included.",
      notes: notes || "Direct seller posting. Clean, verified, and open for physical spot-check.",
      isTrending: true,
      viewCount: 14,
      bidCount: 1,
      hypeBadge: "FRESH LISTING",
    };

    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("mulyankan_user_postings") || "[]");
        localStorage.setItem("mulyankan_user_postings", JSON.stringify([newVehicle, ...existing]));
      } catch {}
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionComplete(true);
    }, 1200);
  };

  const slotLabels = [
    "Front Angle",
    "Meter / Odometer",
    "Right Exhaust",
    "Left Chainset",
    "Tyre Tread",
    "Damages / Dents",
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white selection:bg-[#E5B869] selection:text-black font-sans antialiased relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-[500px] w-[500px] rounded-full bg-[#E5B869]/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-24 h-[420px] w-[420px] rounded-full bg-orange-500/5 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 1. Header with Logo & Progress */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#121318]/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer shadow"
              title="Undo / Go back"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10 shadow-[0_0_10px_rgba(229,184,105,0.4)]">
                <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                MULYANKAN
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-white/20" />
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-neutral-400 font-mono">
              Kathmandu Valley C2B Exchange
            </span>
          </div>

          {/* Stepper Status */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5B869]">
                Step 2 of 2
              </span>
              <span className="text-xs text-neutral-400 font-medium hidden md:inline">
                Condition & Inspection
              </span>
            </div>
            <div className="w-32 sm:w-44 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#E5B869] shadow-[0_0_10px_rgba(229,184,105,0.6)] rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Selected Vehicle Context Bar */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#15171f] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E5B869]/15 border border-[#E5B869]/30 flex items-center justify-center text-[#E5B869] shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11l3 5h3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {bikeModelParam}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-white font-semibold font-mono">
                  {bikeYearParam} Model
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Zero Sign-Up Required
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct seller listing • Broadcast privately to verified Kathmandu Valley recondition owners
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-neutral-400 hover:text-[#E5B869] transition-colors flex items-center gap-1.5"
          >
            <span>Change vehicle</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Media Upload (5 Cols) */}
            <section className="lg:col-span-5 space-y-5">
              <div className="rounded-3xl bg-[#15171f] border border-white/10 backdrop-blur-md p-6 sm:p-7 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Vehicle Photos
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Clear photos get 12-15% higher opening bids.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#E5B869]/15 text-[#E5B869] border border-[#E5B869]/30">
                    {photos.length} / 6
                  </span>
                </div>

                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? "border-[#E5B869] bg-[#E5B869]/10 scale-[1.01]"
                      : "border-white/20 hover:border-[#E5B869]/60 bg-black/40 hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />

                  {/* Cloud Icon */}
                  <div className="w-14 h-14 mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E5B869] shadow-[0_0_15px_rgba(229,184,105,0.2)]">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    Drag photos here or <span className="text-[#E5B869] underline decoration-[#E5B869]/50 underline-offset-4">browse files</span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Upload 4-6 Photos (Front, Sides, Odometer, Damages)
                  </p>
                  <span className="mt-2 text-[11px] text-neutral-500 font-mono">
                    JPG, PNG, WebP up to 10MB each
                  </span>
                </div>

                {/* Thumbnail Previews Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold uppercase tracking-wider text-neutral-400">
                      Photo Slots & Checklist
                    </span>
                    <span className="text-neutral-500">Daylight shots preferred</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {slotLabels.map((slotLabel, index) => {
                      const photo = photos[index];
                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-xl border relative overflow-hidden flex flex-col items-center justify-center p-1.5 transition-all duration-200 ${
                            photo
                              ? "border-[#E5B869]/40 bg-neutral-900 group"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          {photo ? (
                            <>
                              {/* Thumbnail preview */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                              
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePhoto(photo.id);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow"
                                title="Remove photo"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>

                              <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-medium text-white truncate drop-shadow">
                                {slotLabel}
                              </span>
                            </>
                          ) : (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              className="flex flex-col items-center justify-center text-center p-1 w-full h-full cursor-pointer hover:bg-white/5 transition-colors group"
                              title={`Upload ${slotLabel}`}
                            >
                              <span className="text-[#E5B869] group-hover:scale-125 text-xs mb-1 transition-transform font-bold">+</span>
                              <span className="text-[10px] text-neutral-400 group-hover:text-white leading-tight transition-colors">
                                {slotLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practical inspection tip */}
                <div className="p-3.5 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/20 flex items-start gap-2.5 text-xs text-neutral-300">
                  <svg className="w-4 h-4 text-[#E5B869] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Valuation Tip:</strong> Dealers verify the odometer photo with the meter reading before placing their bid guarantee.
                  </span>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Detailed Inputs Section (7 Cols) */}
            <section className="lg:col-span-7 space-y-5">
              <div className="rounded-3xl bg-[#15171f] border border-white/10 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Vehicle History & Condition
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Accurate disclosure prevents counter-offers at handover.
                    </p>
                  </div>
                  <span className="text-[11px] text-[#E5B869] font-bold flex items-center gap-1.5 bg-[#E5B869]/15 border border-[#E5B869]/30 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B869] animate-pulse" />
                    Live Bidding Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Exact KM Runned */}
                  <div className="space-y-2">
                    <label htmlFor="odometer" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Exact KM Runned <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#E5B869] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="odometer"
                        type="number"
                        required
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        placeholder="e.g. 14500"
                        className="w-full bg-black border border-white/20 rounded-xl pl-10 pr-14 py-3.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-[11px] font-bold text-neutral-300 px-2 py-0.5 rounded bg-white/10 border border-white/10">
                          KM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lot / Province Number */}
                  <div className="space-y-2">
                    <label htmlFor="lot" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Lot / Plate Series <span className="text-neutral-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#E5B869] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                      <input
                        id="lot"
                        type="text"
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                        placeholder="e.g. Ba 98 Pa or Prov 3 - 02"
                        className="w-full bg-black border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Overall Condition */}
                  <div className="space-y-2">
                    <label htmlFor="condition-select" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Overall Physical Condition <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="condition-select"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-xl px-3.5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all appearance-none cursor-pointer"
                      >
                        <option value="excellent" className="bg-[#15171f] text-white">
                          Clean / Showroom (No dents, smooth engine)
                        </option>
                        <option value="scratches" className="bg-[#15171f] text-white">
                          Minor Scratches (Normal daily use wear)
                        </option>
                        <option value="repair" className="bg-[#15171f] text-white">
                          Needs Repair (Tyre/battery or repair needed)
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Ownership History */}
                  <div className="space-y-2">
                    <label htmlFor="ownership-select" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Ownership Record
                    </label>
                    <div className="relative">
                      <select
                        id="ownership-select"
                        value={ownership}
                        onChange={(e) => setOwnership(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-xl px-3.5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all appearance-none cursor-pointer"
                      >
                        <option value="1st" className="bg-[#15171f] text-white">
                          Single Owner (1st Hand Bluebook)
                        </option>
                        <option value="2nd" className="bg-[#15171f] text-white">
                          2nd Hand (Name Transfer Completed)
                        </option>
                        <option value="multiple" className="bg-[#15171f] text-white">
                          3rd Hand or Company Registered
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yatayat / Tax Paperwork Status with Fluid Sliding Animation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Government Tax & Paperwork Status
                    </label>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {taxStatus === "cleared" ? "Verified" : "Will Deduct"}
                    </span>
                  </div>

                  <div className="relative p-1.5 rounded-2xl bg-black border border-white/15 select-none overflow-hidden">
                    {/* Sliding Indicator Pill */}
                    <div
                      aria-hidden="true"
                      className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-xl pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        taxStatus === "cleared"
                          ? "translate-x-0 bg-gradient-to-r from-[#E5B869]/25 to-[#E5B869]/15 border border-[#E5B869]/50 shadow-[0_0_20px_rgba(229,184,105,0.3)]"
                          : "translate-x-full bg-gradient-to-r from-amber-500/25 to-amber-500/15 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      }`}
                    />

                    <div className="relative z-10 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (taxStatus !== "cleared") playSlideSound();
                          setTaxStatus("cleared");
                        }}
                        className={`flex items-center justify-center gap-2.5 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                          taxStatus === "cleared"
                            ? "text-[#E5B869]"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="truncate">Cleared (Current Fiscal Year)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (taxStatus !== "pending") playSlideSound();
                          setTaxStatus("pending");
                        }}
                        className={`flex items-center justify-center gap-2.5 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                          taxStatus === "pending"
                            ? "text-amber-300"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="truncate">Tax Pending (Will deduct at payout)</span>
                      </button>
                    </div>
                  </div>

                  {/* Contextual advice banner */}
                  <div className="transition-all duration-300">
                    {taxStatus === "pending" ? (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2 transition-all">
                        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Unpaid road tax / fine will be calculated at Yatayat and deducted from your winning payout.</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/20 text-xs text-neutral-300 flex items-center gap-2 transition-all">
                        <svg className="w-4 h-4 text-[#E5B869] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Up-to-date bluebook tax receipts unlock top guaranteed bids from verified recondition owners.</span>
                      </div>
                    )}
                  </div>

                  {/* Real-time Estimated Valuation Preview Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a24] via-[#151720] to-[#171a24] border border-[#E5B869]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Live Estimated Fair Market Valuation
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {liveValuation.confidenceScore}% Algorithm Confidence
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-y border-white/10 py-3">
                      <div>
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          NPR {liveValuation.estimatedMarketValueNpr.toLocaleString()}
                        </span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Target Handover Range: NPR {liveValuation.lowEstimateNpr.toLocaleString()} – NPR {liveValuation.highEstimateNpr.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400 block">Immediate Cash Offer</span>
                        <span className="text-base font-bold text-[#E5B869]">
                          NPR {liveValuation.dealerImmediateOfferNpr.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Based on Kathmandu Valley real sales data for {bikeYearParam} {bikeModelParam} with {odometer ? `${Number(odometer).toLocaleString()} KM` : "current mileage"} and {ownership} hand bluebook.
                    </p>
                  </div>
                </div>

                {/* Direct Seller Contact & Location (No Sign-Up Required) */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Seller Contact & Address</span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Sell your vehicle directly without creating an account or signing up.
                      </p>
                    </div>
                    <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      No Sign-Up Needed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="seller-phone" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                        Phone Number (For SMS Bids) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#E5B869] transition-colors">
                          <span className="text-xs font-bold text-neutral-400 font-mono">+977</span>
                        </div>
                        <input
                          id="seller-phone"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="98XXXXXXXX"
                          className="w-full bg-black border border-white/20 rounded-xl pl-14 pr-4 py-3.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        Direct SMS updates when recondition shops submit competing bids.
                      </p>
                    </div>

                    {/* Address / Location Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="seller-address" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                        Vehicle Location / Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#E5B869] transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          id="seller-address"
                          type="text"
                          required
                          value={sellerAddress}
                          onChange={(e) => setSellerAddress(e.target.value)}
                          placeholder="e.g. New Baneshwor, Kathmandu"
                          className="w-full bg-black border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        For local valuation & physical handover after you accept an offer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Additional Notes
                    </label>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {notes.length}/300 characters
                    </span>
                  </div>
                  <textarea
                    id="notes"
                    rows={3}
                    maxLength={300}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mention custom exhausts, new battery, tyre condition, or any recent service done at authorized center."
                    className="w-full bg-black border border-white/20 rounded-xl p-3.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 focus:border-[#E5B869] transition-all resize-none"
                  />
                </div>

                {/* Seller Privacy Guarantee */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-xs text-neutral-300">
                  <div className="w-7 h-7 rounded-lg bg-[#E5B869]/15 flex items-center justify-center text-[#E5B869] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>
                    Your phone number and bluebook serial number remain private until you approve a binding offer.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* 3. Call To Action Submit Area */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#E5B869] to-amber-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-85 transition duration-300" />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-5 px-8 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase text-black bg-[#E5B869] hover:bg-[#d8ab5c] active:scale-[0.99] transition-all duration-200 shadow-[0_0_35px_rgba(229,184,105,0.4)] hover:shadow-[0_0_55px_rgba(229,184,105,0.7)] flex items-center justify-center gap-3 cursor-pointer border border-[#E5B869]/60 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3 text-black">
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Transmitting to 150+ Recondition Owners...</span>
                  </div>
                ) : (
                  <>
                    <span>Submit for Live Bidding</span>
                    <svg className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-400 text-center font-medium">
              <span>2-Hour Live Window</span>
              <span>•</span>
              <span>No Obligation to Accept</span>
              <span>•</span>
              <span>Yatayat Name Transfer Handled by Winner</span>
            </div>
          </div>
        </form>

        {/* 4. Live Submission Success Modal */}
        {submissionComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-[#15171f] border border-[#E5B869]/30 p-6 sm:p-8 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869] mx-auto shadow-[0_0_20px_rgba(229,184,105,0.4)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5B869]">
                  Listing ID: MLY-9182-KTM
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Live Bidding Session Active!
                </h3>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  Your <span className="font-semibold text-white">{bikeModelParam}</span> has been dispatched to 150+ verified recondition dealers across Kathmandu, Lalitpur & Bhaktapur.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-white/10 text-left text-xs space-y-1.5 text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">SMS Alert Sent:</span>
                  <span className="text-[#E5B869] font-bold">+977 {phoneNumber || "98XXXXXXXX"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Vehicle Location:</span>
                  <span className="text-white font-semibold">{sellerAddress || "Kathmandu Valley"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Bidding Window:</span>
                  <span className="text-white font-bold">2 Hours Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Account Required:</span>
                  <span className="text-emerald-400 font-bold">None (Direct Sale)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href={`/?tab=seller_dashboard${createdListingId ? `&bikeId=${createdListingId}` : ""}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-black text-sm transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,184,105,0.3)]"
                >
                  <span>View in My Postings Dashboard</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/"
                  className="text-xs text-neutral-400 hover:text-white transition-colors text-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Minimal Footer */}
      <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-xs text-neutral-500 backdrop-blur-md">
        <p>© {new Date().getFullYear()} MULYANKAN. Fair motorcycle evaluations across Kathmandu Valley.</p>
      </footer>
    </div>
  );
}

export default function ConditionReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0e12] text-white flex items-center justify-center">Loading evaluation...</div>}>
      <ConditionReportContent />
    </Suspense>
  );
}