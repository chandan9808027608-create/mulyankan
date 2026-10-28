"use client";

import React from "react";

// Header used by the shop's sub-screens: back button, title, one-line help text.
export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 bg-[#0d0e12]/95 backdrop-blur border-b border-white/5">
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 shrink-0 rounded-xl bg-[#16171d] border border-white/10 text-white flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-white leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-neutral-500 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

// Two- or three-way switch used for tabs inside a screen.
export function SegmentedTabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { key: T; label: string }[] }) {
  return (
    <div className="grid p-1 rounded-xl bg-[#16171d] border border-white/10" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors truncate px-1 ${value === o.key ? "bg-[#E5B869] text-black" : "text-neutral-400"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold shadow-lg max-w-[90vw] text-center">
      {message}
    </div>
  );
}
