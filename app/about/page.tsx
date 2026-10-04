"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "../lib/AppNavbar";
import AppFooter from "../lib/AppFooter";
import AboutUsSection from "../lib/AboutUsSection";
import { DirectPostBikeModal, DirectPostData } from "../lib/DirectPostBikeModal";

export default function AboutPage() {
  const router = useRouter();
  const [showDirectPostModal, setShowDirectPostModal] = useState(false);
  const [directPostToast, setDirectPostToast] = useState<string | null>(null);

  const handleDirectPostSubmit = (data: DirectPostData) => {
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("mulyankan_user_postings") || "[]");
        localStorage.setItem("mulyankan_user_postings", JSON.stringify([data, ...existing]));
      } catch {}
    }
    setDirectPostToast(`Direct Listing for ${data.name} is now live!`);
    setTimeout(() => setDirectPostToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col justify-between selection:bg-[#E5B869] selection:text-black font-sans">
      {/* Toast Notification */}
      {directPostToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#181a24] border border-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-lg animate-in fade-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold tracking-wide">{directPostToast}</p>
        </div>
      )}

      {/* Navigation Header */}
      <AppNavbar
        activeTab="seller"
        onOpenDirectPost={() => setShowDirectPostModal(true)}
        onBack={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        <AboutUsSection />
      </main>

      {/* Direct Post Modal */}
      {showDirectPostModal && (
        <DirectPostBikeModal
          isOpen={showDirectPostModal}
          onClose={() => setShowDirectPostModal(false)}
          onSubmit={handleDirectPostSubmit}
        />
      )}

      {/* Footer */}
      <AppFooter
        onOpenDirectPost={() => setShowDirectPostModal(true)}
        onNavigateTab={(tab) => {
          router.push(tab === "seller" ? "/" : `/?tab=${tab}`);
        }}
      />
    </div>
  );
}
