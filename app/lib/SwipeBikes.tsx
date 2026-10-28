"use client";

import React, { useMemo, useRef, useState } from "react";
import type { ReelVehicle } from "./VehicleReelsFeed";
import { BOOKMARK_PATH } from "./VehicleReelsFeed";
import { formatNpr, parseNpr, useLikedBikes } from "./likedBikes";

interface SwipeBikesProps {
  vehicles: ReelVehicle[];
  /** Send a real offer; resolves true when the server accepted it */
  onSendOffer: (vehicleId: string, amountNpr: number) => Promise<boolean>;
  onAskTeam: (vehicle: ReelVehicle) => void;
  onDetails: (vehicle: ReelVehicle) => void;
}

const SWIPE_OUT_PX = 110;

// Like or skip bikes one at a time. Likes/skips are saved on this device.
export const SwipeBikes = React.memo(function SwipeBikes({ vehicles, onSendOffer, onAskTeam, onDetails }: SwipeBikesProps) {
  const { liked, skipped, like, skip, unlike, unskip, clearSkipped } = useLikedBikes();
  const [tab, setTab] = useState<"swipe" | "liked">("swipe");
  const [history, setHistory] = useState<{ id: string; action: "like" | "skip" }[]>([]);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const [offerFor, setOfferFor] = useState<ReelVehicle | null>(null);
  const [offerAmount, setOfferAmount] = useState(0);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const deck = useMemo(() => vehicles.filter((v) => !liked[v.id] && !skipped.includes(v.id)), [vehicles, liked, skipped]);
  const likedList = useMemo(
    () =>
      vehicles
        .filter((v) => liked[v.id])
        .sort((a, b) => Date.parse(liked[b.id].at) - Date.parse(liked[a.id].at)),
    [vehicles, liked]
  );
  const top = deck[0];
  const next = deck[1];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const decide = (dir: "left" | "right") => {
    if (!top || leaving) return;
    setLeaving(dir);
    setTimeout(() => {
      if (dir === "right") {
        like(top.id);
        setOfferFor(top);
        setOfferAmount(parseNpr(top.highestBid) + 1000);
      } else {
        skip(top.id);
      }
      setHistory((h) => [...h, { id: top.id, action: dir === "right" ? "like" : "skip" }]);
      setLeaving(null);
      setDrag({ x: 0, y: 0, active: false });
    }, 200);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    if (last.action === "like") unlike(last.id);
    else unskip(last.id);
    setHistory((h) => h.slice(0, -1));
  };

  const sendOffer = async () => {
    if (!offerFor || offerAmount <= 0) return;
    setSending(true);
    const ok = await onSendOffer(offerFor.id, offerAmount);
    setSending(false);
    if (ok) {
      like(offerFor.id, offerAmount);
      setOfferFor(null);
      showToast(`Offer of ${formatNpr(offerAmount)} sent!`);
    }
  };

  const dx = leaving === "right" ? 600 : leaving === "left" ? -600 : drag.x;
  const cardStyle: React.CSSProperties = {
    transform: `translate(${dx}px, ${leaving ? drag.y : drag.y * 0.3}px) rotate(${dx / 18}deg)`,
    transition: drag.active ? "none" : "transform 0.2s ease-out",
  };

  return (
    <div className="relative h-full flex flex-col bg-[#0d0e12]">
      {/* Two-way switch: pick bikes / bikes you saved */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="mx-auto max-w-xs grid grid-cols-2 p-1 rounded-xl bg-[#16171d] border border-white/10">
          {([
            ["swipe", "Pick bikes"],
            ["liked", `Saved${likedList.length ? ` (${likedList.length})` : ""}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors ${tab === key ? "bg-[#E5B869] text-black" : "text-neutral-400"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "swipe" ? (
        <>
          <div className="relative flex-1 min-h-0 mx-auto w-full max-w-md px-3 pt-1">
            {!top ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-6">
                <div className="text-5xl">🎉</div>
                <p className="text-base font-bold text-white">You saw every bike!</p>
                <p className="text-xs text-neutral-400">New bikes show up here when sellers add them.</p>
                <div className="flex gap-2 pt-2">
                  {skipped.length > 0 && (
                    <button type="button" onClick={clearSkipped} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold cursor-pointer">
                      See skipped again
                    </button>
                  )}
                  {likedList.length > 0 && (
                    <button type="button" onClick={() => setTab("liked")} className="px-4 py-2 rounded-xl bg-[#E5B869] text-black text-sm font-bold cursor-pointer">
                      See saved
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {next && <SwipeCard vehicle={next} className="scale-[0.95] opacity-70" />}
                <SwipeCard
                  key={top.id}
                  vehicle={top}
                  style={cardStyle}
                  likeOpacity={Math.max(0, Math.min(1, dx / SWIPE_OUT_PX))}
                  nopeOpacity={Math.max(0, Math.min(1, -dx / SWIPE_OUT_PX))}
                  onPointerDown={(e) => {
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    start.current = { x: e.clientX, y: e.clientY };
                    setDrag({ x: 0, y: 0, active: true });
                  }}
                  onPointerMove={(e) => {
                    if (!drag.active) return;
                    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true });
                  }}
                  onPointerUp={() => {
                    const moved = Math.hypot(drag.x, drag.y);
                    if (drag.x > SWIPE_OUT_PX) decide("right");
                    else if (drag.x < -SWIPE_OUT_PX) decide("left");
                    else {
                      setDrag({ x: 0, y: 0, active: false });
                      if (moved < 8) onDetails(top);
                    }
                  }}
                />
              </>
            )}
          </div>

          {/* Undo, Skip, Save, Info */}
          <div className="shrink-0 mx-auto w-full max-w-md flex items-center gap-2 px-4 py-4">
            <IconButton label="Back" onClick={undo} disabled={history.length === 0}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </IconButton>
            <button
              type="button"
              aria-label="Skip"
              onClick={() => decide("left")}
              disabled={!top}
              className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/15 text-white font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Skip
            </button>
            <button
              type="button"
              aria-label="Save"
              onClick={() => decide("right")}
              disabled={!top}
              className="flex-1 h-14 rounded-2xl bg-[#E5B869] text-black font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition disabled:opacity-30"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d={BOOKMARK_PATH} />
              </svg>
              Save
            </button>
            <IconButton label="Info" onClick={() => top && onDetails(top)} disabled={!top}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </IconButton>
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {likedList.length === 0 ? (
            <div className="py-20 text-center space-y-2 px-6">
              <p className="text-base font-bold text-white">Nothing saved yet</p>
              <p className="text-xs text-neutral-400">Press Save on a bike you like.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 pb-4 space-y-2">
              {likedList.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onDetails(v)}
                  className="w-full flex items-center gap-3 p-2 rounded-2xl bg-[#16171d] border border-white/10 text-left cursor-pointer hover:border-[#E5B869]/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.imageUrl} alt={v.name} loading="lazy" className="w-20 h-16 rounded-xl object-cover bg-neutral-900" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v.name}</p>
                    <p className="text-xs font-black text-[#E5B869]">{v.highestBid}</p>
                    {liked[v.id]?.offerNpr ? (
                      <p className="text-[11px] font-semibold text-emerald-400">Your offer: {formatNpr(liked[v.id].offerNpr!)}</p>
                    ) : (
                      <p className="text-[11px] text-neutral-500">No offer yet</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-neutral-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Offer sheet after a like */}
      {offerFor && (
        <div className="absolute inset-0 z-20 flex items-end bg-black/60" onClick={() => setOfferFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="sheet-up w-full max-w-md mx-auto rounded-t-3xl bg-[#16171d] p-5 pb-6 space-y-4">
            <div className="mx-auto w-10 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={offerFor.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">Saved {offerFor.name}</p>
                <p className="text-xs text-neutral-400">Price now: {offerFor.highestBid}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-300 mb-2">Want to make an offer?</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOfferAmount((a) => Math.max(0, a - 1000))} className="w-11 h-11 rounded-xl bg-white/10 text-white text-xl cursor-pointer">
                  −
                </button>
                <input
                  type="number"
                  value={offerAmount || ""}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="flex-1 min-w-0 h-11 rounded-xl bg-black text-center text-lg font-black text-white border border-white/15 focus:outline-none focus:border-[#E5B869]"
                />
                <button type="button" onClick={() => setOfferAmount((a) => a + 1000)} className="w-11 h-11 rounded-xl bg-white/10 text-white text-xl cursor-pointer">
                  +
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000].map((step) => (
                  <button key={step} type="button" onClick={() => setOfferAmount((a) => a + step)} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-neutral-300 cursor-pointer">
                    +{step.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={sendOffer}
              disabled={sending || offerAmount <= 0}
              className="w-full h-12 rounded-xl bg-[#E5B869] text-black font-black text-sm cursor-pointer disabled:opacity-50"
            >
              {sending ? "Sending..." : `Send Offer ${offerAmount > 0 ? formatNpr(offerAmount) : ""}`}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onAskTeam(offerFor);
                  setOfferFor(null);
                }}
                className="flex-1 h-11 rounded-xl bg-white/10 text-white text-sm font-semibold cursor-pointer"
              >
                Ask my team
              </button>
              <button type="button" onClick={() => setOfferFor(null)} className="flex-1 h-11 rounded-xl text-neutral-400 text-sm font-semibold cursor-pointer">
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold shadow-lg">{toast}</div>
      )}
    </div>
  );
});

function SwipeCard({
  vehicle,
  className = "",
  style,
  likeOpacity = 0,
  nopeOpacity = 0,
  ...pointer
}: {
  vehicle: ReelVehicle;
  className?: string;
  style?: React.CSSProperties;
  likeOpacity?: number;
  nopeOpacity?: number;
  onPointerDown?: React.PointerEventHandler;
  onPointerMove?: React.PointerEventHandler;
  onPointerUp?: React.PointerEventHandler;
}) {
  return (
    <div
      {...pointer}
      style={style}
      className={`absolute inset-x-3 top-1 bottom-0 rounded-3xl overflow-hidden bg-[#16171d] border border-white/10 shadow-2xl select-none touch-none flex flex-col ${className}`}
    >
      {/* Photo on top, details underneath so nothing covers the bike */}
      <div className="relative flex-1 min-h-0 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vehicle.imageUrl} alt="" aria-hidden draggable={false} className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 pointer-events-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vehicle.imageUrl} alt={vehicle.name} draggable={false} className="relative w-full h-full object-contain pointer-events-none" />
      </div>

      <span
        className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-[#E5B869] text-black text-lg font-black pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        SAVE
      </span>
      <span
        className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-neutral-200 text-black text-lg font-black pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        SKIP
      </span>

      <div className="shrink-0 p-4 space-y-1 pointer-events-none">
        <h3 className="text-lg font-black text-white leading-tight truncate">{vehicle.name}</h3>
        <p className="text-xs text-neutral-400 truncate">
          {vehicle.mileage} • {vehicle.condition} • {vehicle.location}
        </p>
        <p className="text-2xl font-black text-[#E5B869] pt-1">{vehicle.highestBid}</p>
        <p className="text-[10px] text-neutral-500">Tap the photo for full details</p>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-12 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 text-neutral-300 flex items-center justify-center cursor-pointer active:scale-90 transition-transform disabled:opacity-30"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </button>
  );
}
