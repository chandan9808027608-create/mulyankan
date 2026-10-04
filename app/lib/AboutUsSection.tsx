"use client";

import React from "react";
import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section id="about" className="w-full py-16 sm:py-24 scroll-mt-16 text-neutral-200 border-t border-white/10 bg-[#0d0e13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/30 text-[#E5B869] text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-pulse" />
            <span>ABOUT MULYANKAN.NP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineering Transparency for Nepal’s Two-Wheeler Market
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Born out of Teku’s automotive corridor, Mulyankan is Nepal’s first fair valuation engine and confidential showroom exchange platform for secondary motorcycles and scooters.
          </p>
        </div>

        {/* Mission & Problem Statement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#141620] border border-white/10 shadow-xl space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Problem in Nepal’s Secondary Market
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Selling a used motorcycle in Kathmandu has historically meant dealing with predatory brokers, deceptive Facebook marketplace listings, tampered odometers, and uncalculated road tax arrears. Private sellers often surrender 15% to 25% of their bike’s true value to middlemen who hold no legal accountability.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Odometer tampering • Unverified brokers • Bluebook tax traps</span>
            </div>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#141620] border border-[#E5B869]/30 shadow-xl space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-[#E5B869]/15 border border-[#E5B869]/30 text-[#E5B869] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Mulyankan Solution
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Mulyankan provides algorithmic fair market appraisals based on actual Kathmandu real-time dealer trades. Sellers list their bikes in 30 seconds without signing up, while 150+ licensed recondition houses compete with genuine cash bids. We generate official Yatayat Form No. 2 to guarantee seamless name transfer.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#E5B869]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B869]" />
              <span>Direct showroom offers • 100% Tax transparent • Official Yatayat deeds</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Trust */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight">
              Our Core Pillars of Governance
            </h3>
            <p className="text-xs text-neutral-400">
              Built specifically for the regulatory, taxation, and legal requirements of Bagmati Province.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Yatayat Form No. 2</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Legally binding bi-lingual vehicle transfer deeds generated automatically for Ekantakuna, Gurjudhara, and Sallaghari transport offices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5B869]/15 text-[#E5B869] flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-white">9-Digit PAN Verification</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Wholesale auction floor is restricted strictly to registered recondition companies with valid Government IRD PAN credentials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Staff Recruitment Flow</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enterprise showroom governance where senior mechanics and test appraisers join via company PAN and require proprietor 1-click authorization.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="text-sm font-bold text-white">Zero Sign-Up Privacy</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Posters never face account creation friction or spam. Contact numbers are guarded and disclosed only to verified winning dealers.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Counter Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141620] border border-[#E5B869]/30 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">150+</div>
            <div className="text-[11px] text-[#E5B869] font-bold uppercase tracking-wider mt-1 font-mono">
              Verified Showrooms
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Kathmandu, Lalitpur, Bhaktapur</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">NPR 4.8 Cr+</div>
            <div className="text-[11px] text-[#E5B869] font-bold uppercase tracking-wider mt-1 font-mono">
              Appraised Value
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Over 1,200+ bikes assessed</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">100%</div>
            <div className="text-[11px] text-[#E5B869] font-bold uppercase tracking-wider mt-1 font-mono">
              Yatayat Form 2 Legal
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Biometric name transfer kit</p>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">&lt; 24 Hrs</div>
            <div className="text-[11px] text-[#E5B869] font-bold uppercase tracking-wider mt-1 font-mono">
              Average Deal Lock
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Direct spot cash payout</p>
          </div>
        </div>

        {/* Kathmandu Valley Showroom Corridor Hubs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Our Kathmandu Valley Showroom Network
              </h3>
              <p className="text-xs text-neutral-400">
                Partnered with established, government-registered workshop facilities across the Valley.
              </p>
            </div>
            <Link
              href="/signup?role=recondition"
              className="text-xs text-[#E5B869] hover:underline font-bold self-start sm:self-auto cursor-pointer"
            >
              + Register Your Recondition House
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#E5B869] font-bold uppercase">Corridor 1 • Teku</span>
              <h5 className="font-bold text-white text-sm">Teku Automotive Mile</h5>
              <p className="text-[11px] text-neutral-400">
                Near Ekantakuna / Teku transport liaison. Specialized in commuter bikes, Bajaj Pulsar, and Yamaha MT/R15 series.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#E5B869] font-bold uppercase">Corridor 2 • Lalitpur</span>
              <h5 className="font-bold text-white text-sm">Lagankhel &amp; Kupandole</h5>
              <p className="text-[11px] text-neutral-400">
                Superbikes, Royal Enfield Classic/Hunter cruisers, and KTM Duke performance segment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#E5B869] font-bold uppercase">Corridor 3 • Bhaktapur</span>
              <h5 className="font-bold text-white text-sm">Suryabinayak Exchange</h5>
              <p className="text-[11px] text-neutral-400">
                High-mileage commuters, scooter fleets, and cross-district Koshi/Bagmati registration transfers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
