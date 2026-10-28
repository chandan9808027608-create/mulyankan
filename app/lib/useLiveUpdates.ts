"use client";

import { useEffect, useRef } from "react";

// Subscribes to /api/stream and calls `onChange(topic)` whenever the server data changes.
// Also fires on (re)connect so anything missed while disconnected is picked up.
export function useLiveUpdates(onChange: (topic: string) => void) {
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (typeof EventSource === "undefined") return;
    const source = new EventSource("/api/stream");
    const onMessage = (e: MessageEvent) => handler.current(String(e.data));
    source.addEventListener("change", onMessage);
    source.onopen = () => handler.current("*");
    return () => {
      source.removeEventListener("change", onMessage);
      source.close();
    };
  }, []);
}
