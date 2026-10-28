import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { UPLOAD_DIR } from "@/app/lib/serverStore";

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

// Hosted: photos go to Vercel Blob (set up from the Vercel dashboard). Locally: .data/uploads.
const usesBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// Accepts multipart form-data with one or more `file` fields; returns their public URLs.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No file uploaded (use form field 'file')" }, { status: 400 });
    }

    if (!usesBlob) await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
      if (usesBlob) {
        const blob = await put(`bikes/${name}`, file, { access: "public", contentType: file.type });
        urls.push(blob.url);
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
