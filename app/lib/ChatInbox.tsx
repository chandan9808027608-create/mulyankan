"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DirectMessage } from "./dealerBidsData";
import type { ReelVehicle } from "./VehicleReelsFeed";
import { useLiveUpdates } from "./useLiveUpdates";
import { formatNpr } from "./likedBikes";

type ChatVehicle = ReelVehicle & { sellerName?: string };

interface BikeRef {
  id: string;
  name: string;
  lotNumber: string;
  currentBid: string;
  imageUrl: string;
}

interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  content: string;
  bikeRef?: BikeRef;
  proposedOfferNpr?: number;
  isOfferCard?: boolean;
}

interface ChatInboxProps {
  showroomName: string;
  panNumber: string;
  vehicles: ChatVehicle[];
  sellerMessages: DirectMessage[];
  onSendSellerMessage: (bikeId: string, text: string) => Promise<boolean>;
  onSendOffer: (bikeId: string, amountNpr: number) => Promise<boolean>;
  onOpenBike: (bikeId: string) => void;
  /** A bike someone tapped "Share" on: opens the team chat with it attached */
  shareBikeId?: string | null;
  onShareHandled?: () => void;
}

// Staff chat has no accounts yet: each device gets a stable id and the name
// the person enters the first time they post.
const IDENTITY_KEY = "mulyankan_staff_identity";
const READ_KEY = "mulyankan_chat_read";
const AVATAR_COLORS = ["bg-[#E5B869] text-black", "bg-blue-600 text-white", "bg-emerald-600 text-white", "bg-amber-600 text-white", "bg-cyan-600 text-white", "bg-fuchsia-600 text-white"];

function loadIdentity(): { id: string; name: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(IDENTITY_KEY) || "null");
    if (saved?.id) return saved;
  } catch {}
  const fresh = { id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, name: "" };
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

const colorFor = (key: string) => {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const shortTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" });
};

function readMarks(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "{}");
  } catch {
    return {};
  }
}

