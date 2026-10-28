import { NextResponse } from "next/server";
import { readStore, supabaseRest, usesSupabase } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

// Read-only check of the storage setup: which backend is active and whether it answers.
export async function GET() {
  const storage = usesSupabase ? "supabase" : "local-file";
  try {
    const store = await readStore();
    let photoBucket: string | undefined;
    if (usesSupabase) {
      // The save function and bucket come from supabase/setup.sql; the changes table proves it ran
      await supabaseRest("mulyankan_changes?select=topic&limit=1");
      photoBucket = "bike-photos";
    }
    return NextResponse.json({
      ok: true,
      storage,
      photoBucket,
      counts: { postings: store.postings.length, bids: store.bids.length, messages: store.messages.length },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, storage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
