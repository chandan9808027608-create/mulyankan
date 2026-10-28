"use client";

import React from "react";

export interface DealerTab {
  key: string;
  label: string;
  /** SVG path(s) for a 24x24 outline icon */
  icon: string;
  isActive?: boolean;
  badge?: number;
  /** Draw as the round gold button in the middle */
  center?: boolean;
  onClick: () => void;
}

// Bottom tab bar: icon + label per section, the active one sits in a gold pill.
export const DealerTabBar = React.memo(function DealerTabBar({ tabs }: { tabs: DealerTab[] }) {
  return (
    <nav
      aria-label="Workshop sections"
      className="shrink-0 z-40 border-t border-white/10 bg-[#111217] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-lg flex items-end justify-between px-2 pt-1.5 pb-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={tab.onClick}
            title={tab.label}
            aria-label={tab.label}
            aria-current={tab.isActive ? "page" : undefined}
            className={`relative flex-1 min-w-0 flex flex-col items-center justify-end gap-1 cursor-pointer transition-colors ${
              tab.isActive ? "text-[#E5B869]" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {tab.center ? (
              <span
                className={`-mt-6 w-14 h-14 rounded-full border-4 border-[#111217] flex items-center justify-center shadow-lg shadow-black/40 transition-colors ${
                  tab.isActive ? "bg-[#E5B869] text-black" : "bg-[#E5B869]/90 text-black"
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
              </span>
            ) : (
              <span className={`relative px-4 py-1 rounded-full transition-colors ${tab.isActive ? "bg-[#E5B869]/15" : ""}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={tab.isActive ? 2.2 : 1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {!!tab.badge && (
                  <span className="absolute -top-1 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[17px] text-center">
                    {tab.badge}
                  </span>
                )}
              </span>
            )}
            <span className={`text-[11px] leading-none truncate max-w-full ${tab.isActive ? "font-bold" : "font-medium"}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
});

export const TAB_ICONS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  bikes: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  // Two stacked cards
  swipe: "M8 4h10a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM4 7v11a3 3 0 003 3",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  shop: "M3 9l1.5-5h15L21 9M3 9h18M3 9a3 3 0 006 0m-6 0v11h18V9m-12 0a3 3 0 006 0m0 0a3 3 0 006 0M9 20v-5h6v5",
  plus: "M12 4v16m8-8H4",
  more: "M4 6h16M4 12h16M4 18h16",
};
