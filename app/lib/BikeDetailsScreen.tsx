"use client";

import React, { useEffect, useRef, useState } from "react";
import type { BidRecord, DirectMessage } from "./dealerBidsData";
import { timeAgo } from "./dealerBidsData";
import { PhotoSlider } from "./PhotoSlider";
import { BOOKMARK_PATH } from "./VehicleReelsFeed";
import { useLikedBikes } from "./likedBikes";
import { SegmentedTabs } from "./ScreenHeader";

export interface DetailsBike {
  id: string;
  name: string;
  year: string;
  mileage: string;
  lotNumber: string;
  ownership: string;
  location: string;
  condition: string;
  highestBid: string;
  imageUrl: string;
  images: { url: string; label: string }[];
  notes?: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  inspectionAvailability?: string;
  simpleHowItRuns: string;
  simpleAccidentStatus: string;
  simplePapersStatus: string;
  simpleKeysStatus: string;
  createdAt?: string;
}

interface BikeDetailsScreenProps {
  bike: DetailsBike;
  bids: BidRecord[];
  messages: DirectMessage[];
  showroomName: string;
  onClose: () => void;
  onOffer: () => void;
  onShareToTeam: () => void;
  onSendMessage: (text: string) => Promise<boolean>;
}

// Full-screen bike page for shop users: photos, price, offers, chat with the seller, condition.
export function BikeDetailsScreen({ bike, bids, messages, showroomName, onClose, onOffer, onShareToTeam, onSendMessage }: BikeDetailsScreenProps) {
  const { liked, toggleLike } = useLikedBikes();
  const [tab, setTab] = useState<"about" | "offers" | "chat">("about");
  const photos = bike.images.length > 0 ? bike.images : [{ url: bike.imageUrl, label: "" }];
  const bikeBids = bids.filter((b) => b.bikeId === bike.id);
  const leading = bikeBids.find((b) => b.status === "active" || b.status === "accepted");
  const sold = leading?.status === "accepted";
  const youLead = leading?.dealerName === showroomName;
  // Only the seller's messages and our own shop's
  const thread = messages.filter((m) => m.bikeId === bike.id && (m.sender === "seller" || m.senderName === showroomName));
  const saved = !!liked[bike.id];

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2.5 border-b border-white/5">
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
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{bike.name}</p>
          <p className="text-[11px] text-neutral-500 font-mono truncate">{bike.lotNumber}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleLike(bike.id)}
          aria-label={saved ? "Saved" : "Save"}
          className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center cursor-pointer ${
            saved ? "bg-[#E5B869] border-[#E5B869] text-black" : "bg-[#16171d] border-white/10 text-white"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill={saved ? "currentColor" : "none"}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={BOOKMARK_PATH} />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Photos */}
          <div className="relative aspect-[4/3] bg-black">
            <PhotoSlider photos={photos} alt={bike.name} />
          </div>

          <div className="p-4 space-y-4">
            {/* Price card */}
            <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {sold ? (
                  <span className="px-2 py-0.5 rounded-md bg-neutral-600 text-white text-[10px] font-bold uppercase">Sold</span>
                ) : youLead ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold uppercase">You lead</span>
                ) : null}
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">{bike.condition}</span>
                {bike.createdAt && <span className="text-[11px] text-neutral-500">Added {timeAgo(bike.createdAt)}</span>}
              </div>
              <h1 className="text-xl font-black text-white leading-tight">{bike.name}</h1>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">{bikeBids.length ? "Best offer" : "Price"}</p>
                  <p className="text-2xl font-black text-[#E5B869] leading-none">{bike.highestBid}</p>
                </div>
                <p className="text-xs text-neutral-400">
                  {bikeBids.length} {bikeBids.length === 1 ? "offer" : "offers"}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Fact label="Year" value={bike.year} />
                <Fact label="Ridden" value={bike.mileage} />
                <Fact label="Owner" value={bike.ownership.split(" (")[0]} />
              </div>
            </div>

            <SegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { key: "about", label: "About" },
                { key: "offers", label: `Offers (${bikeBids.length})` },
                { key: "chat", label: "Seller chat" },
              ]}
            />

            {tab === "about" && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#16171d] border border-white/10 divide-y divide-white/10">
                  <Answer q="Does it start and ride well?" a={bike.simpleHowItRuns} />
                  <Answer q="Any crashes, falls or dents?" a={bike.simpleAccidentStatus} />
                  <Answer q="Is the bluebook ready?" a={bike.simplePapersStatus} />
                  <Answer q="Are keys included?" a={bike.simpleKeysStatus} />
                </div>

                {bike.notes && (
                  <div className="rounded-2xl bg-[#E5B869]/5 border border-[#E5B869]/20 p-3.5">
                    <p className="text-xs font-bold text-[#E5B869] mb-1">Seller says</p>
                    <p className="text-sm text-neutral-200">&ldquo;{bike.notes}&rdquo;</p>
                  </div>
                )}

                <div className="rounded-2xl bg-[#16171d] border border-white/10 p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-[#E5B869] text-black font-black text-sm flex items-center justify-center">
                    {bike.sellerName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0]!.toUpperCase())
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{bike.sellerName}</p>
                    <p className="text-xs text-neutral-400 truncate">{bike.sellerAddress || bike.location}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{bike.inspectionAvailability || "Ask the seller when you can see it"}</p>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 px-1">
                  See the bike before you pay. If something was hidden, you can take your offer back.
                </p>
              </div>
            )}

            {tab === "offers" && (
              <div className="space-y-2">
                {bikeBids.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-500 rounded-2xl border border-dashed border-white/10">No offers yet. Be the first!</p>
                ) : (
                  bikeBids.map((b) => {
                    const mine = b.dealerName === showroomName;
                    const top = b.status === "active" || b.status === "accepted";
                    return (
                      <div
                        key={b.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${top ? "bg-[#E5B869]/10 border-[#E5B869]/30" : "bg-[#16171d] border-white/10 opacity-70"}`}
                      >
                        <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-black ${top ? "bg-[#E5B869] text-black" : "bg-white/10 text-white"}`}>
                          {b.dealerName[0]?.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {mine ? "You" : b.dealerName}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">{timeAgo(b.timestamp)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">NPR {b.amountNpr.toLocaleString("en-IN")}</p>
                          <p className={`text-[10px] font-bold uppercase ${top ? "text-emerald-400" : "text-neutral-500"}`}>
                            {b.status === "accepted" ? "Accepted" : b.status === "active" ? "Leading" : b.status === "inspecting" ? "Checking" : "Beaten"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {tab === "chat" && <SellerChat thread={thread} sellerName={bike.sellerName} onSend={onSendMessage} />}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-white/10 bg-[#111217] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex gap-2">
          <a
            href={`tel:${bike.sellerPhone}`}
            aria-label="Call seller"
            className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500 text-black flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          <button
            type="button"
            onClick={onShareToTeam}
            className="h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-semibold cursor-pointer"
          >
            Ask team
          </button>
          <button
            type="button"
            onClick={onOffer}
            disabled={sold}
            className="flex-1 h-12 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer disabled:opacity-40"
          >
            {sold ? "Sold" : "Make an offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/5 px-2 py-1.5 min-w-0">
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className="text-xs font-bold text-white truncate">{value}</p>
    </div>
  );
}

function Answer({ q, a }: { q: string; a: string }) {
  return (
    <div className="flex items-start gap-3 p-3">
      <span className="w-6 h-6 shrink-0 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-black flex items-center justify-center">✓</span>
      <div>
        <p className="text-sm font-semibold text-white">{q}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{a}</p>
      </div>
    </div>
  );
}

function SellerChat({ thread, sellerName, onSend }: { thread: DirectMessage[]; sellerName: string; onSend: (text: string) => Promise<boolean> }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const ok = await onSend(text.trim());
    setSending(false);
    setFailed(!ok);
    if (ok) setText("");
  };

  return (
    <div className="rounded-2xl bg-[#16171d] border border-white/10 overflow-hidden">
      <div className="max-h-80 overflow-y-auto p-3 space-y-2">
        {thread.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">Say hello to {sellerName.split(" ")[0]} 👋</p>}
        {thread.map((m) => {
          const mine = m.sender === "dealer";
          return (
            <div key={m.id} className={`flex flex-col max-w-[80%] ${mine ? "ml-auto items-end" : "items-start"}`}>
              {/* Sender's name above every message, including your own */}
              <span className={`text-[11px] font-semibold px-1 ${mine ? "text-[#E5B869]" : "text-neutral-400"}`}>{m.senderName}</span>
              <p className={`px-3.5 py-2 rounded-2xl text-sm break-words ${mine ? "bg-[#E5B869] text-black rounded-br-md" : "bg-white/10 text-white rounded-bl-md"}`}>
                {m.message}
              </p>
              <span className="text-[10px] text-neutral-600 px-1 mt-0.5">{timeAgo(m.timestamp)}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {failed && <p className="px-3 text-xs text-red-400">Message did not send. Try again.</p>}
      <form onSubmit={submit} className="flex gap-2 p-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${sellerName.split(" ")[0]}...`}
          className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="h-10 px-4 rounded-xl bg-[#E5B869] text-black text-sm font-bold cursor-pointer disabled:opacity-30"
        >
          Send
        </button>
      </form>
    </div>
  );
}
