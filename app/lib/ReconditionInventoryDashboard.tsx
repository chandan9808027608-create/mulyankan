"use client";

import React, { useState } from "react";
import { YatayatHandoverModal } from "./YatayatHandoverModal";

export interface AcquiredVehicle {
  id: string;
  name: string;
  year: string;
  lotNumber: string;
  nepaliPlate: string;
  sellerName: string;
  sellerPhone: string;
  meetingLocation: string;
  meetingTime: string;
  purchasePriceNpr: number;
  reconditionCostNpr: number;
  expectedResalePriceNpr: number;
  status: "inspection_scheduled" | "bluebook_verified" | "yatayat_transfer_ready" | "in_showroom";
  imageUrl: string;
  engineNumber?: string;
  chassisNumber?: string;
  notes?: string;
}

interface ReconditionInventoryDashboardProps {
  showroomName: string;
  panNumber: string;
  onBackToAuctionFloor: () => void;
}

const INITIAL_ACQUIRED: AcquiredVehicle[] = [
  {
    id: "acq-1",
    name: "2023 Yamaha YZF R15 V4 Dark Knight",
    year: "2023",
    lotNumber: "BA 02-04 PA 8812",
    nepaliPlate: "बा ०२-०४ प ८८१२",
    sellerName: "Prashant Shrestha",
    sellerPhone: "+977 9841-892341",
    meetingLocation: "New Baneshwor (Near Eyeplex Mall), Kathmandu",
    meetingTime: "Today at 4:30 PM",
    purchasePriceNpr: 345000,
    reconditionCostNpr: 8000,
    expectedResalePriceNpr: 390000,
    status: "inspection_scheduled",
    imageUrl: "/black-yamaha-r15.jpg",
    engineNumber: "G3J4E091283",
    chassisNumber: "ME1RG5410N008129",
    notes: "Physical spot check scheduled. Need to verify single owner bluebook & road tax stamp.",
  },
  {
    id: "acq-2",
    name: "2022 KTM Duke 250 ABS BS6",
    year: "2022",
    lotNumber: "BA 98 PA 4120",
    nepaliPlate: "बा ९८ प ४१२०",
    sellerName: "Bikash Tamang",
    sellerPhone: "+977 9813-449012",
    meetingLocation: "Baluwatar (Near Russian Embassy), Kathmandu",
    meetingTime: "Tomorrow at 11:00 AM",
    purchasePriceNpr: 310000,
    reconditionCostNpr: 12000,
    expectedResalePriceNpr: 365000,
    status: "bluebook_verified",
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    engineNumber: "JY250NF71829",
    chassisNumber: "MD2JY2504M004120",
    notes: "Tax cleared up to Ashadh 2082. Metzelers good. Bluebook and inspection ready for handover.",
  },
  {
    id: "acq-3",
    name: "2022 Royal Enfield Classic 350",
    year: "2022",
    lotNumber: "BA 92 PA 9011",
    nepaliPlate: "बा ९२ प ९०११",
    sellerName: "Anil Shakya",
    sellerPhone: "+977 9851-023912",
    meetingLocation: "Jawalakhel / Kupandole, Lalitpur",
    meetingTime: "Completed Yesterday",
    purchasePriceNpr: 385000,
    reconditionCostNpr: 6500,
    expectedResalePriceNpr: 445000,
    status: "in_showroom",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    engineNumber: "J350RE009182",
    chassisNumber: "ME3J3501RE009011",
    notes: "Fully transferred at Ekantakuna Transport Office. Buffed, polished, and on showroom display.",
  },
];