export const ChatInbox = React.memo(function ChatInbox({
  showroomName,
  panNumber,
  vehicles,
  sellerMessages,
  onSendSellerMessage,
  onSendOffer,
  onOpenBike,
  shareBikeId,
  onShareHandled,
}: ChatInboxProps) {
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  // Only rendered in the browser (after login), so localStorage is safe to read here
  const [identity, setIdentity] = useState(loadIdentity);
  const [readMarksState, setReadMarksState] = useState(readMarks);
  // Opening via "Share" starts in the team chat with that bike attached
  const [openThread, setOpenThread] = useState<string | null>(shareBikeId ? "team" : null); // "team" | bike id
  const [attachedBikeId, setAttachedBikeId] = useState<string | null>(shareBikeId ?? null);

  const loadTeam = useCallback(async () => {
    if (!panNumber) return;
    try {
      const res = await fetch(`/api/staff-chat?pan=${encodeURIComponent(panNumber)}`, { cache: "no-store" });
      const json = await res.json();
      if (Array.isArray(json?.data)) setTeamMessages(json.data);
    } catch {}
  }, [panNumber]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  useLiveUpdates((topic) => {
    if (topic === "staffMessages" || topic === "*") loadTeam();
  });

  // The shared bike was picked up by the initial state above; tell the parent
  useEffect(() => {
    if (shareBikeId) onShareHandled?.();
  }, [shareBikeId, onShareHandled]);

  // Seller conversations: one per bike, only the seller and our own shop's messages
  const sellerThreads = useMemo(() => {
    const byBike = new Map<string, DirectMessage[]>();
    for (const m of sellerMessages) {
      if (m.sender === "dealer" && m.senderName !== showroomName) continue;
      byBike.set(m.bikeId, [...(byBike.get(m.bikeId) || []), m]);
    }
    return [...byBike.entries()]
      .map(([bikeId, msgs]) => ({ bikeId, msgs, last: msgs[msgs.length - 1], vehicle: vehicles.find((v) => v.id === bikeId) }))
      .sort((a, b) => Date.parse(b.last.timestamp) - Date.parse(a.last.timestamp));
  }, [sellerMessages, showroomName, vehicles]);

  // Keep the open thread marked as read (in storage) as new messages arrive
  useEffect(() => {
    if (!openThread) return;
    try {
      localStorage.setItem(READ_KEY, JSON.stringify({ ...readMarks(), [openThread]: new Date().toISOString() }));
    } catch {}
  }, [openThread, teamMessages, sellerMessages]);

  const closeThread = () => {
    setOpenThread(null);
    setReadMarksState(readMarks());
  };

  const isUnread = (key: string, lastIso?: string, lastIsMine?: boolean) =>
    !!lastIso && !lastIsMine && (!readMarksState[key] || Date.parse(lastIso) > Date.parse(readMarksState[key]));

  const ensureName = (): { id: string; name: string } | null => {
    if (identity.name) return identity;
    const entered = window.prompt("Your name (your team will see it):", "")?.trim();
    if (!entered) return null;
    const me = { ...identity, name: entered };
    setIdentity(me);
    try {
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(me));
    } catch {}
    return me;
  };

  const sendTeam = async (text: string, offerNpr?: number) => {
    const me = ensureName();
    if (!me) return false;
    const bike = vehicles.find((v) => v.id === attachedBikeId);
    const res = await fetch("/api/staff-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        panNumber,
        senderId: me.id,
        senderName: me.name,
        content: text || (offerNpr ? `Price idea for ${bike?.name || "this bike"}` : bike ? `Look at this bike` : ""),
        bikeRef: bike ? { id: bike.id, name: bike.name, lotNumber: bike.lotNumber, currentBid: bike.highestBid, imageUrl: bike.imageUrl } : undefined,
        isOfferCard: !!(offerNpr && bike),
        proposedOfferNpr: offerNpr,
      }),
    }).catch(() => null);
    if (!res?.ok) return false;
    setAttachedBikeId(null);
    loadTeam();
    return true;
  };

  // ---------- Conversation screen ----------
  if (openThread) {
    const isTeam = openThread === "team";
    const thread = sellerThreads.find((t) => t.bikeId === openThread);
    const vehicle = isTeam ? undefined : thread?.vehicle || vehicles.find((v) => v.id === openThread);
    const title = isTeam ? `${showroomName} team` : vehicle?.sellerName || "Seller";
    const subtitle = isTeam ? "Only your team sees this" : vehicle?.name || "";

    return (
      <div className="h-full flex flex-col bg-[#0d0e12]">
        <div className="shrink-0 flex items-center gap-3 px-2 py-2 border-b border-white/10">
          <button type="button" onClick={closeThread} className="w-10 h-10 flex items-center justify-center text-white cursor-pointer" aria-label="Back">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {isTeam ? (
            <TeamAvatar />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vehicle?.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover bg-neutral-800" />
          )}
          <button type="button" onClick={() => vehicle && onOpenBike(vehicle.id)} className="min-w-0 text-left cursor-pointer" disabled={!vehicle}>
            <p className="text-sm font-bold text-white truncate">{title}</p>
            <p className="text-[11px] text-neutral-400 truncate">{subtitle}</p>
          </button>
        </div>

        {isTeam ? (
          <Conversation
            items={teamMessages.map((m) => ({
              id: m.id,
              mine: m.senderId === identity.id,
              name: m.senderName,
              colorKey: m.senderId,
              text: m.content,
              time: m.timestamp,
              bikeRef: m.bikeRef,
              offerNpr: m.isOfferCard ? m.proposedOfferNpr : undefined,
            }))}
            emptyText="No messages yet. Say hi to your team! 👋"
            onOpenBike={onOpenBike}
            onSendOffer={onSendOffer}
          />
        ) : (
          <Conversation
            items={(thread?.msgs || []).map((m) => ({
              id: m.id,
              mine: m.sender === "dealer",
              name: m.senderName,
              colorKey: m.senderName,
              text: m.message,
              time: m.timestamp,
            }))}
            emptyText="Say hello to the seller 👋"
            onOpenBike={onOpenBike}
            onSendOffer={onSendOffer}
          />
        )}

        <Composer
          vehicles={vehicles}
          allowBike={isTeam}
          attachedBike={isTeam ? vehicles.find((v) => v.id === attachedBikeId) : undefined}
          onAttach={setAttachedBikeId}
          onSend={(text, offer) => (isTeam ? sendTeam(text, offer) : onSendSellerMessage(openThread, text))}
        />
      </div>
    );
  }

  // ---------- Inbox list ----------
  const lastTeam = teamMessages[teamMessages.length - 1];
  return (
    <div className="h-full overflow-y-auto bg-[#0d0e12]">
      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-black text-white">Messages</h1>
          <p className="text-xs text-neutral-500">Talk to your team and to sellers</p>
        </div>

        <p className="px-4 pt-2 pb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">Your team</p>
        <ThreadRow
          avatar={<TeamAvatar />}
          title={`${showroomName} team`}
          preview={lastTeam ? `${lastTeam.senderId === identity.id ? "You" : lastTeam.senderName}: ${lastTeam.content}` : "Talk to your team"}
          time={lastTeam ? shortTime(lastTeam.timestamp) : ""}
          unread={isUnread("team", lastTeam?.timestamp, lastTeam?.senderId === identity.id)}
          onClick={() => setOpenThread("team")}
        />

        <p className="px-4 pt-5 pb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">Sellers</p>
        {sellerThreads.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">No seller chats yet. Open a bike and send the seller a message.</p>
        ) : (
          sellerThreads.map((t) => (
            <ThreadRow
              key={t.bikeId}
              avatar={
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.vehicle?.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-neutral-800" />
              }
              title={t.vehicle?.sellerName || "Seller"}
              preview={`${t.last.sender === "dealer" ? "You" : t.last.senderName}: ${t.last.message}`}
              sub={t.vehicle?.name}
              time={shortTime(t.last.timestamp)}
              unread={isUnread(t.bikeId, t.last.timestamp, t.last.sender === "dealer")}
              onClick={() => setOpenThread(t.bikeId)}
            />
          ))
        )}
      </div>
    </div>
  );
});

