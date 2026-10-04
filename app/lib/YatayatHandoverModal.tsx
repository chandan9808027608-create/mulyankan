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
}

export const YatayatHandoverModal = React.memo(function YatayatHandoverModal({
  bikeName,
  lotNumber,
  sellerName,
  sellerPhone,
  buyerName,
  agreedPriceNpr,
  isOpen,
  onClose,
}: HandoverKitModalProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  if (!isOpen) return null;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const checklist = [
    {
      num: 1,
      title: "Physical Spot Inspection & Test Ride",
      desc: "Mechanic checks chassis straightness, engine compression & electricals at seller premises.",
    },
    {
      num: 2,
      title: "Original Bluebook & Tax Receipt Verification",
      desc: "Confirm road tax cleared up to Ashadh 2082 at Bagmati Transport Office (Ekantakuna / Gurjudhara).",
    },
    {
      num: 3,
      title: "No-Loan Clearance (Bank NOC / कर्जा फुकुवा)",
      desc: "Ensure vehicle does not carry hypothecation with any bank or financial institution.",
    },
    {
      num: 4,
      title: "Handover Receipt & Name Transfer Application (नामसारी फारम)",
      desc: "Buyer workshop signs Yatayat official Form No. 2 with citizenship copies & 2 passport photos.",
    },
    {
      num: 5,
      title: "Instant Bank Transfer or Cash Payout",
      desc: `Full agreed sum of NPR ${agreedPriceNpr.toLocaleString()} transferred before keys & bluebook handover.`,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-[#141620] border border-[#E5B869]/40 p-6 sm:p-8 shadow-2xl space-y-6 cursor-default my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5B869] block mb-1">
              Government Protocol • Bagmati Province
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Yatayat Transfer &amp; Handover Kit
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Official legal name transfer (नामसारी) checklist for {bikeName} ({lotNumber}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px]">Vehicle:</span>
            <strong className="text-white truncate block">{bikeName}</strong>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Plate Number:</span>
            <strong className="text-emerald-400 font-mono block">{lotNumber}</strong>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Seller:</span>
            <strong className="text-white block">{sellerName}</strong>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Locked Amount:</span>
            <strong className="text-[#E5B869] font-bold text-sm block">
              NPR {agreedPriceNpr.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Legal Checklist Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              Verification Steps Completed
            </span>
            <span className="font-bold text-[#E5B869]">
              {completedSteps.length} of {checklist.length} Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => {
              const isDone = completedSteps.includes(item.num);
              return (
                <div
                  key={item.num}
                  onClick={() => toggleStep(item.num)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isDone
                      ? "bg-emerald-950/30 border-emerald-500/40 text-neutral-200"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 text-neutral-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isDone
                        ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                        : "bg-white/10 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {isDone ? "✓" : item.num}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isDone ? "text-white line-through opacity-90" : "text-neutral-200"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button & Print Receipt */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              alert(`Official Handover Receipt generated for ${bikeName} (${lotNumber}) at NPR ${agreedPriceNpr.toLocaleString()}! Both seller (${sellerName}) and buyer workshop receive digital copy.`);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#E5B869] hover:bg-[#d8ab5c] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow cursor-pointer text-center"
          >
            Generate Digital Handover Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl border border-white/15 hover:bg-white/5 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Close Kit
          </button>
        </div>
      </div>
    </div>
  );
});
