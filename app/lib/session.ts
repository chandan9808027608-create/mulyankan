// Remembers a showroom owner / staff login on this device so the app opens
// straight into their workspace (the vehicle feed) instead of the seller homepage.
import { getRegisteredCompanies, getStaffApplications } from "./companyStaffData";

const SESSION_KEY = "mulyankan_session";

export interface WorkshopSession {
  role: "recondition" | "staff";
  showroomName: string;
  panNumber: string;
  userName?: string;
  /** Contact number from the shop or staff record */
  phone?: string;
}

export function getSession(): WorkshopSession | null {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (s && (s.role === "recondition" || s.role === "staff") && s.panNumber) return s;
  } catch {}
  return null;
}

export function saveSession(session: WorkshopSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

/**
 * Name and phone of whoever is logged in, so forms and chats don't ask again.
 * Older sessions saved before `phone` existed fall back to the shop / staff records.
 */
export function getLoggedInContact(): { name: string; phone: string } | null {
  const s = getSession();
  if (!s) return null;
  let phone = s.phone || "";
  if (!phone) {
    try {
      const staff = getStaffApplications().find((a) => a.companyPan === s.panNumber && a.applicantName === s.userName);
      phone = staff?.phone || getRegisteredCompanies().find((c) => c.panNumber === s.panNumber)?.phone || "";
    } catch {}
  }
  return { name: s.userName || s.showroomName, phone };
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
