import { promises as fs } from "fs";
import path from "path";
import { EventEmitter } from "events";
import type { BidRecord, DirectMessage } from "./dealerBidsData";

// Server-only store. Starts empty; everything in it comes from real user activity
// (postings, bids, messages, staff chat). On Vercel it lives in Supabase (one row in
// mulyankan_store, see supabase/setup.sql); without the Supabase env vars it is a local JSON file.
export interface StoredPosting {
  id: string;
  name: string;
  highestBid: string;
  bidCount?: number;
  createdAt: string;
  [key: string]: unknown;
}

export interface StaffChatRecord {
  id: string;
  panNumber: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  content: string;
  bikeRef?: {
    id: string;
    name: string;
    lotNumber: string;
    currentBid: string;
    imageUrl: string;
  };
  proposedOfferNpr?: number;
  isOfferCard?: boolean;
}

export interface Store {
  postings: StoredPosting[];
  bids: BidRecord[];
  messages: DirectMessage[];
  staffMessages: StaffChatRecord[];
}

export const DATA_DIR = path.join(process.cwd(), ".data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DATA_FILE = path.join(DATA_DIR, "marketplace.json");

// One emitter and one write queue per server process (kept on globalThis so every
// route module and dev hot-reload shares them). /api/stream listens and pushes
// changes to browsers.
const g = globalThis as unknown as { __mulyankanEvents?: EventEmitter; __mulyankanQueue?: Promise<unknown> };
export const storeEvents = g.__mulyankanEvents ?? (g.__mulyankanEvents = new EventEmitter());
storeEvents.setMaxListeners(0);

// ---------- Supabase (PostgREST) ----------
// The Vercel Supabase integration sets NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
// The key is server-only: it bypasses row level security, so it must never reach the browser.
// Vercel's "connect store" screen may add a prefix (e.g. STORAGE_SUPABASE_URL), so match by suffix.
const envEndingWith = (...suffixes: string[]) => {
  for (const suffix of suffixes) {
    const exact = process.env[suffix];
    if (exact) return exact;
    const key = Object.keys(process.env).find((k) => k.endsWith(`_${suffix}`) && process.env[k]);
    if (key) return process.env[key]!;
  }
  return "";
};
export const SUPABASE_URL = envEndingWith("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const SUPABASE_KEY = envEndingWith("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
/** Names (never values) of Supabase-related env vars, for /api/health */
export const supabaseEnvNames = () => Object.keys(process.env).filter((k) => k.includes("SUPABASE")).sort();
export const usesSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

/** Auth headers for Supabase. Legacy service_role keys are JWTs; new sb_secret_ keys go in apikey only. */
export function supabaseHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY, ...extra };
  if (SUPABASE_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  return headers;
}

export async function supabaseRest<T = unknown>(pathAndQuery: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    method: init.method || "GET",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Supabase ${pathAndQuery.split("?")[0]} failed: ${json?.message || res.status}`);
  return json as T;
}

async function loadRow(): Promise<{ store: Store; version: number }> {
  const rows = await supabaseRest<{ data: unknown; version: number }[]>("mulyankan_store?id=eq.1&select=data,version");
  if (!rows[0]) throw new Error("Supabase table mulyankan_store is empty. Run supabase/setup.sql.");
  return { store: parseStore(rows[0].data), version: Number(rows[0].version) };
}

// ---------- Shared ----------
const EMPTY = (): Store => ({ postings: [], bids: [], messages: [], staffMessages: [] });

function parseStore(raw: unknown): Store {
  try {
    const parsed = (typeof raw === "string" ? JSON.parse(raw || "{}") : raw) || {};
    return {
      postings: Array.isArray(parsed.postings) ? parsed.postings : [],
      bids: Array.isArray(parsed.bids) ? parsed.bids : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      staffMessages: Array.isArray(parsed.staffMessages) ? parsed.staffMessages : [],
    };
  } catch {
    return EMPTY();
  }
}

async function load(): Promise<Store> {
  try {
    return parseStore(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return EMPTY();
  }
}

async function save(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

// Serialise read-modify-write cycles so concurrent requests don't clobber each other.
const tail = () => g.__mulyankanQueue ?? Promise.resolve();

export function readStore(): Promise<Store> {
  if (usesSupabase) return loadRow().then((r) => r.store);
  return tail().then(load, load);
}

// `topic` names what changed so clients only refetch what they need.
export async function mutateStore<T>(topic: keyof Store, fn: (store: Store) => T | Promise<T>): Promise<T> {
  if (usesSupabase) {
    // Optimistic retry: another server may write between our read and our save.
    // mulyankan_save only writes if the version is unchanged, and bumps the topic's counter.
    for (let attempt = 0; attempt < 8; attempt++) {
      const { store, version } = await loadRow();
      const result = await fn(store);
      const saved = await supabaseRest<boolean>("rpc/mulyankan_save", {
        method: "POST",
        body: { expected: version, new_data: store, changed_topic: topic },
      });
      if (saved === true) {
        storeEvents.emit("change", topic);
        return result;
      }
      await new Promise((r) => setTimeout(r, 25 + Math.random() * 75));
    }
    throw new Error("The server is busy. Please try again.");
  }

  const run = async () => {
    const store = await load();
    const result = await fn(store);
    await save(store);
    storeEvents.emit("change", topic);
    return result;
  };
  const next = tail().then(run, run);
  g.__mulyankanQueue = next.catch(() => undefined);
  return next;
}

export const formatNpr = (amount: number) => `NPR ${amount.toLocaleString("en-IN")}`;
