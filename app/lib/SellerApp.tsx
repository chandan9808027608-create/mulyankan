"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { BidRecord, DirectMessage } from "./dealerBidsData";
import { timeAgo } from "./dealerBidsData";
import { DealerTabBar, TAB_ICONS } from "./DealerTabBar";
import { PhotoSlider } from "./PhotoSlider";
import { ScreenHeader, SegmentedTabs, Toast } from "./ScreenHeader";
import { YatayatHandoverModal } from "./YatayatHandoverModal";
import { clearSellerProfile, getSellerProfile } from "./session";

export type SellerView = "home" | "bikes" | "chats" | "more";

export interface SellerBike {
  id: string;
  name: string;
  year: string;
  mileage: string;
  lotNumber: string;
  location: string;
  condition: string;
  highestBid: string;
  imageUrl: string;
  images: { url: string; label: string }[];
  sellerName: string;
  sellerPhone: string;
  createdAt?: string;
}

interface SellerAppProps {
  view: SellerView;
  onViewChange: (view: SellerView) => void;
  /** Bikes posted from this device */
  postings: SellerBike[];
  bids: BidRecord[];
  messages: DirectMessage[];
  onSell: () => void;
  onAccept: (bidId: string) => Promise<void>;
  onReject: (bidId: string) => Promise<void>;
  onSendMessage: (bikeId: string, text: string) => Promise<boolean>;
  onShopLogin: () => void;
}

const READ_KEY = "mulyankan_seller_chat_read";
const npr = (n: number) => `NPR ${n.toLocaleString("en-IN")}`;

function readMarks(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "{}");
  } catch {
    return {};
  }
}

