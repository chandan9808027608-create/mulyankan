"use client";

import React, { useState, useRef } from "react";

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
  onSubmit: (post: DirectPostData) => void;
}

const PRESET_MODELS = [
  "Yamaha YZF R15 V4",
  "KTM Duke 250 BS6",
  "Bajaj Pulsar NS 200",
  "Royal Enfield Classic 350",
  "Yamaha MT-15 V2",
  "Honda Dio 125",
];

const PRESET_PHOTO_OPTIONS = [
  {
    label: "Yamaha Sport / Dark",
    url: "/black-yamaha-r15.jpg",
  },
  {
    label: "KTM Naked / Orange",
    url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Classic Cruiser / Enfield",
    url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
  },
];

export const DirectPostBikeModal = React.memo(function DirectPostBikeModal({
  isOpen,
  onClose,
  onSubmit,
}: DirectPostBikeModalProps) {
  const [model, setModel] = useState("Yamaha YZF R15 V4");
  const [year, setYear] = useState("2023");
  const [odometer, setOdometer] = useState("12000");
  const [askingPrice, setAskingPrice] = useState("340000");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [location, setLocation] = useState("New Baneshwor, Kathmandu");
  const [ownership, setOwnership] = useState("Single Hand (1st Owner)");
  const [conditionGrade, setConditionGrade] = useState("Like New (10/10)");
  const [taxStatus, setTaxStatus] = useState("Cleared (Fiscal Year 2081/82)");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [imageMode, setImageMode] = useState<"upload" | "preset" | "url">("upload");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [customPhotoName, setCustomPhotoName] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sellerNotes, setSellerNotes] = useState(
    "Clean condition, single owner bluebook, no accidental history, ready for transfer."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCustomPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = `direct-post-${Date.now()}`;
    const formattedPrice = Number(askingPrice) || 300000;
    const initialBid = Math.round(formattedPrice * 0.9);
    const photoChoice = PRESET_PHOTO_OPTIONS[selectedPhotoIndex] || PRESET_PHOTO_OPTIONS[0];

    const finalPhotoUrl =
      (imageMode === "upload" && customPhotoUrl)
        ? customPhotoUrl
        : (imageMode === "url" && customUrlInput.trim())
        ? customUrlInput.trim()
        : photoChoice.url;

    const newVehicle: DirectPostData = {
      id: newId,
      name: `${year} ${model}`,
      year: year,
      mileage: `${Number(odometer).toLocaleString()} KM`,
      lotNumber: "BA 02-05 PA " + Math.floor(1000 + Math.random() * 9000),
      nepaliPlate: "बा ०२-०५ प " + Math.floor(1000 + Math.random() * 9000),
      province: "BAGMATI",
      ownership: ownership,
      location: location || "Kathmandu Valley",
      condition: conditionGrade,
      paperwork: taxStatus,
      highestBid: `NPR ${initialBid.toLocaleString()}`,
      timeLeft: "02:00:00 LEFT",
      imageUrl: finalPhotoUrl,
      images: [
        { url: finalPhotoUrl, label: "1. Main Profile Photo" },
        {
          url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
          label: "2. Meter & Odometer",
        },
        {
          url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=85",
          label: "3. Engine Chamber",
        },
      ],
      sellerName: sellerName.trim() || "Direct Seller (No Broker)",
      sellerPhone: sellerPhone.trim() ? (sellerPhone.startsWith("+977") ? sellerPhone : `+977 ${sellerPhone}`) : "+977 9841-XXXXXX",
      sellerAddress: location || "Kathmandu Valley",
      inspectionAvailability: "Available for physical spot check in Valley",
      bluebookStatus: `${ownership} in hand (नामसारी तयार)`,
      taxValidTill: taxStatus,
      keysCount: "2 Factory Keys",
      engineCondition: "Runs smooth and quiet",
      tyreCondition: "75% tyre grip remaining",
      simpleHowItRuns: "Starts immediately with push button. Quiet and reliable engine.",
      simpleAccidentStatus: "Never dropped or crashed. 100% straight frame and wheels.",
      simplePapersStatus: `Original Bluebook in hand. Road tax is ${taxStatus.toLowerCase()}.`,
      simpleKeysStatus: "2 original keys included.",
      notes: sellerNotes,
      isTrending: true,
      viewCount: 1,
      bidCount: 0,
      hypeBadge: "DIRECT POSTING",
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(newVehicle);
      onClose();
    }, 600);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-[#14161e] border border-[#E5B869]/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
      >
        {/* Modal Header */}
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

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
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
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((y) => (
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
                type="number"
                step="500"
                min="0"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="e.g. 12000"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#E5B869] block mb-1">
                Your Asking Price (NPR)
              </label>
              <input
                type="number"
                step="5000"
                min="20000"
                required
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="e.g. 325000"
                className="w-full bg-black/60 border border-[#E5B869]/50 rounded-xl px-3 py-2 text-xs text-[#E5B869] font-bold focus:outline-none focus:ring-1 focus:ring-[#E5B869]"
              />
            </div>
          </div>

          {/* Contact Details & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Vehicle Photo Upload & Selection Tabs */}
          <div className="space-y-3 bg-[#10121a] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">
                Vehicle Photo
              </label>
              <div className="flex gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    imageMode === "upload"
                      ? "bg-[#E5B869] text-black font-bold shadow"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("preset")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    imageMode === "preset"
                      ? "bg-[#E5B869] text-black font-bold shadow"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    imageMode === "url"
                      ? "bg-[#E5B869] text-black font-bold shadow"
                      : "bg-white/5 text-neutral-400 hover:text-white"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Tab 1: Upload Photo */}
            {imageMode === "upload" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {customPhotoUrl ? (
                  <div className="rounded-xl border border-[#E5B869]/50 bg-black/60 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customPhotoUrl}
                        alt="Uploaded preview"
                        className="w-16 h-16 object-cover rounded-xl border border-[#E5B869]/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {customPhotoName || "Bike Photo Ready"}
                        </p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ready to broadcast to 150+ showrooms
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
                          setCustomPhotoUrl(null);
                          setCustomPhotoName(null);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                        title="Remove photo"
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
                      Click to browse or take photo
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      Works with phone camera or saved photo gallery (JPG, PNG, WEBP)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Presets */}
            {imageMode === "preset" && (
              <div className="grid grid-cols-3 gap-2.5">
                {PRESET_PHOTO_OPTIONS.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      selectedPhotoIndex === idx
                        ? "border-[#E5B869] ring-2 ring-[#E5B869]/60 scale-[1.02]"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-1 inset-x-1 text-[10px] font-semibold text-white text-center truncate">
                      {opt.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Image URL */}
            {imageMode === "url" && (
              <div className="space-y-2">
                <input
                  type="text"
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
              onChange={(e) => setSellerNotes(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5B869]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(229,184,105,0.4)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#E5B869]/60 disabled:opacity-75"
            >
              {isSubmitting ? (
                <span>Publishing to 150+ Recondition Owners...</span>
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