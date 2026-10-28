import { storeEvents, supabaseRest, usesSupabase } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

// How often to check Supabase for changes made on other servers (hosted setup only)
const POLL_MS = 4000;

// Server-Sent Events: pushes a `change` event (with the changed topic) whenever
// postings, bids, messages or staff chat are written, so every open page updates live.
// Locally changes come from the in-process emitter; on Vercel each request can run on a
// different server, so the stream polls the per-topic change counters in Supabase instead.
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const onChange = (topic: string) => send(`event: change\ndata: ${topic}\n\n`);
      // Comment line keeps proxies from closing an idle connection
      const heartbeat = setInterval(() => send(": ping\n\n"), 25000);

      let poller: ReturnType<typeof setInterval> | undefined;
      if (usesSupabase) {
        let last: Record<string, string> | null = null;
        const poll = async () => {
          try {
            const rows = await supabaseRest<{ topic: string; counter: number }[]>("mulyankan_changes?select=topic,counter");
            const now: Record<string, string> = {};
            for (const row of rows) now[row.topic] = String(row.counter);
            // The page refetches everything when it connects, so the first read is just a baseline
            if (last) for (const topic of Object.keys(now)) if (now[topic] !== last[topic]) onChange(topic);
            last = now;
          } catch {}
        };
        poll();
        poller = setInterval(poll, POLL_MS);
      } else {
        storeEvents.on("change", onChange);
      }

      cleanup = () => {
        clearInterval(heartbeat);
        if (poller) clearInterval(poller);
        storeEvents.off("change", onChange);
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", () => cleanup());
      send("retry: 3000\n\n");
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
