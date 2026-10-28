import { promises as fs } from "fs";
import path from "path";
import { UPLOAD_DIR } from "@/app/lib/serverStore";

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // Only plain generated names: no path separators or traversal
  if (!/^[\w-]+\.[a-z]+$/.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    const ext = file.split(".").pop() || "";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPE_BY_EXT[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
