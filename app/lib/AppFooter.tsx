"use client";

import React from "react";
import Link from "next/link";
import { MulyankanBrandLogo } from "./AppNavbar";

interface AppFooterProps {
  onOpenDirectPost?: () => void;
  onNavigateTab?: (tab: "seller" | "dealer" | "seller_dashboard") => void;
}

export default function AppFooter({ onOpenDirectPost, onNavigateTab }: AppFooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0b10] py-16 px-4 sm:px-8 text-xs text-neutral-400 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1 & 2: Brand & Platform Mission */}
        <div className="lg:col-span-2 space-y-4">
          <MulyankanBrandLogo />
          <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
            Nepal&apos;s authoritative two-wheeler algorithmic valuation engine and private showroom exchange. Connecting individual bike sellers directly with 150+ verified, tax-compliant recondition houses across the Kathmandu Valley.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Bagmati Handover Compliant
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              9-Digit PAN Authentication
            </span>
          </div>
        </div>

        {/* Col 3: For Bike Sellers */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">For Bike Sellers</h4>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <Link href="/how-it-works" className="hover:text-[#E5B869] transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/#find-value" className="hover:text-[#E5B869] transition-colors">
                Fair Valuation Engine
              </Link>
            </li>
            {onOpenDirectPost && (
              <li>
                <button
                  type="button"
                  onClick={onOpenDirectPost}
                  className="text-left hover:text-[#E5B869] transition-colors cursor-pointer"
                >
                  Post Bike (Zero Sign-up)
                </button>
              </li>
            )}
            {onNavigateTab && (
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab("seller_dashboard")}
                  className="text-left hover:text-[#E5B869] transition-colors cursor-pointer"
                >
                  My Postings Dashboard
                </button>
              </li>
            )}
            <li>
              <Link href="/about" className="hover:text-[#E5B869] transition-colors">
                About Mulyankan
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: For Showrooms */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Recondition Hubs</h4>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <Link href="/login" className="hover:text-[#E5B869] transition-colors">
                Showroom Login Portal
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-[#E5B869] transition-colors">
                Register Showroom (PAN)
              </Link>
            </li>
            {onNavigateTab && (
              <>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("dealer")}
                    className="text-left hover:text-[#E5B869] transition-colors cursor-pointer"
                  >
                    Wholesale Bidding Floor
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateTab("dealer")}
                    className="text-left hover:text-[#E5B869] transition-colors cursor-pointer"
                  >
                    Staff War Room &amp; Chat
                  </button>
                </li>
              </>
            )}
            <li>
              <Link href="/signup" className="hover:text-[#E5B869] transition-colors">
                Staff Join with Company PAN
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Transport Offices & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Kathmandu Hubs</h4>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Directly serving dealers across Teku, Kalanki, Balaju, Tinkune, Sallaghari &amp; Ekantakuna.
          </p>
          <div className="pt-2 text-[11px] text-neutral-500 space-y-1 font-mono">
            <div>Office: Teku Auto Corridor, Ward 12, Kathmandu</div>
            <div>Support: support@mulyankan.np • +977 01-5912384</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
        <div>
          &copy; {new Date().getFullYear()} Mulyankan Nepal Inc. All rights reserved. Registered under Nepal Companies Act.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-neutral-300 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-neutral-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/how-it-works" className="hover:text-neutral-300 transition-colors">
            Yatayat Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
}
