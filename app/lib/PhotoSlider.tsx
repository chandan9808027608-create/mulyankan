"use client";

import React, { useRef, useState } from "react";

interface PhotoSliderProps {
  photos: { url: string; label: string }[];
  alt: string;
  /** Skip loading the images (used for feed items far off screen) */
  hidden?: boolean;
  /** Extra classes for the main photo, e.g. top padding under an overlay */
  imgClassName?: string;
  /** Called for a tap that was not a drag */
  onTap?: (e: React.PointerEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

// Photo gallery that slides with a finger or mouse drag, plus tap arrows and a counter.
// Vertical drags are left to the page so it still scrolls.
export function PhotoSlider({ photos, alt, hidden, imgClassName = "", onTap, children }: PhotoSliderProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  // The axis is decided after the first few pixels of movement
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null; active: boolean }>({ x: 0, y: 0, axis: null, active: false });

  const goToPhoto = (i: number) => setPhotoIndex(Math.max(0, Math.min(photos.length - 1, i)));

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, axis: null, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g.active || photos.length < 2) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        g.axis = "x";
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(dy) > 8) {
        g.axis = "y";
      }
    }
    if (g.axis === "x") {
      // Resist when pulling past the first or last photo
      const atEdge = (photoIndex === 0 && dx > 0) || (photoIndex === photos.length - 1 && dx < 0);
      setDragX(atEdge ? dx / 3 : dx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    if (g.axis === "x") {
      const threshold = Math.min(60, (e.currentTarget.clientWidth || 1) * 0.2);
      const dx = e.clientX - g.x;
      if (dx < -threshold) goToPhoto(photoIndex + 1);
      else if (dx > threshold) goToPhoto(photoIndex - 1);
      setDragX(0);
      return;
    }
    if (Math.hypot(e.clientX - g.x, e.clientY - g.y) <= 10) onTap?.(e);
  };

  const handlePointerCancel = () => {
    gesture.current.active = false;
    setDragX(0);
  };

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-xl bg-[#0d0e12]/60 backdrop-blur border border-white/10 text-white text-2xl leading-none flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none cursor-pointer";

  return (
    <div className="relative h-full w-full">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: "pan-y" }}
        className="absolute inset-0 overflow-hidden select-none"
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(calc(${-photoIndex * 100}% + ${dragX}px))`,
            transition: dragX !== 0 ? "none" : "transform 0.3s ease-out",
          }}
        >
          {photos.map((photo, i) => (
            <div key={photo.url + i} className="relative h-full w-full shrink-0 overflow-hidden">
              {!hidden && (
                <>
                  {/* Blurred fill so any photo ratio covers the area */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.label || alt}
                    draggable={false}
                    className={`relative w-full h-full object-contain select-none ${imgClassName}`}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => goToPhoto(photoIndex - 1)} disabled={photoIndex === 0} className={`${arrow} left-2`} aria-label="Previous photo">
            ‹
          </button>
          <button
            type="button"
            onClick={() => goToPhoto(photoIndex + 1)}
            disabled={photoIndex === photos.length - 1}
            className={`${arrow} right-2`}
            aria-label="Next photo"
          >
            ›
          </button>
          <div className="absolute bottom-2 inset-x-0 z-10 flex justify-center pointer-events-none">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0d0e12]/70 backdrop-blur">
              {photos.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-4 bg-[#E5B869]" : "w-1.5 bg-white/40"}`} />
              ))}
              <span className="ml-1 text-[10px] font-semibold text-white">
                {photoIndex + 1}/{photos.length}
              </span>
            </span>
          </div>
        </>
      )}

      {children}
    </div>
  );
}