function TeamAvatar() {
  return (
    <span className="w-12 h-12 shrink-0 rounded-xl bg-[#E5B869] flex items-center justify-center text-black">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </span>
  );
}

function ThreadRow({
  avatar,
  title,
  preview,
  sub,
  time,
  unread,
  onClick,
}: {
  avatar: React.ReactNode;
  title: string;
  preview: string;
  sub?: string;
  time: string;
  unread: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[calc(100%-1.5rem)] mx-3 mb-2 flex items-center gap-3 p-3 rounded-2xl bg-[#16171d] border border-white/10 hover:border-white/20 text-left cursor-pointer"
    >
      {avatar}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{title}</p>
        {sub && <p className="text-[11px] text-neutral-500 truncate">{sub}</p>}
        <p className={`text-xs truncate ${unread ? "text-white font-semibold" : "text-neutral-400"}`}>{preview}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-[11px] text-neutral-500">{time}</span>
        {unread && <span className="px-1.5 py-0.5 rounded-md bg-[#E5B869] text-black text-[9px] font-black uppercase">New</span>}
      </div>
    </button>
  );
}

interface ConversationItem {
  id: string;
  mine: boolean;
  name: string;
  colorKey: string;
  text: string;
  time: string;
  bikeRef?: BikeRef;
  offerNpr?: number;
}

function Conversation({
  items,
  emptyText,
  onOpenBike,
  onSendOffer,
}: {
  items: ConversationItem[];
  emptyText: string;
  onOpenBike: (bikeId: string) => void;
  onSendOffer: (bikeId: string, amountNpr: number) => Promise<boolean>;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const [sentOffers, setSentOffers] = useState<Record<string, boolean>>({});
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3 max-w-2xl w-full mx-auto">
      {items.length === 0 && <p className="text-center text-sm text-neutral-500 pt-16">{emptyText}</p>}
      {items.map((m) => (
        <div key={m.id} className={`flex items-end gap-2 ${m.mine ? "justify-end" : "justify-start"}`}>
          {!m.mine && (
            <span className={`w-7 h-7 shrink-0 rounded-full ${colorFor(m.colorKey)} text-[10px] font-bold flex items-center justify-center`}>
              {initialsOf(m.name)}
            </span>
          )}
          <div className={`max-w-[78%] space-y-1 ${m.mine ? "items-end" : "items-start"} flex flex-col`}>
            {!m.mine && <span className="text-[10px] text-neutral-500 px-1">{m.name}</span>}
            {m.bikeRef && (
              <button
                type="button"
                onClick={() => onOpenBike(m.bikeRef!.id)}
                className="w-56 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 text-left cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.bikeRef.imageUrl} alt="" className="w-full h-32 object-cover" />
                <div className="p-2.5">
                  <p className="text-xs font-bold text-white truncate">{m.bikeRef.name}</p>
                  <p className="text-[11px] text-[#E5B869] font-semibold">{m.bikeRef.currentBid}</p>
                </div>
              </button>
            )}
            {m.offerNpr && m.bikeRef && (
              <div className="w-56 rounded-2xl bg-[#E5B869]/10 border border-[#E5B869]/40 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#E5B869]">Price idea</p>
                <p className="text-lg font-black text-white">{formatNpr(m.offerNpr)}</p>
                <button
                  type="button"
                  disabled={sentOffers[m.id]}
                  onClick={async () => {
                    if (await onSendOffer(m.bikeRef!.id, m.offerNpr!)) setSentOffers((s) => ({ ...s, [m.id]: true }));
                  }}
                  className="w-full h-9 rounded-lg bg-[#E5B869] text-black text-xs font-bold cursor-pointer disabled:bg-emerald-600 disabled:text-white"
                >
                  {sentOffers[m.id] ? "✓ Offer sent" : "Send this offer"}
                </button>
              </div>
            )}
            {m.text && (
              <p className={`px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${m.mine ? "bg-[#E5B869] text-black rounded-br-md" : "bg-white/10 text-white rounded-bl-md"}`}>
                {m.text}
              </p>
            )}
            <span className="text-[10px] text-neutral-600 px-1">{shortTime(m.time)}</span>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function Composer({
  vehicles,
  allowBike,
  attachedBike,
  onAttach,
  onSend,
}: {
  vehicles: ChatVehicle[];
  allowBike: boolean;
  attachedBike?: ChatVehicle;
  onAttach: (bikeId: string | null) => void;
  onSend: (text: string, offerNpr?: number) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [picking, setPicking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const canSend = !!(text.trim() || attachedBike);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || sending) return;
    setSending(true);
    const ok = await onSend(text.trim(), showPrice && attachedBike ? Number(price) || undefined : undefined);
    setSending(false);
    setError(!ok);
    if (ok) {
      setText("");
      setPrice("");
      setShowPrice(false);
    }
  };

  return (
    <div className="relative shrink-0 border-t border-white/10 bg-[#0d0e12]">
      <div className="max-w-2xl mx-auto p-2 space-y-2">
        {error && <p className="text-xs text-red-400 px-2">Message did not send. Try again.</p>}
        {attachedBike && (
          <div className="flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachedBike.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{attachedBike.name}</p>
              <p className="text-[11px] text-[#E5B869]">{attachedBike.highestBid}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPrice((s) => !s)}
              className={`px-2.5 h-8 rounded-full text-xs font-bold cursor-pointer ${showPrice ? "bg-[#E5B869] text-black" : "bg-white/10 text-white"}`}
            >
              Price idea
            </button>
            <button type="button" onClick={() => onAttach(null)} className="w-8 h-8 text-neutral-400 text-lg cursor-pointer" aria-label="Remove bike">
              ×
            </button>
          </div>
        )}
        {showPrice && attachedBike && (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Your price idea (NPR)"
            className="w-full h-10 px-4 rounded-full bg-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
        )}
        <form onSubmit={submit} className="flex items-center gap-2">
          {allowBike && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="w-10 h-10 shrink-0 rounded-xl bg-white/10 text-white flex items-center justify-center cursor-pointer"
              aria-label="Add a bike"
              title="Add a bike"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!canSend || sending}
            className="w-10 h-10 shrink-0 rounded-xl bg-[#E5B869] text-black flex items-center justify-center cursor-pointer disabled:opacity-30"
            aria-label="Send"
          >
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-end bg-[#0d0e12]/60" onClick={() => setPicking(false)}>
          <div onClick={(e) => e.stopPropagation()} className="sheet-up w-full max-w-2xl mx-auto max-h-[70vh] flex flex-col rounded-t-3xl bg-[#16171d]">
            <div className="p-4 text-center text-sm font-bold text-white border-b border-white/10">Pick a bike to share</div>
            <div className="overflow-y-auto">
              {vehicles.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">No bikes yet.</p>}
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    onAttach(v.id);
                    setPicking(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                    <p className="text-xs text-[#E5B869]">{v.highestBid}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
