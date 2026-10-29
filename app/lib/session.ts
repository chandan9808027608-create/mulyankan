// Remembers who is logged in on this device: a showroom owner / staff member (opens
// straight into their workspace) or a seller (their name and phone fill the Sell form).
import { useSyncExternalStore } from "react";
import { getRegisteredCompanies, getStaffApplications } from "./companyStaffData";

const SESSION_KEY = "mulyankan_session";
const SELLER_KEY = "mulyankan_seller";
const SELLER_ACCOUNTS_KEY = "mulyankan_seller_accounts";

export interface WorkshopSession {
  role: "recondition" | "staff";
  showroomName: string;
  panNumber: string;
  userName?: string;
  /** Contact number from the shop or staff record */
  phone?: string;
}

export interface SellerAccount {
  name: string;
  phone: string;
  email: string;
  location?: string;
}

// Matches the "Seller" demo button on the login page
const DEMO_SELLERS: SellerAccount[] = [
  { name: "Prashant Shrestha", phone: "+977 9841892341", email: "prashant.seller@gmail.com", location: "New Baneshwor, Kathmandu" },
];

export function getSession(): WorkshopSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (s && (s.role === "recondition" || s.role === "staff") && s.panNumber) return s;
  } catch {}
  return null;
}

/** Logging in as a shop signs the seller out on this device, and vice versa. */
export function saveSession(session: WorkshopSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem(SELLER_KEY);
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ---------- Sellers ----------

export function getSellerAccounts(): SellerAccount[] {
  try {
    const saved: SellerAccount[] = JSON.parse(localStorage.getItem(SELLER_ACCOUNTS_KEY) || "[]");
    return [...saved, ...DEMO_SELLERS.filter((d) => !saved.some((s) => s.email === d.email))];
  } catch {
    return DEMO_SELLERS;
  }
}

/** Saves (or updates, by email) a seller account created on the sign-up page. */
export function addSellerAccount(account: SellerAccount) {
  try {
    const saved: SellerAccount[] = JSON.parse(localStorage.getItem(SELLER_ACCOUNTS_KEY) || "[]");
    const others = saved.filter((s) => s.email.toLowerCase() !== account.email.toLowerCase());
    localStorage.setItem(SELLER_ACCOUNTS_KEY, JSON.stringify([account, ...others]));
  } catch {}
}

/** Finds a seller by email, phone number or name (what people type in the login box). */
export function findSellerAccount(who: string): SellerAccount | undefined {
  const q = who.trim().toLowerCase();
  if (!q) return undefined;
  const digits = q.replace(/\D/g, "");
  return getSellerAccounts().find(
    (s) =>
      s.email.toLowerCase() === q ||
      (digits.length >= 7 && s.phone.replace(/\D/g, "").endsWith(digits.slice(-10))) ||
      s.name.toLowerCase() === q
  );
}

export function getSellerProfile(): SellerAccount | null {
  try {
    const s = JSON.parse(localStorage.getItem(SELLER_KEY) || "null");
    if (s && s.name && s.phone) return s;
  } catch {}
  return null;
}

export function saveSellerProfile(account: SellerAccount) {
  try {
    localStorage.setItem(SELLER_KEY, JSON.stringify(account));
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function clearSellerProfile() {
  try {
    localStorage.removeItem(SELLER_KEY);
  } catch {}
}

/**
 * Name and phone of whoever is logged in (shop or seller), so forms and chats don't ask again.
 * Older shop sessions saved before `phone` existed fall back to the shop / staff records.
 */
export function getLoggedInContact(): { name: string; phone: string } | null {
  const s = getSession();
  if (!s) {
    const seller = getSellerProfile();
    return seller ? { name: seller.name, phone: seller.phone } : null;
  }
  let phone = s.phone || "";
  if (!phone) {
    try {
      const staff = getStaffApplications().find((a) => a.companyPan === s.panNumber && a.applicantName === s.userName);
      phone = staff?.phone || getRegisteredCompanies().find((c) => c.panNumber === s.panNumber)?.phone || "";
    } catch {}
  }
  return { name: s.userName || s.showroomName, phone };
}

// Hook form for pages that are pre-rendered on the server (no login there).
// The snapshot is a string so React sees a stable value between renders.
const contactSnapshot = () => JSON.stringify(getLoggedInContact());
const noContact = () => "null";
const subscribeStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

export function useLoggedInContact(): { name: string; phone: string } | null {
  return JSON.parse(useSyncExternalStore(subscribeStorage, contactSnapshot, noContact));
}
