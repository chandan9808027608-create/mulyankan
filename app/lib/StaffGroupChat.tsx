"use client";

import React, { useState, useEffect, useRef } from "react";
import { getStaffApplications } from "./companyStaffData";
import { useLiveUpdates } from "./useLiveUpdates";
import { getLoggedInContact } from "./session";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  initials: string;
  avatarBg: string;
  timestamp: string;
  content: string;
  bikeRef?: {
    id: string;
    name: string;
    lotNumber: string;
    currentBid: string;
    imageUrl: string;
  };
  proposedOfferNpr?: number;
  isOfferCard?: boolean;
}

interface StaffGroupChatProps {
  showroomName: string;
  panNumber: string;
  availableBikes: Array<{
    id: string;
    name: string;
    lotNumber: string;
    highestBid: string;
    imageUrl: string;
    year?: string;
    mileage?: string;
  }>;
  onPlaceBidFromChat?: (bikeId: string, amountNpr: number) => void;
  onSwitchToAuction?: () => void;
  onSwitchToSwiper?: () => void;
}

// Staff chat has no accounts yet: each device gets a stable id and the name the
// person enters the first time they post.
const IDENTITY_KEY = "mulyankan_staff_identity";
const AVATAR_COLORS = [
  "bg-[#E5B869] text-black",
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-cyan-600 text-white",
  "bg-fuchsia-600 text-white",
];

function loadIdentity(): { id: string; name: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(IDENTITY_KEY) || "null");
    if (saved?.id) return saved;
  } catch {}
  const fresh = { id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, name: "" };
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

const colorFor = (key: string) => {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

interface StoredStaffMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  content: string;
  bikeRef?: ChatMessage["bikeRef"];
  proposedOfferNpr?: number;
  isOfferCard?: boolean;
}

