"use client";

import React, { useState } from "react";
import { BidRecord, DirectMessage } from "./dealerBidsData";
import { YatayatHandoverModal } from "./YatayatHandoverModal";

interface SellerListing {
  id: string;
  name: string;
  year: string;
  mileage: string;
  lotNumber: string;
  location: string;
  condition: string;
  paperwork: string;
  highestBid: string;
  timeLeft: string;
  imageUrl: string;
  sellerPhone: string;
}

interface SellerPostingsDashboardProps {
  postings: SellerListing[];
  bids: BidRecord[];
  messages: DirectMessage[];
  onAcceptOffer: (bikeId: string, bidId: string, dealerName: string, amountNpr: number) => void;
  onRejectOffer: (bikeId: string, bidId: string) => void;
  onPostNewVehicle: () => void;
}

export const SellerPostingsDashboard = React.memo(function SellerPostingsDashboard({
  postings,
  bids,
  messages,
  onAcceptOffer,
  onRejectOffer,
  onPostNewVehicle,
}: SellerPostingsDashboardProps) {
  const [selectedListingId, setSelectedListingId] = useState<string>(postings[0]?.id || "");
  const [acceptedDealToast, setAcceptedDealToast] = useState<{ dealer: string; amount: number } | null>(null);
  const [handoverModalData, setHandoverModalData] = useState<{
    dealerName: string;
    amountNpr: number;
    isOpen: boolean;
  } | null>(null);

  const activePosting = postings.find((p) => p.id === selectedListingId) || postings[0];
  const activeBids = bids.filter((b) => b.bikeId === activePosting?.id);
  const activeMessages = messages.filter((m) => m.bikeId === activePosting?.id);

  const handleAccept = (bid: BidRecord) => {
    onAcceptOffer(bid.bikeId, bid.id, bid.dealerName, bid.amountNpr);
    setAcceptedDealToast({ dealer: bid.dealerName, amount: bid.amountNpr });
    setHandoverModalData({
      dealerName: bid.dealerName,
      amountNpr: bid.amountNpr,
      isOpen: true,
    });
    setTimeout(() => setAcceptedDealToast(null), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Toast notification when offer accepted */}
      {acceptedDealToast && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Offer Accepted & Locked!</h4>
            <p className="text-xs text-neutral-300">
              NPR {acceptedDealToast.amount.toLocaleString()} with {acceptedDealToast.dealer}. SMS dispatch sent.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              My Vehicle Postings &amp; Inquiries
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Review incoming cash offers from verified recondition workshops, negotiate, and lock Yatayat handover.
          </p>
        </div>

        <button
          type="button"
          onClick={onPostNewVehicle}
          className="px-5 py-3 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(229,184,105,0.3)] transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>+ Post Another Vehicle</span>
        </button>
      </div>

      {postings.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#14161f] border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center mx-auto text-[#E5B869]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">No active vehicle postings yet</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Get instant guaranteed cash bids from 150+ verified recondition houses across Kathmandu Valley in just 2 minutes.
          </p>
          <button
            type="button"
            onClick={onPostNewVehicle}
            className="px-6 py-3 rounded-xl bg-[#E5B869] text-black font-bold text-xs hover:bg-[#d8ab5c] transition-all cursor-pointer"
          >
            Start Free Evaluation &amp; Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 4 Cols: Postings List Switcher */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
              Active Listings ({postings.length})
            </h3>

            <div className="space-y-2.5">
              {postings.map((p) => {
                const isSelected = p.id === activePosting?.id;
                const pBids = bids.filter((b) => b.bikeId === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedListingId(p.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                      isSelected
                        ? "bg-[#181a26] border-[#E5B869] shadow-[0_0_20px_rgba(229,184,105,0.15)] ring-1 ring-[#E5B869]/30"
                        : "bg-[#14161e] border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0 border border-white/10"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                          {pBids.length} bids
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        {p.year} • {p.mileage}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-neutral-500">Top Offer:</span>
                        <span className="font-bold text-[#E5B869]">{p.highestBid}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8 Cols: Live Offers Management & Details */}
          {activePosting && (
            <div className="lg:col-span-8 space-y-6">
              {/* Selected Posting Overview Card */}
              <div className="rounded-3xl bg-[#14161f] border border-white/10 p-5 sm:p-7 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5B869] font-bold block mb-1">
                      Plate: {activePosting.lotNumber}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {activePosting.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Location: {activePosting.location} • Ownership: {activePosting.paperwork}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 block">Highest Workshop Offer</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#E5B869] tracking-tight">
                      {activePosting.highestBid}
                    </span>
                    <span className="text-xs text-emerald-400 block font-medium mt-0.5">
                      {activeBids.length} Competing Dealers
                    </span>
                  </div>
                </div>

                {/* Bids List with Accept / Reject Controls */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
                    <span>Competing Workshop Offers</span>
                    <span className="text-neutral-500 text-[11px] font-normal">
                      Click &ldquo;Accept Offer&rdquo; to lock deal and exchange Yatayat documents
                    </span>
                  </h4>

                  <div className="space-y-2.5">
                    {activeBids.length > 0 ? (
                      activeBids.map((b) => (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all ${
                            b.status === "active"
                              ? "bg-[#181a26] border-[#E5B869]/50 shadow-md ring-1 ring-[#E5B869]/20"
                              : "bg-black/40 border-white/10 opacity-70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#E5B869]/20 text-[#E5B869] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E5B869]/30">
                              {b.dealerName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{b.dealerName}</span>
                                {b.verifiedDealer && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] border border-emerald-500/30">
                                    Verified Recondition
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {b.dealerLocation} • Placed {b.timestamp}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                            <div className="text-left sm:text-right">
                              <span className="text-lg font-black text-white font-mono block">
                                NPR {b.amountNpr.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-neutral-400 block">Instant Cash Payout</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {b.status === "accepted" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHandoverModalData({
                                      dealerName: b.dealerName,
                                      amountNpr: b.amountNpr,
                                      isOpen: true,
                                    })
                                  }
                                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>✓ Yatayat Kit</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAccept(b)}
                                  className="px-4 py-2 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-extrabold text-xs transition-all shadow cursor-pointer"
                                >
                                  Accept Deal
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onRejectOffer(b.bikeId, b.id)}
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <span className="text-2xl">⏳</span>
                        <p className="text-xs text-neutral-400 font-medium">
                          Dispatching your vehicle to verified workshops in Teku, Gwarko &amp; Nayabazar...
                        </p>
                        <span className="text-[10px] text-neutral-500 block">
                          Offers typically arrive within 10–15 minutes during business hours.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Buyer Chat History */}
                {activeMessages.length > 0 && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Workshop Inquiries &amp; Spot Check Messages
                    </h4>

                    <div className="space-y-2 bg-black/50 p-3 rounded-2xl border border-white/10">
                      {activeMessages.map((m) => (
                        <div key={m.id} className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                            <span className="font-semibold text-neutral-300">{m.senderName}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="text-neutral-200 bg-white/5 p-2.5 rounded-xl border border-white/5">
                            {m.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Yatayat Handover & Transfer Protocol Modal */}
      {handoverModalData && activePosting && (
        <YatayatHandoverModal
          bikeName={activePosting.name}
          lotNumber={activePosting.lotNumber}
          sellerName="Direct Verified Seller"
          sellerPhone={activePosting.sellerPhone}
          buyerName={handoverModalData.dealerName}
          agreedPriceNpr={handoverModalData.amountNpr}
          isOpen={handoverModalData.isOpen}
          onClose={() => setHandoverModalData(null)}
        />
      )}
    </div>
  );
});
