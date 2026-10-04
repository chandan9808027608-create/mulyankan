"use client";

import React, { useState } from "react";
import { BidRecord, DirectMessage } from "./dealerBidsData";

interface DealerBiddingConsoleProps {
  bikeId: string;
  bikeName: string;
  sellerName: string;
  sellerPhone: string;
  currentHighestBidNpr: number;
  bids: BidRecord[];
  messages: DirectMessage[];
  onNewBidSubmit: (amountNpr: number, dealerName: string, location: string) => void;
  onSendMessage: (messageText: string) => void;
}

export const DealerBiddingConsole = React.memo(function DealerBiddingConsole({
  bikeId,
  bikeName,
  sellerName,
  sellerPhone,
  currentHighestBidNpr,
  bids,
  messages,
  onNewBidSubmit,
  onSendMessage,
}: DealerBiddingConsoleProps) {
  const [activeTab, setActiveTab] = useState<"bids" | "chat">("bids");
  const [bidAmount, setBidAmount] = useState<string>(String(currentHighestBidNpr + 5000));
  const [dealerNameInput, setDealerNameInput] = useState("Koteshwor Auto Exchange");
  const [dealerLocInput, setDealerLocInput] = useState("Koteshwor, Kathmandu");
  const [chatInput, setChatInput] = useState("");
  const [bidSubmittedToast, setBidSubmittedToast] = useState(false);

  const bikeBids = bids.filter((b) => b.bikeId === bikeId);
  const bikeMessages = messages.filter((m) => m.bikeId === bikeId);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(bidAmount);
    if (!amount || amount <= currentHighestBidNpr) {
      alert(`Offer must be higher than current highest bid NPR ${currentHighestBidNpr.toLocaleString()}`);
      return;
    }
    onNewBidSubmit(amount, dealerNameInput, dealerLocInput);
    setBidSubmittedToast(true);
    setTimeout(() => setBidSubmittedToast(false), 2000);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  return (
    <div className="rounded-2xl bg-[#141620] border border-[#E5B869]/30 overflow-hidden shadow-xl space-y-3 p-4 sm:p-5">
      {/* Console Tab Switcher: Live Bids vs Direct Chat with Seller */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("bids")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bids"
                ? "bg-[#E5B869] text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>Live Bid History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {bikeBids.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-[#E5B869] text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>Direct Seller Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
          {bikeName.split(" ").slice(0, 3).join(" ")}
        </span>
      </div>

      {/* TAB 1: Live Bid History & Quick Bid Form */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          {/* Recent Bids Feed */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bikeBids.length > 0 ? (
              bikeBids.map((b) => (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    b.status === "active"
                      ? "bg-[#E5B869]/10 border-[#E5B869]/40 ring-1 ring-[#E5B869]/20"
                      : "bg-white/[0.02] border-white/5 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        b.status === "active" ? "bg-[#E5B869] text-black" : "bg-white/10 text-white"
                      }`}
                    >
                      {b.dealerName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{b.dealerName}</span>
                        {b.verifiedDealer && (
                          <span className="text-emerald-400 text-[10px]" title="Verified Recondition Shop">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {b.dealerLocation} • {b.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-xs sm:text-sm block">
                      NPR {b.amountNpr.toLocaleString()}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider ${
                        b.status === "active" ? "text-emerald-400" : "text-neutral-500"
                      }`}
                    >
                      {b.status === "active" ? "Leading Offer" : "Outbid"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-neutral-500">
                No offers yet. Be the first recondition house to place a bid!
              </div>
            )}
          </div>

          {/* Place Higher Bid Form */}
          <form onSubmit={handleBidSubmit} className="pt-2 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Your Workshop Name:</span>
              <input
                type="text"
                value={dealerNameInput}
                onChange={(e) => setDealerNameInput(e.target.value)}
                className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#E5B869] text-right"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-neutral-400">
                NPR
              </span>
              <input
                type="number"
                step="1000"
                min={currentHighestBidNpr + 1000}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-xl pl-12 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#E5B869]"
              />
            </div>

            {/* Quick Bid Increment Buttons */}
            <div className="flex gap-2">
              {[2000, 5000, 10000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => {
                    const current = Number(bidAmount) || currentHighestBidNpr;
                    setBidAmount(String(current + inc));
                  }}
                  className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-[#E5B869]/20 hover:border-[#E5B869]/40 border border-white/10 text-xs font-mono font-medium text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  +{inc.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-[#E5B869] hover:bg-[#d8ab5c] active:scale-[0.99] transition-all shadow cursor-pointer"
            >
              {bidSubmittedToast ? "✓ Offer Placed!" : "Place Verified Workshop Offer"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Direct In-App Chat with Seller */}
      {activeTab === "chat" && (
        <div className="space-y-3">
          {/* Chat Messages */}
          <div className="space-y-2.5 max-h-52 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/5">
            {bikeMessages.length > 0 ? (
              bikeMessages.map((m) => {
                const isDealer = m.sender === "dealer";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col text-xs max-w-[85%] ${
                      isDealer ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <span className="text-[10px] text-neutral-400 mb-0.5">
                      {m.senderName} • {m.timestamp}
                    </span>
                    <div
                      className={`p-2.5 rounded-xl leading-relaxed ${
                        isDealer
                          ? "bg-[#E5B869] text-black font-medium rounded-br-none"
                          : "bg-[#1f2230] text-neutral-100 rounded-bl-none border border-white/10"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-neutral-500">
                Start a negotiation chat with {sellerName} ({sellerPhone}).
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Message ${sellerName.split(" ")[0]}...`}
              className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5B869]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-bold text-xs cursor-pointer shrink-0 transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
});