const toChatMessage = (m: StoredStaffMessage): ChatMessage => ({
  ...m,
  senderRole: "Staff",
  initials: initialsOf(m.senderName),
  avatarBg: colorFor(m.senderId),
  timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

export const StaffGroupChat = React.memo(function StaffGroupChat({
  showroomName,
  panNumber,
  availableBikes,
  onPlaceBidFromChat,
  onSwitchToAuction,
  onSwitchToSwiper,
}: StaffGroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [identity, setIdentity] = useState<{ id: string; name: string }>({ id: "", name: "" });

  const loadMessages = React.useCallback(async () => {
    if (!panNumber) return;
    try {
      const res = await fetch(`/api/staff-chat?pan=${encodeURIComponent(panNumber)}`, { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json?.data)) setMessages(json.data.map(toChatMessage));
    } catch {}
  }, [panNumber]);

  useEffect(() => {
    setIdentity(loadIdentity());
    loadMessages();
  }, [loadMessages]);

  // Real-time: new staff messages from any device show up immediately
  useLiveUpdates((topic) => {
    if (topic === "staffMessages" || topic === "*") loadMessages();
  });
  const [inputText, setInputText] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState<string>(availableBikes[0]?.id || "");
  const [attachBike, setAttachBike] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<string>("");
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [bidToast, setBidToast] = useState<string | null>(null);

  // Dynamic Staff Roster including approved recruits
  const [staffList] = useState<StaffMember[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const apps = getStaffApplications();
      return apps
        .filter((a) => a.companyPan === panNumber && a.status === "approved")
        .map((a) => ({
          id: a.id,
          name: a.applicantName,
          role: a.role,
          initials: a.initials || a.applicantName.slice(0, 2).toUpperCase(),
          avatarBg: a.avatarBg || "bg-cyan-600 text-white",
          isOnline: false,
        }));
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only the message list, not the whole page
    const list = messagesEndRef.current?.parentElement;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selectedBike = availableBikes.find((b) => b.id === selectedBikeId) || availableBikes[0];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !isOfferMode) return;

    // Logged in: use the login name, never ask
    const loginName = getLoggedInContact()?.name;
    let me = loginName ? { ...identity, name: loginName } : identity;
    if (!me.name) {
      const entered = window.prompt("Your name (shown to your showroom team):", "")?.trim();
      if (!entered) return;
      me = { ...me, name: entered };
      setIdentity(me);
      try {
        localStorage.setItem(IDENTITY_KEY, JSON.stringify(me));
      } catch {}
    }

    const content = inputText.trim() || (isOfferMode ? `Price idea for ${selectedBike?.name || "this bike"}.` : "");
    const res = await fetch("/api/staff-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        panNumber,
        senderId: me.id,
        senderName: me.name,
        content,
        bikeRef:
          (attachBike || isOfferMode) && selectedBike
            ? {
                id: selectedBike.id,
                name: selectedBike.name,
                lotNumber: selectedBike.lotNumber,
                currentBid: selectedBike.highestBid,
                imageUrl: selectedBike.imageUrl,
              }
            : undefined,
        isOfferCard: isOfferMode,
        proposedOfferNpr: isOfferMode ? Number(proposedPrice) || undefined : undefined,
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setBidToast("Message did not send. Try again.");
      setTimeout(() => setBidToast(null), 3000);
      return;
    }

    setInputText("");
    setIsOfferMode(false);
    setAttachBike(false);
    loadMessages();
  };

  const handleQuickChip = (text: string, offerAmount?: number) => {
    if (offerAmount) {
      setProposedPrice(String(offerAmount));
      setIsOfferMode(true);
      setAttachBike(true);
      setInputText(`Let's offer NPR ${offerAmount.toLocaleString()} for this bike.`);
    } else {
      setInputText(text);
    }
  };

  const handlePlaceBidFromMessage = (bikeId: string, amountNpr: number) => {
    if (onPlaceBidFromChat) {
      onPlaceBidFromChat(bikeId, amountNpr);
      setBidToast(`Offer of NPR ${amountNpr.toLocaleString()} sent!`);
      setTimeout(() => setBidToast(null), 3500);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Bid Confirmation Toast */}
      {bidToast && (
        <div className="fixed top-14 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <span className="text-xs font-semibold text-white">{bidToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center text-[#E5B869]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  Team Chat
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Only your team sees this
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Showroom: <strong className="text-white">{showroomName}</strong> • PAN: {panNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav Switches */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToSwiper && (
            <button
              type="button"
              onClick={onSwitchToSwiper}
              className="px-3.5 py-2 rounded-xl bg-[#E5B869]/10 hover:bg-[#E5B869]/20 border border-[#E5B869]/30 text-[#E5B869] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Swipe</span>
            </button>
          )}

          {onSwitchToAuction && (
            <button
              type="button"
              onClick={onSwitchToAuction}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>← All Bikes</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Layout: Staff Column + Message Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Workshop Roster & Vehicle Under Discussion */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Vehicle Under Discussion Card */}
          <div className="p-4 rounded-2xl bg-[#14161e] border border-[#E5B869]/30 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5B869] font-mono">
                Bike We Are Talking About
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {selectedBike ? (
              <div className="space-y-2.5">
                <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedBike.imageUrl}
                    alt={selectedBike.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs font-bold text-white font-mono bg-black/60 px-2 py-0.5 rounded">
                    {selectedBike.lotNumber}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white">{selectedBike.name}</h4>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-neutral-400">Best Offer Now:</span>
                    <span className="text-[#E5B869] font-bold font-mono">{selectedBike.highestBid}</span>
                  </div>
                </div>

                {/* Bike Selector Dropdown */}
                <div className="space-y-1 pt-1 border-t border-white/10">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Pick a Bike:
                  </label>
                  <select
                    value={selectedBikeId}
                    onChange={(e) => setSelectedBikeId(e.target.value)}
                    className="w-full bg-[#181a24] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
                  >
                    {availableBikes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.lotNumber}) • {b.highestBid}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No bike picked.</p>
            )}
          </div>

          {/* Online Staff Team List */}
          <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Your Team ({staffList.length})
              </h3>
            </div>

            {staffList.length === 0 && (
              <p className="text-[11px] text-neutral-400">
                No team members yet. Say yes to people in Hiring and they show up here.
              </p>
            )}

            <div className="space-y-2">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${staff.avatarBg} flex items-center justify-center font-bold text-[10px]`}>
                      {staff.initials}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white leading-none">{staff.name}</h5>
                      <span className="text-[10px] text-neutral-400 leading-tight block mt-0.5">
                        {staff.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Live Interactive Conversation Stream */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-3xl bg-[#12141c] border border-white/15 shadow-2xl overflow-hidden">
          {/* Stream Header */}
          <div className="p-4 border-b border-white/10 bg-[#161822] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                  Team Talk
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Talk with your team about which bikes to buy and how much to pay
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#E5B869] bg-[#E5B869]/10 border border-[#E5B869]/30 px-2 py-0.5 rounded">
              {showroomName} Channel
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <p className="text-xs text-neutral-400 text-center pt-10">
                No messages yet. Say hi to your team!
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === identity.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${msg.avatarBg} flex items-center justify-center font-bold text-[10px] shrink-0 shadow`}>
                    {msg.initials}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {/* Meta line */}
                    <div className={`flex items-baseline gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs font-bold text-white">{msg.senderName}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">{msg.senderRole}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">• {msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow ${
                        isMe
                          ? "bg-[#E5B869] text-black font-medium rounded-tr-none"
                          : "bg-[#181a24] text-neutral-200 border border-white/10 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attached Bike Dossier Pill */}
                      {msg.bikeRef && (
                        <div className={`mt-2.5 p-2 rounded-xl flex items-center gap-2.5 border ${
                          isMe
                            ? "bg-black/20 border-black/30 text-black"
                            : "bg-black/50 border-white/10 text-white"
                        }`}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.bikeRef.imageUrl}
                              alt={msg.bikeRef.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs truncate">{msg.bikeRef.name}</h5>
                            <span className="text-[10px] font-mono block opacity-80">
                              {msg.bikeRef.lotNumber} • Market: {msg.bikeRef.currentBid}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Formal Proposed Offer Action Card */}
                      {msg.isOfferCard && msg.proposedOfferNpr && (
                        <div className={`mt-3 p-3 rounded-xl border space-y-2 ${
                          isMe
                            ? "bg-black/25 border-black/40 text-black"
                            : "bg-[#12131a] border-[#E5B869]/40 text-white"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                              Price Idea
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Ready
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-black tracking-wide font-sans">
                              NPR {msg.proposedOfferNpr.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (msg.bikeRef) {
                                  handlePlaceBidFromMessage(msg.bikeRef.id, msg.proposedOfferNpr!);
                                }
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-black text-[#E5B869] border border-[#E5B869]/50 hover:bg-black/80 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                            >
                              <span>Send This Offer →</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Valuation Consensus Chips */}
          <div className="px-4 py-2 bg-[#101218] border-t border-white/10 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 shrink-0">
              Quick Words:
            </span>
            {[
              { label: "Good bike, let's buy", amount: undefined },
              { label: "Too expensive", amount: undefined },
              { label: "Check the engine sound", amount: undefined },
              { label: "Is the tax paid?", amount: undefined },
              { label: "Needs a little cleaning", amount: undefined },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip.label, chip.amount)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#E5B869]/20 hover:border-[#E5B869]/40 border border-white/10 text-[11px] text-neutral-300 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Box & Action Bar */}
          <div className="p-4 bg-[#161822] border-t border-white/10 shrink-0 space-y-2.5">
            {/* Toggles: Offer Mode & Attach Vehicle */}
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOfferMode(!isOfferMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isOfferMode
                      ? "bg-[#E5B869] text-black shadow"
                      : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Suggest a Price</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachBike(!attachBike)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    attachBike || isOfferMode
                      ? "bg-white/20 text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>Add Bike</span>
                </button>
              </div>

              {isOfferMode && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-xs font-mono">Price NPR:</span>
                  <input
                    type="number"
                    step="1000"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-28 bg-black border border-[#E5B869] rounded-lg px-2.5 py-1 text-xs text-white font-bold font-mono focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Main Text Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isOfferMode
                    ? "Why this price?"
                    : "Write to your team..."
                }
                className="flex-1 bg-[#101118] border border-white/15 focus:border-[#E5B869] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-colors"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-extrabold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StaffGroupChat;
