"use client";

import React, { useMemo, useState } from "react";
import type { ReelVehicle } from "./VehicleReelsFeed";
import { getStaffApplications } from "./companyStaffData";
import { useLikedBikes } from "./likedBikes";

interface ShopProfileProps {
  showroomName: string;
  panNumber: string;
  userName?: string;
  role: "recondition" | "staff";
  vehicles: ReelVehicle[];
  offersMade: number;
  boughtCount: number;
  pendingStaffCount: number;
  onOpen: (list: ReelVehicle[], index: number) => void;
  onBought: () => void;
  onHire: () => void;
  onSell: () => void;
  onMyBikes: () => void;
  onSellerHome: () => void;
  onLogout: () => void;
}

// The shop's own page: shop card, numbers, shortcuts, then saved bikes.
export const ShopProfile = React.memo(function ShopProfile(props: ShopProfileProps) {
  const { showroomName, panNumber, userName, role, vehicles, offersMade, boughtCount, pendingStaffCount, onOpen } = props;
  const { liked } = useLikedBikes();
  // Only rendered in the browser (after login), so localStorage is safe to read here
  const [teamCount] = useState(() => {
    try {
      return getStaffApplications().filter((a) => a.companyPan === panNumber && a.status === "approved").length;
    } catch {
      return 0;
    }
  });

  const savedList = useMemo(
    () => vehicles.filter((v) => liked[v.id]).sort((a, b) => Date.parse(liked[b.id].at) - Date.parse(liked[a.id].at)),
    [vehicles, liked]
  );

  const initials = showroomName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div className="h-full overflow-y-auto bg-[#0d0e12]">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Shop card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#E5B869]/20 via-[#16171d] to-[#16171d] border border-[#E5B869]/25 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#E5B869] flex items-center justify-center text-xl font-black text-black">{initials}</div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-white truncate">{showroomName}</h1>
              <p className="text-xs text-neutral-400 truncate">
                {userName ? `${userName} • ` : ""}
                {role === "recondition" ? "Owner" : "Team member"}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono">PAN {panNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat value={boughtCount} label="Bought" onClick={props.onBought} />
            <Stat value={offersMade} label="Offers made" />
            <Stat value={teamCount} label="Team" onClick={props.onHire} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={props.onSell} className="flex-1 h-11 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer">
              + Sell a Bike
            </button>
            <button type="button" onClick={props.onMyBikes} className="flex-1 h-11 rounded-xl bg-white/10 text-white text-sm font-semibold cursor-pointer">
              My Bikes
            </button>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="rounded-2xl bg-[#16171d] border border-white/10 divide-y divide-white/10 overflow-hidden">
          <MenuRow label="Bikes I bought" onClick={props.onBought} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <MenuRow
            label="Hire people"
            badge={pendingStaffCount}
            onClick={props.onHire}
            icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
          <MenuRow label="Seller home page" onClick={props.onSellerHome} icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          <MenuRow label="Log out" danger onClick={props.onLogout} icon="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </div>

        {/* Saved bikes */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-sm font-bold text-white">Saved bikes</h2>
            <span className="text-xs text-neutral-500">{savedList.length}</span>
          </div>
          {savedList.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500 rounded-2xl border border-dashed border-white/10">
              Bikes you save show up here.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedList.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onOpen(savedList, idx)}
                  className="text-left rounded-2xl overflow-hidden bg-[#16171d] border border-white/10 hover:border-[#E5B869]/40 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.imageUrl} alt={v.name} loading="lazy" className="w-full aspect-[4/3] object-cover bg-neutral-900" />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-white truncate">{v.name}</p>
                    <p className="text-xs font-black text-[#E5B869]">{v.highestBid}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function Stat({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="rounded-xl bg-black/30 border border-white/5 py-2.5 flex flex-col items-center cursor-pointer disabled:cursor-default"
    >
      <span className="text-lg font-black text-white leading-tight">{value}</span>
      <span className="text-[11px] text-neutral-400">{label}</span>
    </button>
  );
}

function MenuRow({ label, icon, onClick, badge, danger }: { label: string; icon: string; onClick: () => void; badge?: number; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 text-left cursor-pointer">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? "bg-red-500/10 text-red-400" : "bg-white/5 text-[#E5B869]"}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </span>
      <span className={`flex-1 text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>{label}</span>
      {!!badge && <span className="min-w-[20px] h-5 px-1.5 rounded-md bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{badge}</span>}
      <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
