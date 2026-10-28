// Remembers a showroom owner / staff login on this device so the app opens
// straight into their workspace (the vehicle feed) instead of the seller homepage.
const SESSION_KEY = "mulyankan_session";

export interface WorkshopSession {
  role: "recondition" | "staff";
  showroomName: string;
  panNumber: string;
  userName?: string;
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

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
