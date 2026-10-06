"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HowItWorksProps {
  onOpenDirectPost?: () => void;
  initialRole?: "seller" | "dealer";
}

export default function HowItWorksSection({ onOpenDirectPost, initialRole }: HowItWorksProps) {
  const [activeTab, setActiveTab] = useState<"seller" | "dealer">(initialRole || "seller");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "dealer" || roleParam === "seller") {
        setActiveTab(roleParam);
      }
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 scroll-mt-16 text-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/30 text-[#E5B869] text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-pulse" />
            <span>OPERATING PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Mulyankan Operates
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            A transparent secondary two-wheeler exchange connecting Kathmandu bike owners directly with verified, tax-registered recondition houses.
          </p>

          {/* Interactive Role Switcher */}
          <div className="inline-flex flex-col sm:flex-row w-full sm:w-auto p-1.5 rounded-2xl bg-[#14161f] border border-white/10 text-xs font-bold gap-1 mt-4 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab("seller");
                if (typeof window !== "undefined") {
                  try {
                    const url = new URL(window.location.href);
                    url.searchParams.set("role", "seller");
                    window.history.replaceState(window.history.state, "", url.toString());
                  } catch {}
                }
              }}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto ${
                activeTab === "seller"
                  ? "bg-[#E5B869] text-black shadow-lg font-extrabold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>For Motorcycle Sellers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("dealer");
                if (typeof window !== "undefined") {
                  try {
                    const url = new URL(window.location.href);
                    url.searchParams.set("role", "dealer");
                    window.history.replaceState(window.history.state, "", url.toString());
                  } catch {}
                }
              }}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto ${
                activeTab === "dealer"
                  ? "bg-[#E5B869] text-black shadow-lg font-extrabold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>For Recondition Showrooms</span>
            </button>
          </div>
        </div>

        {/* 1. SELLER FLOW (Zero Sign-up, Real Cash Bids, Yatayat Transfer) */}
        {activeTab === "seller" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-[#E5B869]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#E5B869]/15 border border-[#E5B869]/30 text-[#E5B869] flex items-center justify-center font-mono font-black text-lg shadow">
                  01
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#E5B869] tracking-widest font-bold">
                    Zero Account Friction
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Direct 30-Sec Entry
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Select your bike model, year, and kilometer mileage. Upload a single photo from your phone. No username, password, or profile registration required.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Account Needed:</span>
                    <span className="text-emerald-400 font-bold">None (Zero Sign-up)</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Phone Privacy:</span>
                    <span className="text-neutral-300">Confidential Guarded</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-[#E5B869]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#E5B869]/15 border border-[#E5B869]/30 text-[#E5B869] flex items-center justify-center font-mono font-black text-lg shadow">
                  02
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#E5B869] tracking-widest font-bold">
                    Competitive Showroom Floor
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Real Recondition Bids
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  150+ verified Kathmandu recondition houses review your bike. Dealers inspect engine compression, bluebook status, and road tax, competing with live price offers.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Participating Hubs:</span>
                    <span className="text-[#E5B869] font-bold">Teku, Lalitpur, Balaju</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Scraper Protection:</span>
                    <span className="text-emerald-400">Gatekept to Dealers</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-[#E5B869]/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#E5B869]/15 border border-[#E5B869]/30 text-[#E5B869] flex items-center justify-center font-mono font-black text-lg shadow">
                  03
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#E5B869] tracking-widest font-bold">
                    Official Government Handover
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Instant Cash &amp; Form 2
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Accept the highest standing offer in <em>My Postings</em>. The showroom owner conducts spot physical verification, pays cash on the spot, and auto-generates official Yatayat Form No. 2.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Payment Method:</span>
                    <span className="text-emerald-400 font-bold">Instant Spot Cash/Fonepay</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Yatayat Transfer:</span>
                    <span className="text-[#E5B869]">Form No. 2 Included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Action Strip */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141620] via-[#1a1c29] to-[#141620] border border-[#E5B869]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg font-black text-white">Have a bike to sell in Kathmandu Valley?</h4>
                <p className="text-xs text-neutral-400">Post in 30 seconds with zero registration and receive bids from verified showrooms today.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
                {onOpenDirectPost && (
                  <button
                    type="button"
                    onClick={onOpenDirectPost}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#E5B869] hover:bg-[#d4a758] text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer text-center"
                  >
                    Post Bike Directly
                  </button>
                )}
                <Link
                  href="/condition-report"
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer text-center"
                >
                  Post With Full Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. RECONDITION SHOWROOM FLOW (9-Digit PAN, Staff Recruitment, Swipe Appraisal, Form 2) */}
        {activeTab === "dealer" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-black text-lg shadow">
                  01
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest font-bold">
                    Wholesale Gatekeeping
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Company Registration &amp; PAN
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Showrooms must register with their official 9-digit Government PAN/VAT number and OCR/Ward certificates. Normal posters and casual browsers cannot view the wholesale auction floor.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Tax Verification:</span>
                    <span className="text-emerald-400 font-bold">9-Digit IRD PAN</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Public Scrapers:</span>
                    <span className="text-rose-400">Strictly Blocked</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-cyan-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-black text-lg shadow">
                  02
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-bold">
                    Enterprise Staff Onboarding
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Staff Recruitment &amp; Approval
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your mechanics and appraisers sign up using your registered Company PAN. A high-priority notification routes directly to the owner console for 1-click authorization.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Staff Joining:</span>
                    <span className="text-cyan-400 font-bold">Via Company PAN</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Approval Gate:</span>
                    <span className="text-[#E5B869]">Proprietor 1-Click</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden shadow-xl group hover:border-emerald-500/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-black text-lg shadow">
                  03
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest font-bold">
                    Rapid Showroom Operations
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                    Swipe Deck &amp; Staff War Room
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Evaluate incoming stock in seconds using the Tinder-style swipe deck. Debated repair deductions with senior mechanics in the Staff War Room and generate Yatayat Form 2 for won lots.
                </p>
                <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Appraisal Speed:</span>
                    <span className="text-emerald-400 font-bold">Swipe Right to Offer</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Legal Documentation:</span>
                    <span className="text-white">Biometric Form No. 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Showroom Action Strip */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141620] via-[#1a1c29] to-[#141620] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg font-black text-white">Operate a recondition house in Nepal?</h4>
                <p className="text-xs text-neutral-400">Register your showroom with government PAN or authorize your staff to join the wholesale bidding network.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
                <Link
                  href="/signup?role=recondition"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#E5B869] hover:bg-[#d4a758] text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all text-center"
                >
                  Register Company PAN
                </Link>
                <Link
                  href="/signup?role=staff"
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all text-center"
                >
                  Join as Staff Member
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Frequently Asked Questions Accordion */}
        <div className="pt-8 border-t border-white/10 max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-1 pb-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-neutral-400">
              Clear answers on how Mulyankan ensures zero bluebook fraud, tax clearance, and legal security.
            </p>
          </div>

          {[
            {
              q: "Do I need to create an account or password to sell my bike?",
              a: "No! Sellers can list their motorcycle in under 30 seconds by simply selecting the brand, year, mileage, and entering their contact number. No password or registration is required. You can review standing dealer offers anytime in 'My Postings'.",
            },
            {
              q: "Why can't normal posters see the live auction bidding floor?",
              a: "To protect individual sellers from unauthorized broker calls and keep secondary market bidding professional, the live floor is gatekept exclusively to recondition houses verified with official 9-digit Government PAN/VAT numbers and OCR certificates.",
            },
            {
              q: "How does Yatayat Form No. 2 deed generation work?",
              a: "When a deal is finalized, Mulyankan automatically generates the official Yatayat Karyalaya Form No. 2 (biometric vehicle transfer deed) pre-filled with the bike's chassis number, engine number, seller credentials, and showroom PAN for Ekantakuna, Gurjudhara, or Sallaghari transport offices.",
            },
            {
              q: "How does the Showroom Staff Recruitment protocol work?",
              a: "First, the showroom company registers its 9-digit PAN. Mechanics, appraisers, and staff then create an account by entering their company's PAN. The applicant's request routes to the showroom owner's console with a pending alert. Once the owner clicks 'Approve & Enlist', the staff member is granted access to the Staff War Room and Swipe Appraisal deck.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#141620] border border-white/10 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-[#E5B869] transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-[#E5B869] font-mono text-base ml-2">
                  {openFaq === idx ? "−" : "+"}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-neutral-300 leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
