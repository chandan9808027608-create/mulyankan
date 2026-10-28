import { promises as fs } from "fs";
import path from "path";
import { EventEmitter } from "events";
import type { BidRecord, DirectMessage } from "./dealerBidsData";

// Server-only store. Starts empty; everything in it comes from real user activity
// (postings, bids, messages, staff chat). On Vercel it lives in Upstash Redis
// (set up from the Vercel dashboard); without those env vars it is a local JSON file.
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

// ---------- Upstash Redis (REST) ----------
// Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const usesRedis = !!(REDIS_URL && REDIS_TOKEN);

const STORE_KEY = "mulyankan:store";
const VERSION_KEY = "mulyankan:version";
/** Hash of topic -> change counter; /api/stream polls it to push live updates across servers */
export const CHANGES_KEY = "mulyankan:changes";

export async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) throw new Error(`Redis ${command[0]} failed: ${json?.error || res.status}`);
  return json.result as T;
}

// Write only if nobody else wrote since we read (compare version), then bump the
// version and the changed topic's counter.
const SAVE_IF_UNCHANGED = `
if (redis.call('GET', KEYS[2]) or '0') ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('INCR', KEYS[2])
redis.call('HINCRBY', KEYS[3], ARGV[3], 1)
return 1`;

// ---------- Shared ----------
const EMPTY = (): Store => ({ postings: [], bids: [], messages: [], staffMessages: [] });

function parseStore(raw: string | null | undefined): Store {
  try {
    const parsed = JSON.parse(raw || "{}");
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
  if (usesRedis) return redis<string | null>(["GET", STORE_KEY]).then(parseStore);
  return tail().then(load, load);
}

// `topic` names what changed so clients only refetch what they need.
export async function mutateStore<T>(topic: keyof Store, fn: (store: Store) => T | Promise<T>): Promise<T> {
  if (usesRedis) {
    // Optimistic retry: another server may write between our read and our save
    for (let attempt = 0; attempt < 8; attempt++) {
      const [raw, version] = await redis<[string | null, string | null]>(["MGET", STORE_KEY, VERSION_KEY]);
      const store = parseStore(raw);
      const result = await fn(store);
      const saved = await redis<number>(["EVAL", SAVE_IF_UNCHANGED, 3, STORE_KEY, VERSION_KEY, CHANGES_KEY, version || "0", JSON.stringify(store), topic]);
      if (saved === 1) {
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