// The seller side of the Android app: same look as the shop app, built around
// "post a bike, get offers, pick one".
export function SellerApp(props: SellerAppProps) {
  const { view, onViewChange, postings, bids, messages, onSell } = props;
  const [openBikeId, setOpenBikeId] = useState<string | null>(null);
  const [openBikeTab, setOpenBikeTab] = useState<"offers" | "chat">("offers");
  const [readMarksState, setReadMarksState] = useState(readMarks);

  const myIds = useMemo(() => new Set(postings.map((p) => p.id)), [postings]);
  const myBids = useMemo(() => bids.filter((b) => myIds.has(b.bikeId)), [bids, myIds]);
  const threads = useMemo(
    () =>
      postings
        .map((p) => {
          const msgs = messages.filter((m) => m.bikeId === p.id);
          return { bike: p, msgs, last: msgs[msgs.length - 1] };
        })
        .filter((t) => t.last)
        .sort((a, b) => Date.parse(b.last!.timestamp) - Date.parse(a.last!.timestamp)),
    [postings, messages]
  );
  const unreadCount = threads.filter(
    (t) => t.last!.sender === "dealer" && (!readMarksState[t.bike.id] || Date.parse(t.last!.timestamp) > Date.parse(readMarksState[t.bike.id]))
  ).length;

  // An open bike gets its own history entry so Android's back button closes it
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (!e.state?.sellerBike) {
        setOpenBikeId(null);
        setReadMarksState(readMarks());
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openBike = (id: string, tab: "offers" | "chat" = "offers") => {
    setOpenBikeTab(tab);
    setOpenBikeId(id);
    window.history.pushState({ ...window.history.state, sellerBike: id }, "");
  };

  const closeBike = () => {
    if (window.history.state?.sellerBike) {
      window.history.back(); // the popstate listener closes it
      return;
    }
    setOpenBikeId(null);
    setReadMarksState(readMarks());
  };

  const openBikeData = postings.find((p) => p.id === openBikeId);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0d0e12] text-white">
      <main className="relative flex-1 min-h-0 overflow-y-auto">
        {view === "home" && <SellerHome postings={postings} bids={myBids} onSell={onSell} onOpenBike={openBike} onSeeAll={() => onViewChange("bikes")} />}
        {view === "bikes" && <SellerBikesList postings={postings} bids={bids} onSell={onSell} onOpenBike={openBike} />}
        {view === "chats" && (
          <div className="min-h-full">
            <ScreenHeader title="Chats" subtitle="Messages from shops about your bikes" />
            <div className="max-w-2xl mx-auto p-4 space-y-2">
              {threads.length === 0 ? (
                <Empty title="No messages yet" text="When a shop asks about your bike, it shows up here." />
              ) : (
                threads.map(({ bike, last }) => {
                  const unread = last!.sender === "dealer" && (!readMarksState[bike.id] || Date.parse(last!.timestamp) > Date.parse(readMarksState[bike.id]));
                  return (
                    <button
                      key={bike.id}
                      type="button"
                      onClick={() => openBike(bike.id, "chat")}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#16171d] border border-white/10 text-left cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bike.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-neutral-900" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{bike.name}</p>
                        <p className={`text-xs truncate ${unread ? "text-white font-semibold" : "text-neutral-400"}`}>
                          {last!.sender === "seller" ? "You" : last!.senderName}: {last!.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[11px] text-neutral-500">{timeAgo(last!.timestamp)}</span>
                        {unread && <span className="px-1.5 py-0.5 rounded-md bg-[#E5B869] text-black text-[9px] font-black uppercase">New</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
        {view === "more" && <SellerMore onShopLogin={props.onShopLogin} onSell={onSell} />}
      </main>

      <DealerTabBar
        tabs={[
          { key: "home", label: "Home", icon: TAB_ICONS.home, isActive: view === "home", onClick: () => onViewChange("home") },
          { key: "bikes", label: "My Bikes", icon: TAB_ICONS.bikes, isActive: view === "bikes", badge: myBids.filter((b) => b.status === "active").length, onClick: () => onViewChange("bikes") },
          { key: "sell", label: "Sell", icon: TAB_ICONS.plus, center: true, onClick: onSell },
          { key: "chats", label: "Chats", icon: TAB_ICONS.chat, isActive: view === "chats", badge: unreadCount, onClick: () => onViewChange("chats") },
          { key: "more", label: "More", icon: TAB_ICONS.more, isActive: view === "more", onClick: () => onViewChange("more") },
        ]}
      />

      {openBikeData && (
        <SellerBikeScreen
          key={openBikeData.id}
          bike={openBikeData}
          bids={bids.filter((b) => b.bikeId === openBikeData.id)}
          messages={messages.filter((m) => m.bikeId === openBikeData.id)}
          initialTab={openBikeTab}
          onClose={closeBike}
          onAccept={props.onAccept}
          onReject={props.onReject}
          onSendMessage={(text) => props.onSendMessage(openBikeData.id, text)}
        />
      )}
    </div>
  );
}

function SellerHome({
  postings,
  bids,
  onSell,
  onOpenBike,
  onSeeAll,
}: {
  postings: SellerBike[];
  bids: BidRecord[];
  onSell: () => void;
  onOpenBike: (id: string) => void;
  onSeeAll: () => void;
}) {
  const latest = [...bids].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 3);
  const best = bids.reduce((m, b) => Math.max(m, b.amountNpr), 0);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between pt-1">
        <span className="px-3 py-1.5 rounded-xl bg-[#16171d] border border-white/10 text-sm font-black tracking-tight text-[#E5B869]">Mulyankan</span>
        <span className="text-xs text-neutral-500">Sell your bike to shops</span>
      </div>

      {/* Sell card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E5B869]/25 bg-[#16171d]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/black-yamaha-r15.jpg" alt="" className="w-full aspect-[16/9] object-cover" />
        <div className="p-4 space-y-3">
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Sell your bike</h1>
            <p className="text-xs text-neutral-400">Add photos and a price. Bike shops send you offers. You pick the best one.</p>
          </div>
          <button type="button" onClick={onSell} className="w-full h-12 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer">
            + Sell a bike — it&apos;s free
          </button>
        </div>
      </div>

      {postings.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <Stat value={String(postings.length)} label="My bikes" />
          <Stat value={String(bids.length)} label="Offers" />
          <Stat value={best ? npr(best) : "—"} label="Best offer" tone="text-[#E5B869]" />
        </div>
      )}

      {latest.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-sm font-bold text-white">New offers</h2>
            <button type="button" onClick={onSeeAll} className="text-xs text-[#E5B869] font-semibold cursor-pointer">
              See all
            </button>
          </div>
          {latest.map((b) => {
            const bike = postings.find((p) => p.id === b.bikeId);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onOpenBike(b.bikeId)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#16171d] border border-white/10 text-left cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bike?.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-neutral-900" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{b.dealerName}</p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {bike?.name} • {timeAgo(b.timestamp)}
                  </p>
                </div>
                <p className="text-sm font-black text-[#E5B869] shrink-0">{npr(b.amountNpr)}</p>
              </button>
            );
          })}
        </div>
      )}

      <HowItWorks />
    </div>
  );
}

function SellerBikesList({
  postings,
  bids,
  onSell,
  onOpenBike,
}: {
  postings: SellerBike[];
  bids: BidRecord[];
  onSell: () => void;
  onOpenBike: (id: string) => void;
}) {
  return (
    <div className="min-h-full">
      <ScreenHeader
        title="My bikes"
        subtitle="Tap a bike to see offers"
        right={
          <button type="button" onClick={onSell} className="h-10 px-3 rounded-xl bg-[#E5B869] text-black text-xs font-black cursor-pointer">
            + Sell
          </button>
        }
      />
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {postings.length === 0 ? (
          <Empty title="No bikes yet" text="Press Sell to add your bike. Shops will send you offers." action={{ label: "+ Sell a bike", onClick: onSell }} />
        ) : (
          postings.map((p) => {
            const pBids = bids.filter((b) => b.bikeId === p.id);
            const sold = pBids.find((b) => b.status === "accepted");
            const waiting = pBids.filter((b) => b.status === "active").length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenBike(p.id)}
                className="w-full flex gap-3 p-3 rounded-2xl bg-[#16171d] border border-white/10 hover:border-[#E5B869]/40 text-left cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt="" className="w-24 h-20 rounded-xl object-cover bg-neutral-900 shrink-0" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        sold ? "bg-emerald-500/15 text-emerald-400" : "bg-[#E5B869]/15 text-[#E5B869]"
                      }`}
                    >
                      {sold ? "Sold" : "For sale"}
                    </span>
                  </div>
                  <p className="text-base font-black text-[#E5B869] leading-tight">{p.highestBid}</p>
                  <p className="text-[11px] text-neutral-400">
                    {pBids.length} {pBids.length === 1 ? "offer" : "offers"}
                    {waiting > 0 && !sold ? ` • ${waiting} waiting for you` : ""}
                  </p>
                  {p.createdAt && <p className="text-[11px] text-neutral-500">Posted {timeAgo(p.createdAt)}</p>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function SellerBikeScreen({
  bike,
  bids,
  messages,
  initialTab,
  onClose,
  onAccept,
  onReject,
  onSendMessage,
}: {
  bike: SellerBike;
  bids: BidRecord[];
  messages: DirectMessage[];
  initialTab: "offers" | "chat";
  onClose: () => void;
  onAccept: (bidId: string) => Promise<void>;
  onReject: (bidId: string) => Promise<void>;
  onSendMessage: (text: string) => Promise<boolean>;
}) {
  const [tab, setTab] = useState(initialTab);
  const [busyBid, setBusyBid] = useState<string | null>(null);
  const [confirmBid, setConfirmBid] = useState<BidRecord | null>(null);
  const [stepsFor, setStepsFor] = useState<BidRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const photos = bike.images.length > 0 ? bike.images : [{ url: bike.imageUrl, label: "" }];
  const sorted = [...bids].sort((a, b) => b.amountNpr - a.amountNpr);
  const accepted = bids.find((b) => b.status === "accepted");

  // Keep this bike's chat marked as read while it is open
  useEffect(() => {
    if (tab !== "chat") return;
    try {
      localStorage.setItem(READ_KEY, JSON.stringify({ ...readMarks(), [bike.id]: new Date().toISOString() }));
    } catch {}
  }, [tab, bike.id, messages.length]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const act = async (bid: BidRecord, action: "accept" | "reject") => {
    setBusyBid(bid.id);
    await (action === "accept" ? onAccept(bid.id) : onReject(bid.id));
    setBusyBid(null);
    if (action === "accept") {
      showToast(`Sold to ${bid.dealerName}!`);
      setStepsFor(bid);
    } else {
      showToast(`You said no to ${bid.dealerName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col">
      <Toast message={toast} />
      <div className="shrink-0 flex items-center gap-3 px-3 py-2.5 border-b border-white/5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="w-10 h-10 shrink-0 rounded-xl bg-[#16171d] border border-white/10 text-white flex items-center justify-center cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{bike.name}</p>
          <p className="text-[11px] text-neutral-500 font-mono truncate">{bike.lotNumber}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="relative aspect-[4/3] bg-black">
            <PhotoSlider photos={photos} alt={bike.name} />
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 space-y-1">
              {accepted ? (
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-bold uppercase">Sold to {accepted.dealerName}</span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#E5B869]/15 text-[#E5B869] text-[10px] font-bold uppercase">For sale</span>
              )}
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold pt-1">{bids.length ? "Best offer" : "Your price"}</p>
              <p className="text-2xl font-black text-[#E5B869] leading-none">{bike.highestBid}</p>
              <p className="text-xs text-neutral-400 pt-1">
                {bike.mileage} • {bike.condition} • {bike.location}
              </p>
              {accepted && (
                <button
                  type="button"
                  onClick={() => setStepsFor(accepted)}
                  className="mt-2 w-full h-11 rounded-xl bg-emerald-500 text-black text-sm font-black cursor-pointer"
                >
                  What to do next
                </button>
              )}
            </div>

            <SegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { key: "offers", label: `Offers (${bids.length})` },
                { key: "chat", label: `Chat${messages.length ? ` (${messages.length})` : ""}` },
              ]}
            />

            {tab === "offers" ? (
              sorted.length === 0 ? (
                <Empty title="No offers yet" text="Shops can see your bike now. Offers show up here as soon as they send them." />
              ) : (
                <div className="space-y-2">
                  {sorted.map((b) => {
                    const open = b.status === "active" && !accepted;
                    return (
                      <div key={b.id} className={`p-3 rounded-2xl border space-y-3 ${open ? "bg-[#E5B869]/10 border-[#E5B869]/30" : "bg-[#16171d] border-white/10"}`}>
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 shrink-0 rounded-xl bg-[#E5B869] text-black flex items-center justify-center text-sm font-black">
                            {b.dealerName[0]?.toUpperCase()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{b.dealerName}</p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {b.dealerLocation} • {timeAgo(b.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-white">{npr(b.amountNpr)}</p>
                            <p className={`text-[10px] font-bold uppercase ${b.status === "accepted" ? "text-emerald-400" : open ? "text-[#E5B869]" : "text-neutral-500"}`}>
                              {b.status === "accepted" ? "You said yes" : open ? "Waiting for you" : "Not chosen"}
                            </p>
                          </div>
                        </div>
                        {open && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busyBid === b.id}
                              onClick={() => act(b, "reject")}
                              className="flex-1 h-11 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
                            >
                              No
                            </button>
                            <button
                              type="button"
                              disabled={busyBid === b.id}
                              onClick={() => setConfirmBid(b)}
                              className="flex-[2] h-11 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer disabled:opacity-50"
                            >
                              ✓ Yes, sell for {npr(b.amountNpr)}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <BikeChat messages={messages} onSend={onSendMessage} />
            )}
          </div>
        </div>
      </div>

      {/* Ask before selling: this cannot be undone */}
      {confirmBid && (
        <div onClick={() => setConfirmBid(null)} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70">
          <div onClick={(e) => e.stopPropagation()} className="sheet-up w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#16171d] border border-white/10 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4">
            <div className="mx-auto w-10 h-1 rounded-full bg-white/20 sm:hidden" />
            <div className="text-center space-y-1">
              <p className="text-lg font-black text-white">Sell to {confirmBid.dealerName}?</p>
              <p className="text-2xl font-black text-[#E5B869]">{npr(confirmBid.amountNpr)}</p>
              <p className="text-xs text-neutral-400">The other shops will be told no. You can&apos;t undo this.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmBid(null)} className="flex-1 h-12 rounded-xl bg-white/10 text-white text-sm font-semibold cursor-pointer">
                Not yet
              </button>
              <button
                type="button"
                onClick={() => {
                  const bid = confirmBid;
                  setConfirmBid(null);
                  act(bid, "accept");
                }}
                className="flex-[2] h-12 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer"
              >
                Yes, sell
              </button>
            </div>
          </div>
        </div>
      )}

      {stepsFor && (
        <YatayatHandoverModal
          isOpen
          forSeller
          onClose={() => setStepsFor(null)}
          bikeName={bike.name}
          lotNumber={bike.lotNumber}
          sellerName={stepsFor.dealerName}
          sellerPhone=""
          buyerName={stepsFor.dealerName}
          agreedPriceNpr={stepsFor.amountNpr}
        />
      )}
    </div>
  );
}

function BikeChat({ messages, onSend }: { messages: DirectMessage[]; onSend: (text: string) => Promise<boolean> }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const ok = await onSend(text.trim());
    setSending(false);
    setFailed(!ok);
    if (ok) setText("");
  };

  return (
    <div className="rounded-2xl bg-[#16171d] border border-white/10 overflow-hidden">
      <div className="max-h-96 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No messages yet. Shops can ask you questions here.</p>}
        {messages.map((m) => {
          const mine = m.sender === "seller";
          return (
            <div key={m.id} className={`flex flex-col max-w-[80%] ${mine ? "ml-auto items-end" : "items-start"}`}>
              {/* Sender's name above every message, including your own */}
              <span className={`text-[11px] font-semibold px-1 ${mine ? "text-[#E5B869]" : "text-neutral-400"}`}>{m.senderName}</span>
              <p className={`px-3.5 py-2 rounded-2xl text-sm break-words ${mine ? "bg-[#E5B869] text-black rounded-br-md" : "bg-white/10 text-white rounded-bl-md"}`}>
                {m.message}
              </p>
              <span className="text-[10px] text-neutral-600 px-1 mt-0.5">{timeAgo(m.timestamp)}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {failed && <p className="px-3 text-xs text-red-400">Message did not send. Try again.</p>}
      <form onSubmit={submit} className="flex gap-2 p-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write to the shops..."
          className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button type="submit" disabled={!text.trim() || sending} className="h-10 px-4 rounded-xl bg-[#E5B869] text-black text-sm font-bold cursor-pointer disabled:opacity-30">
          Send
        </button>
      </form>
    </div>
  );
}

function SellerMore({ onShopLogin, onSell }: { onShopLogin: () => void; onSell: () => void }) {
  // Only rendered in the browser, so localStorage is safe to read here
  const [seller, setSeller] = useState(getSellerProfile);
  const rows: { label: string; sub: string; icon: string; onClick: () => void }[] = [
    { label: "Sell a bike", sub: "Add a new bike", icon: "M12 4v16m8-8H4", onClick: onSell },
    seller
      ? {
          label: "Log out",
          sub: `Logged in as ${seller.name}`,
          icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
          onClick: () => {
            clearSellerProfile();
            setSeller(null);
          },
        }
      : {
          label: "Log in",
          sub: "Sellers, bike shops and their workers",
          icon: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
          onClick: onShopLogin,
        },
  ];
  return (
    <div className="min-h-full">
      <ScreenHeader title="More" />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {seller && (
          <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 flex items-center gap-3">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-[#E5B869] text-black font-black flex items-center justify-center">
              {seller.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]!.toUpperCase())
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{seller.name}</p>
              <p className="text-xs text-neutral-400 truncate">{seller.phone}</p>
            </div>
          </div>
        )}
        <div className="rounded-2xl bg-[#16171d] border border-white/10 divide-y divide-white/10 overflow-hidden">
          {rows.map((r) => (
            <button key={r.label} type="button" onClick={r.onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 text-left cursor-pointer">
              <span className="w-8 h-8 rounded-lg bg-white/5 text-[#E5B869] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={r.icon} />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white">{r.label}</span>
                <span className="block text-[11px] text-neutral-500">{r.sub}</span>
              </span>
              <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <HowItWorks />

        <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 space-y-1">
          <p className="text-xs font-bold text-[#E5B869]">About Mulyankan</p>
          <p className="text-xs text-neutral-400">
            Mulyankan helps people in Nepal sell their bike to checked bike shops. Posting is free, and you don&apos;t need an account.
          </p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 space-y-3">
      <p className="text-xs font-bold text-[#E5B869]">How it works</p>
      {[
        ["1", "Add your bike", "Photos, price and your phone number. No sign-up."],
        ["2", "Shops send offers", "Bike shops see your bike and offer a price."],
        ["3", "Pick the best one", "Say yes to the offer you like. Then meet and get paid."],
      ].map(([n, title, desc]) => (
        <div key={n} className="flex items-start gap-3">
          <span className="w-6 h-6 shrink-0 rounded-lg bg-[#E5B869]/15 text-[#E5B869] text-xs font-black flex items-center justify-center">{n}</span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{title}</p>
            <p className="text-[11px] text-neutral-400">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ value, label, tone = "text-white" }: { value: string; label: string; tone?: string }) {
  return (
    <div className="p-3 rounded-2xl bg-[#16171d] border border-white/10 min-w-0">
      <p className={`text-sm font-black truncate ${tone}`}>{value}</p>
      <p className="text-[11px] text-neutral-400">{label}</p>
    </div>
  );
}

function Empty({ title, text, action }: { title: string; text: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-white/10 space-y-2">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-neutral-500">{text}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="mt-2 h-11 px-5 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer">
          {action.label}
        </button>
      )}
    </div>
  );
}
