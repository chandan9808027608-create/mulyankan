"use client";

import React, { useState, useEffect, useRef } from "react";
import { getStaffApplications } from "./companyStaffData";

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

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Ramesh Shrestha",
    role: "Proprietor & Lead Appraiser",
    initials: "RS",
    avatarBg: "bg-[#E5B869] text-black",
    isOnline: true,
  },
  {
    id: "staff-2",
    name: "Santosh Maharjan",
    role: "Senior Mechanic (Chassis/Engine)",
    initials: "SM",
    avatarBg: "bg-blue-600 text-white",
    isOnline: true,
  },
  {
    id: "staff-3",
    name: "Sunil Thapa",
    role: "Procurement & Yatayat Liaison",
    initials: "ST",
    avatarBg: "bg-emerald-600 text-white",
    isOnline: true,
  },
  {
    id: "staff-me",
    name: "You (Staff Member)",
    role: "Showroom Valuation Desk",
    initials: "ME",
    avatarBg: "bg-amber-600 text-white",
    isOnline: true,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "staff-1",
    senderName: "Ramesh Shrestha",
    senderRole: "Proprietor & Lead Appraiser",
    initials: "RS",
    avatarBg: "bg-[#E5B869] text-black",
    timestamp: "10:14 AM",
    content: "Team, please check the fresh 2023 Yamaha R15 V4 posted from New Baneshwor. The seller claims single hand bluebook with no crashes.",
    bikeRef: {
      id: "r15-1",
      name: "2023 Yamaha YZF R15 V4",
      lotNumber: "BA 02-04 PA 8812",
      currentBid: "NPR 3,45,000",
      imageUrl: "/black-yamaha-r15.jpg",
    },
  },
  {
    id: "msg-2",
    senderId: "staff-2",
    senderName: "Santosh Maharjan",
    senderRole: "Senior Mechanic (Chassis/Engine)",
    initials: "SM",
    avatarBg: "bg-blue-600 text-white",
    timestamp: "10:18 AM",
    content: "I zoomed in on the right crankcase and swingarm photos. The frame is straight and factory paint is intact. Front fork seals show zero weeping. Tyre has at least 70% life remaining.",
  },
  {
    id: "msg-3",
    senderId: "staff-3",
    senderName: "Sunil Thapa",
    senderRole: "Procurement & Yatayat Liaison",
    initials: "ST",
    avatarBg: "bg-emerald-600 text-white",
    timestamp: "10:22 AM",
    content: "Tax status is verified clean up to Ashadh 2082 at Bagmati Yatayat. Resale market at Teku for an R15 V4 in this trim is between NPR 3,85,000 to 3,95,000.",
  },
  {
    id: "msg-4",
    senderId: "staff-1",
    senderName: "Ramesh Shrestha",
    senderRole: "Proprietor & Lead Appraiser",
    initials: "RS",
    avatarBg: "bg-[#E5B869] text-black",
    timestamp: "10:25 AM",
    content: "Current highest standing bid is NPR 3,45,000. If we offer NPR 3,50,000 we can secure the deal with around NPR 35k profit margin after detailing.",
    isOfferCard: true,
    proposedOfferNpr: 350000,
    bikeRef: {
      id: "r15-1",
      name: "2023 Yamaha YZF R15 V4",
      lotNumber: "BA 02-04 PA 8812",
      currentBid: "NPR 3,45,000",
      imageUrl: "/black-yamaha-r15.jpg",
    },
  },
];