export const ReconditionInventoryDashboard = React.memo(function ReconditionInventoryDashboard({
  showroomName,
  panNumber,
  onBackToAuctionFloor,
}: ReconditionInventoryDashboardProps) {
  const [vehicles, setVehicles] = useState<AcquiredVehicle[]>(INITIAL_ACQUIRED);
  const [activeSubTab, setActiveSubTab] = useState<"handovers" | "inventory">("handovers");
  const [selectedForChecklist, setSelectedForChecklist] = useState<AcquiredVehicle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Financial Summary
  const totalCapitalInvested = vehicles.reduce((sum, v) => sum + v.purchasePriceNpr, 0);
  const totalProjectedResale = vehicles.reduce((sum, v) => sum + v.expectedResalePriceNpr, 0);
  const totalEstimatedProfit = totalProjectedResale - totalCapitalInvested - vehicles.reduce((sum, v) => sum + v.reconditionCostNpr, 0);
  const pendingHandoversCount = vehicles.filter((v) => v.status !== "in_showroom").length;

  const handleUpdateStatus = (id: string, nextStatus: AcquiredVehicle["status"]) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v))
    );
    setToastMessage("Vehicle pipeline status updated successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <span className="text-xs font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Workshop Identity & Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  Showroom Purchase &amp; Handover Console
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  PAN: {panNumber || "601928472"}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Operating as: <strong className="text-white">{showroomName || "Teku Moto Recondition Hub"}</strong> • Bagmati Province
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToAuctionFloor}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>← Live Auction Floor</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Pipeline Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-1 shadow">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Vehicles Acquired
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{vehicles.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">Won Auctions</span>
          </div>
          <span className="text-[10px] text-neutral-400 block">Direct seller purchases</span>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-1 shadow">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Capital Invested
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#E5B869]">
              NPR {(totalCapitalInvested / 100000).toFixed(2)}L
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 block">NPR {totalCapitalInvested.toLocaleString()}</span>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-1 shadow">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Pending Handovers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{pendingHandoversCount}</span>
            <span className="text-xs text-amber-300 font-medium">In Valley</span>
          </div>
          <span className="text-[10px] text-neutral-400 block">Physical inspection / Yatayat</span>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-1 shadow">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Projected Profit
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              +NPR {(totalEstimatedProfit / 100000).toFixed(2)}L
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">
            ~{((totalEstimatedProfit / totalCapitalInvested) * 100).toFixed(1)}% Gross Margin
          </span>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("handovers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "handovers"
              ? "bg-[#E5B869] text-black shadow font-black"
              : "bg-white/5 text-neutral-300 hover:text-white"
          }`}
        >
          <span>Active Handovers &amp; Spot Inspections</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-black">
            {pendingHandoversCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("inventory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "inventory"
              ? "bg-[#E5B869] text-black shadow font-black"
              : "bg-white/5 text-neutral-300 hover:text-white"
          }`}
        >
          <span>Showroom Inventory &amp; Resale Pricing</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-bold">
            {vehicles.filter((v) => v.status === "in_showroom").length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. ACTIVE HANDOVERS TAB                                    */}
      {/* ========================================================= */}
      {activeSubTab === "handovers" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>
                <strong>Bagmati Transport Protocol:</strong> Verify bluebook road tax stamp up to 2081/82 and inspect frame/engine numbers before transferring funds.
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Handover Ready
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {vehicles
              .filter((v) => v.status !== "in_showroom")
              .map((bike) => (
                <div
                  key={bike.id}
                  className="rounded-2xl bg-[#14161e] border border-white/10 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bike.imageUrl}
                      alt={bike.name}
                      className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {bike.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] font-bold">
                          {bike.lotNumber}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Seller: <strong>{bike.sellerName}</strong>
                        </span>
                        <span>•</span>
                        <a
                          href={`tel:${bike.sellerPhone}`}
                          className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{bike.sellerPhone}</span>
                        </a>
                      </div>

                      <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{bike.meetingLocation}</span>
                        </span>
                        <span>•</span>
                        <span className="text-[#E5B869] font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{bike.meetingTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Agreed Deal Amount */}
                  <div className="flex lg:flex-col items-baseline lg:items-end justify-between w-full lg:w-auto border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
                    <span className="text-[11px] text-neutral-400 uppercase font-bold">Agreed Deal Price</span>
                    <span className="text-xl sm:text-2xl font-black text-[#E5B869]">
                      NPR {bike.purchasePriceNpr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500">Includes Bagmati bluebook handover</span>
                  </div>

                  {/* Right: Action Handlers */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    {/* Open Spot Checklist */}
                    <button
                      type="button"
                      onClick={() => setSelectedForChecklist(bike)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>Handover Checklist</span>
                    </button>

                    {/* Progress Pipeline Button */}
                    {bike.status === "inspection_scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(bike.id, "bluebook_verified")}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs transition-colors cursor-pointer"
                      >
                        ✓ Mark Bluebook Verified
                      </button>
                    )}

                    {bike.status === "bluebook_verified" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(bike.id, "in_showroom")}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs transition-all cursor-pointer hover:bg-emerald-400 shadow"
                      >
                        ✓ Handover Done → Move to Showroom
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SHOWROOM INVENTORY TAB                                  */}
      {/* ========================================================= */}
      {activeSubTab === "inventory" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((bike) => {
              const totalCost = bike.purchasePriceNpr + bike.reconditionCostNpr;
              const margin = bike.expectedResalePriceNpr - totalCost;
              const marginPct = ((margin / totalCost) * 100).toFixed(1);

              return (
                <div
                  key={bike.id}
                  className="rounded-2xl bg-[#14161e] border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bike.imageUrl} alt={bike.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white font-mono">
                        {bike.lotNumber}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        bike.status === "in_showroom"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {bike.status === "in_showroom" ? "Display Ready" : "In Workshop"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{bike.name}</h4>
                      <p className="text-[11px] text-neutral-400">{bike.notes || "Clean vehicle stock."}</p>
                    </div>

                    {/* Financial Breakdown Table */}
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-neutral-400 text-[11px]">
                        <span>Purchase Price:</span>
                        <span className="text-white font-mono">NPR {bike.purchasePriceNpr.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-400 text-[11px]">
                        <span>Service &amp; Detailing:</span>
                        <span className="text-amber-400 font-mono">+NPR {bike.reconditionCostNpr.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-1 flex justify-between font-bold text-white text-xs">
                        <span>Expected Retail:</span>
                        <span className="text-[#E5B869] font-mono">NPR {bike.expectedResalePriceNpr.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-emerald-400">
                        <span>Projected Margin:</span>
                        <span>+NPR {margin.toLocaleString()} ({marginPct}%)</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage(`Listing "${bike.name}" active on Kathmandu showroom marketplace!`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="w-full py-2 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-extrabold text-xs transition-all cursor-pointer text-center shadow"
                      >
                        Resale Ready
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yatayat Handover Legal Checklist Modal */}
      {selectedForChecklist && (
        <YatayatHandoverModal
          isOpen={Boolean(selectedForChecklist)}
          onClose={() => setSelectedForChecklist(null)}
          bikeName={selectedForChecklist.name}
          lotNumber={selectedForChecklist.lotNumber}
          sellerName={selectedForChecklist.sellerName}
          sellerPhone={selectedForChecklist.sellerPhone}
          buyerName={showroomName || "Teku Moto Recondition Hub"}
          agreedPriceNpr={selectedForChecklist.purchasePriceNpr}
        />
      )}
    </div>
  );
});