"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AppNavbarProps {
  activeTab?: "seller" | "dealer" | "seller_dashboard";
  onTabChange?: (tab: "seller" | "dealer" | "seller_dashboard") => void;
  onOpenDirectPost: () => void;
  isReconditionVerified?: boolean;
  selectedReconditionHub?: string;
  reconditionPan?: string;
  pendingStaffCount?: number;
  onLogoutRecondition?: () => void;
  postingsCount?: number;
  onBack?: () => void;
}

export const MulyankanBrandLogo = React.memo(function MulyankanBrandLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-8 h-8 rounded-full border-2 border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10 shadow-[0_0_12px_rgba(229,184,105,0.35)]">
        <svg className="w-4 h-4 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg sm:text-xl font-black tracking-wider text-white">
          MULYANKAN<span className="text-[#E5B869]">.NP</span>
        </span>
        <span className="text-[9px] text-neutral-400 font-mono tracking-widest hidden sm:inline">
          KATHMANDU TWO-WHEELER EXCHANGE
        </span>
      </div>
    </div>
  );
});

export default function AppNavbar({
  activeTab = "seller",
  onTabChange,
  onOpenDirectPost,
  isReconditionVerified = false,
  selectedReconditionHub = "Teku Moto Recondition Hub",
  reconditionPan = "601928472",
  pendingStaffCount = 0,
  onLogoutRecondition,
  postingsCount = 0,
  onBack,
}: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDealerMenuOpen, setIsDealerMenuOpen] = useState(false);

  // Close mobile drawer on route/tab change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, activeTab]);

  const handleNavClick = (tab: "seller" | "dealer" | "seller_dashboard", anchorId?: string) => {
    setIsMobileMenuOpen(false);

    // If currently on an inner route (like /how-it-works, /about, /condition-report), route to root with tab/anchor
    if (pathname !== "/") {
      if (pathname === "/how-it-works" && anchorId === "how-it-works") {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (pathname === "/about" && anchorId === "about") {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const targetUrl = anchorId
        ? `/?tab=${tab}#${anchorId}`
        : tab === "seller"
        ? "/"
        : `/?tab=${tab}`;
      router.push(targetUrl);
      return;
    }

    if (onTabChange) {
      onTabChange(tab);
    }
    if (anchorId && typeof window !== "undefined") {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          try {
            window.history.pushState({ tab, section: anchorId }, "", `/?tab=${tab}#${anchorId}`);
          } catch {}
        }
      }, 100);
    } else if (tab === "seller" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-[#121318]/95 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Undo/Back Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {(activeTab !== "seller" || !isHome) && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer shadow"
              title="Undo / Go back"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick("seller")}
            className="flex items-center text-left cursor-pointer"
          >
            <MulyankanBrandLogo />
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 p-1 rounded-full bg-black/40 border border-white/10 text-xs font-semibold">
          {/* Home */}
          <button
            type="button"
            onClick={() => handleNavClick("seller")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              isHome && activeTab === "seller"
                ? "bg-[#E5B869] text-black font-bold shadow-md"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Home
          </button>

          {/* Live Listings (Only visible to verified Recondition Showrooms and Staff) */}
          {isReconditionVerified && (
            <button
              type="button"
              onClick={() => handleNavClick("dealer", "auctions")}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                isHome && activeTab === "dealer"
                  ? "bg-[#E5B869] text-black font-bold shadow-md"
                  : "text-[#E5B869] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Listings</span>
            </button>
          )}

          {/* Valuation Engine */}
          <button
            type="button"
            onClick={() => handleNavClick("seller", "find-value")}
            className="px-3.5 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Valuation
          </button>

          {/* How It Works */}
          <button
            type="button"
            onClick={() => handleNavClick("seller", "how-it-works")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              pathname === "/how-it-works"
                ? "bg-[#E5B869] text-black font-bold shadow-md"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            How It Works
          </button>

          {/* About Us */}
          <button
            type="button"
            onClick={() => handleNavClick("seller", "about")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              pathname === "/about"
                ? "bg-[#E5B869] text-black font-bold shadow-md"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            About Us
          </button>

          {/* My Postings */}
          <button
            type="button"
            onClick={() => handleNavClick("seller_dashboard")}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              isHome && activeTab === "seller_dashboard"
                ? "bg-[#E5B869] text-black font-bold shadow-md"
                : "text-neutral-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>My Postings</span>
            {postingsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-black text-[10px] font-black flex items-center justify-center">
                {postingsCount}
              </span>
            )}
          </button>

          {/* Recondition Hub */}
          <button
            type="button"
            onClick={() => handleNavClick("dealer")}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              isHome && activeTab === "dealer"
                ? "bg-[#E5B869] text-black font-bold shadow-md"
                : "text-neutral-300 hover:text-[#E5B869] hover:bg-white/5"
            }`}
          >
            <span>Showroom Hub</span>
            {isReconditionVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Post Bike (No Sign-up) Button */}
          <button
            type="button"
            onClick={onOpenDirectPost}
            className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-extrabold text-xs hover:brightness-110 shadow-[0_0_15px_rgba(229,184,105,0.3)] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 4v16m8-8H4" />
            </svg>
            <span>Post Bike</span>
            <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-black uppercase hidden sm:inline">
              Free
            </span>
          </button>

          {/* Showroom Status / Login Dropdown */}
          {isReconditionVerified ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDealerMenuOpen(!isDealerMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[120px] truncate hidden md:inline">{selectedReconditionHub}</span>
                <span className="md:hidden">Hub</span>
                {pendingStaffCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                    {pendingStaffCount}
                  </span>
                )}
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDealerMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#181a24] border border-white/10 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsDealerMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 text-[11px]">
                    <div className="font-bold text-white truncate">{selectedReconditionHub}</div>
                    <div className="text-neutral-400 font-mono text-[10px]">PAN: {reconditionPan}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDealerMenuOpen(false);
                      handleNavClick("dealer");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    Open Hub Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDealerMenuOpen(false);
                      handleNavClick("seller_dashboard");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    My Postings
                  </button>
                  {onLogoutRecondition && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDealerMenuOpen(false);
                        onLogoutRecondition();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 cursor-pointer"
                    >
                      Exit Workshop Mode
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 sm:px-4 py-2 rounded-full border border-white/20 hover:border-[#E5B869] hover:bg-white/5 transition-all text-neutral-300 hover:text-white cursor-pointer shrink-0"
            >
              Log In
            </Link>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#121318] px-4 py-5 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick("seller")}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                activeTab === "seller" ? "bg-[#E5B869] text-black" : "bg-white/5 text-neutral-200"
              }`}
            >
              Home
            </button>
            {isReconditionVerified && (
              <button
                type="button"
                onClick={() => handleNavClick("dealer", "auctions")}
                className="p-3 rounded-xl text-left text-xs font-bold bg-[#E5B869]/15 text-[#E5B869] border border-[#E5B869]/30 hover:bg-[#E5B869]/25 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Live Listings</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNavClick("seller", "find-value")}
              className="p-3 rounded-xl text-left text-xs font-bold bg-white/5 text-neutral-200 hover:bg-white/10 cursor-pointer"
            >
              Find Value
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("seller", "how-it-works")}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                pathname === "/how-it-works" ? "bg-[#E5B869] text-black" : "bg-white/5 text-neutral-200"
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("seller", "about")}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                pathname === "/about" ? "bg-[#E5B869] text-black" : "bg-white/5 text-neutral-200"
              }`}
            >
              About Us
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick("seller_dashboard")}
              className="w-full p-3 rounded-xl text-left text-xs font-bold bg-white/5 text-neutral-200 flex items-center justify-between cursor-pointer"
            >
              <span>My Postings</span>
              {postingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-black text-[10px] font-black flex items-center justify-center">
                  {postingsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("dealer")}
              className="w-full p-3 rounded-xl text-left text-xs font-bold bg-[#E5B869]/10 border border-[#E5B869]/30 text-[#E5B869] flex items-center justify-between cursor-pointer"
            >
              <span>Recondition Showroom Hub</span>
              {isReconditionVerified && (
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              )}
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDirectPost();
              }}
              className="flex-1 py-3 rounded-xl bg-[#E5B869] text-black font-extrabold text-xs uppercase tracking-wider text-center cursor-pointer"
            >
              + Post Bike (Free)
            </button>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-xs text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