export const StaffGroupChat = React.memo(function StaffGroupChat({
  showroomName,
  panNumber,
  availableBikes,
  onPlaceBidFromChat,
  onSwitchToAuction,
  onSwitchToSwiper,
}: StaffGroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState<string>(availableBikes[0]?.id || "");
  const [attachBike, setAttachBike] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<string>("350000");
  const [isOfferMode, setIsOfferMode] = useState(false);
  const [bidToast, setBidToast] = useState<string | null>(null);

  // Dynamic Staff Roster including approved recruits
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    if (typeof window === "undefined") return DEFAULT_STAFF;
    try {
      const apps = getStaffApplications();
      const approved = apps.filter((a) => a.companyPan === panNumber && a.status === "approved");
      const mapped: StaffMember[] = approved.map((a) => ({
        id: a.id,
        name: a.applicantName,
        role: a.role,
        initials: a.initials || a.applicantName.slice(0, 2).toUpperCase(),
        avatarBg: a.avatarBg || "bg-cyan-600 text-white",
        isOnline: true,
      }));
      const existingNames = new Set(DEFAULT_STAFF.map((s) => s.name));
      const newStaff = mapped.filter((m) => !existingNames.has(m.name));
      return [...DEFAULT_STAFF, ...newStaff];
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedBike = availableBikes.find((b) => b.id === selectedBikeId) || availableBikes[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !isOfferMode) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      senderId: "staff-me",
      senderName: "You",
      senderRole: "Showroom Valuation Desk",
      initials: "YOU",
      avatarBg: "bg-amber-600 text-white",
      timestamp: timeString,
      content: inputText.trim() || (isOfferMode ? `Formal offer proposal submitted for ${selectedBike?.name || "the vehicle"}.` : ""),
      ...(attachBike || isOfferMode
        ? {
            bikeRef: selectedBike
              ? {
                  id: selectedBike.id,
                  name: selectedBike.name,
                  lotNumber: selectedBike.lotNumber,
                  currentBid: selectedBike.highestBid,
                  imageUrl: selectedBike.imageUrl,
                }
              : undefined,
          }
        : {}),
      isOfferCard: isOfferMode,
      proposedOfferNpr: isOfferMode ? Number(proposedPrice) || undefined : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setIsOfferMode(false);
    setAttachBike(false);

    // Realistic staff auto-reply simulation after 1.5s
    if (isOfferMode && proposedPrice) {
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const autoReply: ChatMessage = {
          id: "msg-" + (Date.now() + 1),
          senderId: "staff-1",
          senderName: "Ramesh Shrestha",
          senderRole: "Proprietor & Lead Appraiser",
          initials: "RS",
          avatarBg: "bg-[#E5B869] text-black",
          timestamp: replyTime,
          content: `Approved NPR ${Number(proposedPrice).toLocaleString()} recommendation. The numbers look profitable. Let us submit this bid to the seller.`,
        };
        setMessages((prev) => [...prev, autoReply]);
      }, 1400);
    }
  };

  const handleQuickChip = (text: string, offerAmount?: number) => {
    if (offerAmount) {
      setProposedPrice(String(offerAmount));
      setIsOfferMode(true);
      setAttachBike(true);
      setInputText(`I propose we submit NPR ${offerAmount.toLocaleString()} for this bike.`);
    } else {
      setInputText(text);
    }
  };

  const handlePlaceBidFromMessage = (bikeId: string, amountNpr: number) => {
    if (onPlaceBidFromChat) {
      onPlaceBidFromChat(bikeId, amountNpr);
      setBidToast(`Bid of NPR ${amountNpr.toLocaleString()} dispatched to auction floor!`);
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
                  Workshop Valuation War Room
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Internal Staff Chat
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Showroom: <strong className="text-white">{showroomName || "Teku Moto Recondition Hub"}</strong> • PAN: {panNumber} • Private internal discussion
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
              <span>Swift Swiper</span>
            </button>
          )}

          {onSwitchToAuction && (
            <button
              type="button"
              onClick={onSwitchToAuction}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>← Live Auction Floor</span>
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
                Vehicle In Discussion
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
                    <span className="text-neutral-400">Current Highest Bid:</span>
                    <span className="text-[#E5B869] font-bold font-mono">{selectedBike.highestBid}</span>
                  </div>
                </div>

                {/* Bike Selector Dropdown */}
                <div className="space-y-1 pt-1 border-t border-white/10">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Change Focus Vehicle:
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
              <p className="text-xs text-neutral-400">No vehicle selected.</p>
            )}
          </div>

          {/* Online Staff Team List */}
          <div className="p-4 rounded-2xl bg-[#14161e] border border-white/10 space-y-3 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Workshop Evaluators ({staffList.length})
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All Online
              </span>
            </div>

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
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
                  Internal Bidding &amp; Margin Consensus
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Staff debate real-time mechanical integrity, refurbishment overhead, and target offer ceiling
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#E5B869] bg-[#E5B869]/10 border border-[#E5B869]/30 px-2 py-0.5 rounded">
              Teku Hub Channel
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === "staff-me";

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
                              Staff Offer Proposal
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Ready to Dispatch
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-black tracking-wide font-sans">
                              NPR {msg.proposedOfferNpr.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono opacity-80">
                              Projected Gross: +NPR 35,000
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
                              <span>Submit Offer to Live Auction →</span>
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
              Quick Chips:
            </span>
            {[
              { label: "Suggest NPR 3,25,000", amount: 325000 },
              { label: "Suggest NPR 3,50,000", amount: 350000 },
              { label: "Check Engine Sound", amount: undefined },
              { label: "Bluebook Tax Stamped?", amount: undefined },
              { label: "Needs Minor Buffing (-NPR 5,000)", amount: undefined },
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
                  <span>Propose Offer Amount</span>
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
                  <span>Attach Vehicle Card</span>
                </button>
              </div>

              {isOfferMode && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-xs font-mono">Offer NPR:</span>
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
                    ? "Add valuation rationale for this offer proposal..."
                    : "Message workshop team (e.g. Ramesh, Santosh) about vehicle appraisal..."
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
