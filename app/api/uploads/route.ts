import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { SUPABASE_URL, UPLOAD_DIR, supabaseHeaders, usesSupabase } from "@/app/lib/serverStore";

export const dynamic = "force-dynamic";

// Vercel rejects request bodies over 4.5 MB; the browser shrinks photos before uploading
const MAX_BYTES = 10 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Hosted: photos go to the public Supabase Storage bucket made by supabase/setup.sql.
// Locally: .data/uploads.
const BUCKET = "bike-photos";

async function uploadToSupabase(name: string, file: File): Promise<string> {
  const objectPath = `bikes/${name}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": file.type, "Cache-Control": "31536000" }),
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(`Supabase Storage: ${json?.message || json?.error || res.status}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

// Accepts multipart form-data with one or more `file` fields; returns their public URLs.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No file uploaded (use form field 'file')" }, { status: 400 });
    }

    if (!usesSupabase) await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      const ext = EXT_BY_TYPE[file.type];
      if (!ext) {
        return NextResponse.json({ error: `Unsupported image type: ${file.type || "unknown"}` }, { status: 415 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: `${file.name} is larger than 10 MB` }, { status: 413 });
      }
      const name = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      if (usesSupabase) {
        urls.push(await uploadToSupabase(name, file));
      } else {
        await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
        urls.push(`/api/uploads/${name}`);
      }
    }

    return NextResponse.json({ success: true, data: urls }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Upload failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
