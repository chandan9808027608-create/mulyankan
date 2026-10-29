"use client";

import React, { useState, useRef } from "react";
import { uploadPhotos } from "./postListing";
import { getLoggedInContact } from "./session";

export interface DirectPostData {
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
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  inspectionAvailability?: string;
  bluebookStatus: string;
  taxValidTill: string;
  keysCount: string;
  engineCondition: string;
  tyreCondition: string;
  simpleHowItRuns: string;
  simpleAccidentStatus: string;
  simplePapersStatus: string;
  simpleKeysStatus: string;
  notes?: string;
  isTrending?: boolean;
  viewCount?: number;
  bidCount?: number;
  hypeBadge?: string;
}

interface DirectPostBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Return false when saving failed so the modal stays open with the seller's input. */
  onSubmit: (post: DirectPostData) => Promise<boolean | void> | boolean | void;
  /** App look: full screen with a back button, like the rest of the app */
  fullScreen?: boolean;
}

const PRESET_MODELS = [
  "Yamaha YZF R15 V4",
  "KTM Duke 250 BS6",
  "Bajaj Pulsar NS 200",
  "Royal Enfield Classic 350",
  "Yamaha MT-15 V2",
  "Honda Dio 125",
];

const MAX_PHOTOS = 6;

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

export const DirectPostBikeModal = React.memo(function DirectPostBikeModal({
  isOpen,
  onClose,
  onSubmit,
  fullScreen,
}: DirectPostBikeModalProps) {
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() - 2));
  const [odometer, setOdometer] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [location, setLocation] = useState("");
  const [ownership, setOwnership] = useState("Single Hand (1st Owner)");
  const [conditionGrade, setConditionGrade] = useState("Excellent");
  const [taxStatus, setTaxStatus] = useState("Cleared (Fiscal Year 2081/82)");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sellerNotes, setSellerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Logged-in shop owners / staff: their name and phone are already known, so don't ask
  const contact = getLoggedInContact();
  const knownName = contact?.name || "";
  const knownPhone = contact?.phone || "";

  const addFiles = (files: FileList | null | undefined) => {
    if (!files) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!odometer) {
      setSubmitError("Enter how many km the bike has done.");
      return;
    }
    if (!Number(askingPrice) || Number(askingPrice) < 1000) {
      setSubmitError("Enter your asking price in NPR (for example 325000).");
      return;
    }

    const remoteUrl = customUrlInput.trim();
    if (imageMode === "upload" && photos.length === 0) {
      setSubmitError("Add at least one photo of your bike.");
      return;
    }
    if (imageMode === "url" && !/^https?:\/\//i.test(remoteUrl)) {
      setSubmitError("Paste a full image link starting with https://");
      return;
    }

    setIsSubmitting(true);
    let photoUrls: string[];
    try {
      photoUrls = imageMode === "upload" ? await uploadPhotos(photos.map((p) => p.file)) : [remoteUrl];
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Photo upload failed.");
      setIsSubmitting(false);
      return;
    }

    const price = Number(askingPrice) || 0;
    const plate = numberPlate.trim().toUpperCase();
    const rawPhone = (knownPhone || sellerPhone).trim();
    const phone = rawPhone.startsWith("+977") ? rawPhone : `+977 ${rawPhone}`;

    const newVehicle: DirectPostData = {
      id: `direct-post-${Date.now()}`,
      name: `${year} ${model.trim()}`,
      year: year,
      mileage: `${Number(odometer).toLocaleString()} KM`,
      lotNumber: plate,
      nepaliPlate: plate,
      province: "BAGMATI",
      ownership: ownership,
      location: location.trim(),
      condition: conditionGrade,
      paperwork: taxStatus,
      // Seller's asking price is the opening figure until a dealer bids
      highestBid: `NPR ${price.toLocaleString("en-IN")}`,
      timeLeft: "OPEN",
      imageUrl: photoUrls[0],
      images: photoUrls.map((url, idx) => ({ url, label: `${idx + 1}. Seller Photo` })),
      sellerName: (knownName || sellerName).trim(),
      sellerPhone: phone,
      sellerAddress: location.trim(),
      inspectionAvailability: "Contact seller to arrange inspection",
      bluebookStatus: ownership,
      taxValidTill: taxStatus,
      keysCount: "Not stated",
      engineCondition: `Seller-reported condition: ${conditionGrade}`,
      tyreCondition: "Not inspected yet",
      simpleHowItRuns: `The seller says the bike is in ${conditionGrade.toLowerCase()} condition.`,
      simpleAccidentStatus: "Not inspected yet. Check in person before buying.",
      simplePapersStatus: `Bluebook: ${ownership}. Road tax: ${taxStatus}.`,
      simpleKeysStatus: "Ask the seller.",
      notes: sellerNotes.trim() || undefined,
      isTrending: false,
      viewCount: 0,
      bidCount: 0,
      hypeBadge: "NEW LISTING",
    };

    let result: boolean | void;
    try {
      result = await onSubmit(newVehicle);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save your listing.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    if (result === false) return;
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    onClose();
  };

  return (
    <div
      onClick={fullScreen ? undefined : onClose}
      className={
        fullScreen
          ? "fixed inset-0 z-50 flex flex-col bg-[#0d0e12]"
          : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          fullScreen
            ? "relative w-full max-w-2xl mx-auto flex-1 min-h-0 flex flex-col"
            : "relative w-full max-w-2xl rounded-3xl bg-[#14161e] border border-[#E5B869]/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
        }
      >
        {fullScreen ? (
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-10 h-10 shrink-0 rounded-xl bg-[#16171d] border border-white/10 text-white flex items-center justify-center cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-white leading-tight">Sell a bike</h3>
              <p className="text-xs text-neutral-500">Free • no sign-up • shops send you offers</p>
            </div>
          </div>
        ) : (
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#181a24] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869]">
              <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                  Post Bike Directly
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  Zero Sign-up
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                No email or password needed. Broadcast to 150+ verified recondition owners in 45 seconds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        )}

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 ${fullScreen ? "pb-[max(1rem,env(safe-area-inset-bottom))]" : ""}`}>
          {/* Quick Model Selector Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
              <span>Select Model or Type Custom</span>
              <span className="text-neutral-500 text-[11px] font-normal">Popular in Kathmandu</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    model === m
                      ? "bg-[#E5B869] text-black shadow-md font-bold"
                      : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Yamaha FZ-S V3, KTM RC 200, Ray ZR..."
              className="w-full mt-1.5 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#E5B869]"
            />
          </div>

          {/* Year & Mileage & Asking Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Model Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              >
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Mileage (KM)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 12000"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#E5B869] block mb-1">
                Your Asking Price (NPR)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 325000"
                className="w-full bg-black/60 border border-[#E5B869]/50 rounded-xl px-3 py-2 text-xs text-[#E5B869] font-bold focus:outline-none focus:ring-1 focus:ring-[#E5B869]"
              />
            </div>
          </div>

          {contact && (
            <p className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              Posting as <strong className="text-white">{knownName}</strong>
              {knownPhone && <> • {knownPhone}</>}
            </p>
          )}

          {/* Contact Details & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!knownPhone && (
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Your Mobile / WhatsApp <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="98XXXXXXXX (No login needed)"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  Used only by verified workshops when you approve an offer.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Valley Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Baneshwor, Lalitpur, Bhaktapur..."
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              />
            </div>
          </div>

          {/* Seller Name, Number Plate & Condition */}
          <div className={`grid grid-cols-1 gap-3 ${knownName ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {!knownName && (
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Your Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Prashant Shrestha"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Number Plate <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
                placeholder="e.g. BA 02 PA 1234"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#E5B869]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Condition
              </label>
              <select
                value={conditionGrade}
                onChange={(e) => setConditionGrade(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              >
                <option value="Excellent">Excellent (like new)</option>
                <option value="Good">Good (minor scratches)</option>
                <option value="Fair">Fair (needs some work)</option>
                <option value="Needs Repair">Needs repair</option>
              </select>
            </div>
          </div>

          {/* Bluebook & Tax Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Bluebook Ownership
              </label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              >
                <option value="Single Hand (1st Owner)">Single Hand (1st Owner - In Hand)</option>
                <option value="2nd Hand Bluebook">2nd Hand (Clear for Transfer)</option>
                <option value="3rd Hand or Above">3rd Hand or Above</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Road Tax Status
              </label>
              <select
                value={taxStatus}
                onChange={(e) => setTaxStatus(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              >
                <option value="Cleared (Fiscal Year 2081/82)">100% Tax Cleared (Up to Date)</option>
                <option value="1 Year Tax Pending (Deductible)">1 Year Tax Pending (Deduct from Price)</option>
                <option value="2+ Years Tax Pending">2+ Years Pending</option>
              </select>
            </div>
          </div>

          {/* Vehicle Photo Upload */}
          <div className="space-y-3 bg-[#10121a] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">
                Vehicle Photos <span className="text-amber-400">*</span>
              </label>
              <div className="flex gap-1 text-[11px]">
                {(["upload", "url"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setImageMode(mode)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      imageMode === mode
                        ? "bg-[#E5B869] text-black font-bold shadow"
                        : "bg-white/5 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mode === "upload" ? "Upload Photos" : "Image URL"}
                  </button>
                ))}
              </div>
            </div>

            {imageMode === "upload" && (
              <div className="space-y-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {photos.map((p, idx) => (
                      <div key={p.previewUrl} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5B869]/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.previewUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-red-400 text-[11px] leading-none flex items-center justify-center cursor-pointer"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < MAX_PHOTOS && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-[#E5B869] bg-[#E5B869]/10 scale-[1.01]"
                        : "border-white/20 hover:border-[#E5B869]/60 bg-black/40 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center text-[#E5B869] mb-2 shadow">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {photos.length === 0 ? "Click to browse or take photos" : "Add more photos"}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      Up to {MAX_PHOTOS} photos • JPG, PNG, WEBP • max 10 MB each
                    </span>
                  </div>
                )}
              </div>
            )}

            {imageMode === "url" && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Paste direct image link (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5B869]"
                />
                {customUrlInput.trim() && (
                  <div className="flex items-center gap-3 pt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customUrlInput}
                      alt="URL preview"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      className="w-14 h-14 object-cover rounded-lg border border-white/20 shrink-0"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono truncate">
                      Previewing remote image
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seller Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Short Description (Easy for 5th-grader to read)
            </label>
            <textarea
              rows={2}
              value={sellerNotes}
              placeholder="e.g. Single owner, serviced regularly, no accidents."
              onChange={(e) => setSellerNotes(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5B869]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            {submitError && (
              <p className="mb-2 text-xs text-red-400 font-semibold text-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={
                fullScreen
                  ? "w-full h-12 rounded-xl bg-[#E5B869] text-black font-black text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  : "w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(229,184,105,0.4)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#E5B869]/60 disabled:opacity-75"
              }
            >
              {isSubmitting ? (
                <span>{imageMode === "upload" ? "Uploading photos & publishing..." : "Publishing..."}</span>
              ) : fullScreen ? (
                <span>Post my bike</span>
              ) : (
                <>
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Publish Bike Directly (Zero Sign-up)</span>
                  <span>→</span>
                </>
              )}
            </button>
            <div className="mt-2 text-center text-[11px] text-neutral-400">
              No account creation • Listing is 100% free • Track private bids in My Postings
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});