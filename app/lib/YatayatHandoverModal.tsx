"use client";

import React, { useState } from "react";

interface HandoverKitModalProps {
  bikeName: string;
  lotNumber: string;
  sellerName: string;
  sellerPhone: string;
  buyerName: string;
  agreedPriceNpr: number;
  isOpen: boolean;
  onClose: () => void;
  /** Show the seller's side of the handover (get paid, hand over) instead of the buyer's */
  forSeller?: boolean;
}

// Bottom sheet with the steps to finish a sale, from the buyer's or the seller's side.
export const YatayatHandoverModal = React.memo(function YatayatHandoverModal({
  bikeName,
  lotNumber,
  sellerName,
  sellerPhone,
  buyerName,
  agreedPriceNpr,
  isOpen,
  onClose,
  forSeller,
}: HandoverKitModalProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => (prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]));
  };

  const price = `NPR ${agreedPriceNpr.toLocaleString("en-IN")}`;
  const checklist = forSeller
    ? [
        { num: 1, title: "Let the shop check the bike", desc: `${buyerName} will look at the bike and ride it before paying.` },
        { num: 2, title: "Bring your bluebook and tax paper", desc: "Make sure the road tax is paid. The shop will check it." },
        { num: 3, title: "Clear any bank loan (कर्जा फुकुवा)", desc: "If the bike had a loan, get the bank's letter saying it is paid." },
        { num: 4, title: "Change the owner's name (नामसारी)", desc: "Go to the transport office together with citizenship copies and 2 photos." },
        { num: 5, title: "Get paid", desc: `Get ${price}, then give the keys and the bluebook.` },
      ]
    : [
    { num: 1, title: "Look at the bike and ride it", desc: "Check the frame, the engine and the lights at the seller's place." },
    { num: 2, title: "Check the bluebook and tax paper", desc: "Make sure the road tax is paid. You can check at the transport office." },
    { num: 3, title: "Make sure there is no bank loan (कर्जा फुकुवा)", desc: "If the bike had a loan, the bank must give a letter saying it is paid." },
    { num: 4, title: "Change the owner's name (नामसारी)", desc: "At the transport office, fill in Form No. 2 with citizenship copies and 2 photos." },
    { num: 5, title: "Pay the seller", desc: `Pay ${price}, then take the keys and the bluebook.` },
  ];
  const allDone = completedSteps.length === checklist.length;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 cursor-pointer">
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-up w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#16171d] border border-white/10 cursor-default"
      >
        <div className="shrink-0 p-4 pb-3 space-y-3 border-b border-white/10">
          <div className="mx-auto w-10 h-1 rounded-full bg-white/20 sm:hidden" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-white">{forSeller ? "Steps to finish the sale" : "Steps to collect"}</h3>
              <p className="text-xs text-neutral-400 truncate">
                {bikeName} • {lotNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/10 text-neutral-300 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-neutral-400 truncate">
              {forSeller ? `Buyer: ${buyerName}` : sellerName}
              {!forSeller && sellerPhone && (
                <>
                  {" • "}
                  <a href={`tel:${sellerPhone}`} className="text-emerald-400 font-semibold">
                    {sellerPhone}
                  </a>
                </>
              )}
            </span>
            <span className="font-black text-[#E5B869] shrink-0">NPR {agreedPriceNpr.toLocaleString("en-IN")}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#E5B869] transition-all" style={{ width: `${(completedSteps.length / checklist.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {checklist.map((item) => {
            const isDone = completedSteps.includes(item.num);
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => toggleStep(item.num)}
                className={`w-full text-left p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  isDone ? "bg-emerald-500/10 border-emerald-500/30" : "bg-black/20 border-white/10"
                }`}
              >
                <span
                  className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
                    isDone ? "bg-emerald-500 text-black" : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {isDone ? "✓" : item.num}
                </span>
                <span>
                  <span className={`block text-sm font-bold ${isDone ? "text-neutral-400 line-through" : "text-white"}`}>{item.title}</span>
                  <span className="block text-[11px] text-neutral-400 mt-0.5">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 p-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className={`w-full h-12 rounded-xl text-sm font-black cursor-pointer ${allDone ? "bg-emerald-500 text-black" : "bg-[#E5B869] text-black"}`}
          >
            {allDone ? "✓ All done" : `Done for now (${completedSteps.length} of ${checklist.length})`}
          </button>
        </div>
      </div>
    </div>
  );
});
