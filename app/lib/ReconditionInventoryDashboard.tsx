"use client";

import React, { useState } from "react";
import { YatayatHandoverModal } from "./YatayatHandoverModal";
import { ScreenHeader, SegmentedTabs, Toast } from "./ScreenHeader";

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
  /** Vehicles this showroom has won (accepted bids); status edits are kept locally per session. */
  acquiredVehicles?: AcquiredVehicle[];
}

const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;

export const ReconditionInventoryDashboard = React.memo(function ReconditionInventoryDashboard({
  showroomName,
  panNumber,
  onBackToAuctionFloor,
  acquiredVehicles = [],
}: ReconditionInventoryDashboardProps) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AcquiredVehicle["status"]>>({});
  const vehicles = acquiredVehicles.map((v) => ({ ...v, status: statusOverrides[v.id] ?? v.status }));
  const [activeSubTab, setActiveSubTab] = useState<"handovers" | "inventory">("handovers");
  const [selectedForChecklist, setSelectedForChecklist] = useState<AcquiredVehicle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCapitalInvested = vehicles.reduce((sum, v) => sum + v.purchasePriceNpr, 0);
  const totalProjectedResale = vehicles.reduce((sum, v) => sum + v.expectedResalePriceNpr, 0);
  const totalEstimatedProfit = totalProjectedResale - totalCapitalInvested - vehicles.reduce((sum, v) => sum + v.reconditionCostNpr, 0);
  const toCollect = vehicles.filter((v) => v.status !== "in_showroom");
  const inShop = vehicles.filter((v) => v.status === "in_showroom");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateStatus = (id: string, nextStatus: AcquiredVehicle["status"]) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: nextStatus }));
    showToast(nextStatus === "in_showroom" ? "Moved to your shop" : "Bluebook marked as checked");
  };

  const list = activeSubTab === "handovers" ? toCollect : inShop;

  return (
    <div className="min-h-full bg-[#0d0e12]">
      <Toast message={toastMessage} />
      <ScreenHeader title="Bikes I bought" subtitle={`${showroomName} • PAN ${panNumber}`} onBack={onBackToAuctionFloor} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Numbers */}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Bikes bought" value={String(vehicles.length)} />
          <Stat label="Waiting to collect" value={String(toCollect.length)} tone="text-amber-400" />
          <Stat label="Money spent" value={npr(totalCapitalInvested)} tone="text-[#E5B869]" />
          <Stat
            label="Profit you can make"
            value={vehicles.length ? `+${npr(totalEstimatedProfit)}` : "—"}
            tone="text-emerald-400"
          />
        </div>

        <SegmentedTabs
          value={activeSubTab}
          onChange={setActiveSubTab}
          options={[
            { key: "handovers", label: `To collect (${toCollect.length})` },
            { key: "inventory", label: `In my shop (${inShop.length})` },
          ]}
        />

        {activeSubTab === "handovers" && toCollect.length > 0 && (
          <p className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <strong>Before you pay:</strong> check the bluebook, check the tax is paid, and check the engine and frame numbers match.
          </p>
        )}

        {list.length === 0 ? (
          <div className="py-14 text-center rounded-2xl border border-dashed border-white/10 space-y-1">
            <p className="text-sm font-bold text-white">{activeSubTab === "handovers" ? "Nothing to collect" : "No bikes in your shop yet"}</p>
            <p className="text-xs text-neutral-500">
              {vehicles.length === 0 ? "When a seller accepts your offer, the bike shows up here." : "Bikes move here once you collect them."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((bike) => {
              const totalCost = bike.purchasePriceNpr + bike.reconditionCostNpr;
              const margin = bike.expectedResalePriceNpr - totalCost;
              return (
                <div key={bike.id} className="rounded-2xl bg-[#16171d] border border-white/10 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bike.imageUrl} alt={bike.name} className="w-24 h-20 rounded-xl object-cover bg-neutral-900 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{bike.name}</h3>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            bike.status === "in_showroom"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : bike.status === "bluebook_verified"
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {bike.status === "in_showroom" ? "In shop" : bike.status === "bluebook_verified" ? "Bluebook OK" : "To check"}
                        </span>
                      </div>
                      <p className="text-base font-black text-[#E5B869] leading-tight">{npr(bike.purchasePriceNpr)}</p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {bike.sellerName}
                        {bike.sellerPhone && (
                          <>
                            {" • "}
                            <a href={`tel:${bike.sellerPhone}`} className="text-emerald-400 font-semibold">
                              {bike.sellerPhone}
                            </a>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {bike.meetingLocation} • {bike.meetingTime}
                      </p>
                    </div>
                  </div>

                  {activeSubTab === "inventory" ? (
                    <div className="mx-3 mb-3 p-3 rounded-xl bg-black/30 border border-white/5 grid grid-cols-3 gap-2 text-center">
                      <Mini label="Paid" value={npr(bike.purchasePriceNpr)} />
                      <Mini label="Will sell for" value={npr(bike.expectedResalePriceNpr)} tone="text-[#E5B869]" />
                      <Mini label="Profit" value={`+${npr(margin)}`} tone="text-emerald-400" />
                    </div>
                  ) : (
                    <div className="flex gap-2 px-3 pb-3">
                      <button
                        type="button"
                        onClick={() => setSelectedForChecklist(bike)}
                        className="flex-1 h-10 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold cursor-pointer"
                      >
                        Steps to collect
                      </button>
                      {bike.status === "inspection_scheduled" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(bike.id, "bluebook_verified")}
                          className="flex-1 h-10 rounded-xl bg-[#E5B869] text-black text-xs font-black cursor-pointer"
                        >
                          ✓ Bluebook checked
                        </button>
                      )}
                      {bike.status === "bluebook_verified" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(bike.id, "in_showroom")}
                          className="flex-1 h-10 rounded-xl bg-emerald-500 text-black text-xs font-black cursor-pointer"
                        >
                          ✓ Got the bike
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedForChecklist && (
        <YatayatHandoverModal
          isOpen={Boolean(selectedForChecklist)}
          onClose={() => setSelectedForChecklist(null)}
          bikeName={selectedForChecklist.name}
          lotNumber={selectedForChecklist.lotNumber}
          sellerName={selectedForChecklist.sellerName}
          sellerPhone={selectedForChecklist.sellerPhone}
          buyerName={showroomName}
          agreedPriceNpr={selectedForChecklist.purchasePriceNpr}
        />
      )}
    </div>
  );
});

function Stat({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="p-3 rounded-2xl bg-[#16171d] border border-white/10">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className={`text-base font-black truncate ${tone}`}>{value}</p>
    </div>
  );
}

function Mini({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className={`text-[11px] font-bold truncate ${tone}`}>{value}</p>
    </div>
  );
}
