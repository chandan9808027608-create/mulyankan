"use client";

import { useSyncExternalStore } from "react";

// Likes and skips for this device, shared live between Home, Swipe and Me.
const LIKED_KEY = "mulyankan_liked_bikes";
const SKIPPED_KEY = "mulyankan_skipped_bikes";
const CHANGE_EVENT = "mulyankan-likes-changed";

export interface LikedEntry {
  at: string;
  offerNpr?: number;
}

interface LikesState {
  liked: Record<string, LikedEntry>;
  skipped: string[];
}

const EMPTY: LikesState = { liked: {}, skipped: [] };
let cache: LikesState | null = null;

function read(): LikesState {
  if (cache) return cache;
  try {
    cache = {
      liked: JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"),
      skipped: JSON.parse(localStorage.getItem(SKIPPED_KEY) || "[]"),
    };
  } catch {
    cache = { liked: {}, skipped: [] };
  }
  return cache;
}

function write(next: LikesState) {
  cache = next;
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(next.liked));
    localStorage.setItem(SKIPPED_KEY, JSON.stringify(next.skipped));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIKED_KEY || e.key === SKIPPED_KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLikedBikes() {
  const state = useSyncExternalStore(subscribe, read, () => EMPTY);

  const like = (id: string, offerNpr?: number) => {
    const cur = read();
    write({
      liked: { ...cur.liked, [id]: { at: cur.liked[id]?.at || new Date().toISOString(), offerNpr: offerNpr ?? cur.liked[id]?.offerNpr } },
      skipped: cur.skipped.filter((x) => x !== id),
    });
  };
  const unlike = (id: string) => {
    const cur = read();
    const liked = { ...cur.liked };
    delete liked[id];
    write({ ...cur, liked });
  };
  const toggleLike = (id: string) => (read().liked[id] ? unlike(id) : like(id));
  const skip = (id: string) => {
    const cur = read();
    if (!cur.skipped.includes(id)) write({ ...cur, skipped: [...cur.skipped, id] });
  };
  const unskip = (id: string) => {
    const cur = read();
    write({ ...cur, skipped: cur.skipped.filter((x) => x !== id) });
  };
  const clearSkipped = () => write({ ...read(), skipped: [] });

  return { liked: state.liked, skipped: state.skipped, like, unlike, toggleLike, skip, unskip, clearSkipped };
}

export const parseNpr = (label: string) => Number(String(label).replace(/[^0-9]/g, "")) || 0;
export const formatNpr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;
