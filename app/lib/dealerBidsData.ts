export interface BidRecord {
  id: string;
  bikeId: string;
  dealerName: string;
  dealerLocation: string;
  amountNpr: number;
  timestamp: string;
  status: "active" | "accepted" | "outbid" | "inspecting";
  verifiedDealer: boolean;
}

export interface DirectMessage {
  id: string;
  bikeId: string;
  sender: "dealer" | "seller";
  senderName: string;
  message: string;
  timestamp: string;
}

// Render an ISO timestamp as a relative "time ago" label.
export function timeAgo(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
