const MY_POSTINGS_KEY = "mulyankan_my_posting_ids";

// Saves a listing to the marketplace API and remembers it as posted from this device.
// Returns the stored posting (with its server-assigned id), or throws on failure.
export async function postListing<T extends object>(listing: T): Promise<T & { id: string }> {
  const res = await fetch("/api/postings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.id) {
    throw new Error(json?.error || "Could not save your listing. Please try again.");
  }
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(MY_POSTINGS_KEY) || "[]");
    localStorage.setItem(MY_POSTINGS_KEY, JSON.stringify([json.data.id, ...ids]));
  } catch {}
  return json.data;
}

const MAX_SIDE = 1600;

// Phone photos are often 4-10 MB, over the host's 4.5 MB request limit, so shrink
// them to a 1600px JPEG first. Formats the browser can't draw (e.g. HEIC) go up as-is.
async function shrinkPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Uploads image files to the server and returns their public URLs (in the same order).
// One request per photo keeps every request small.
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const original of files) {
    const form = new FormData();
    form.append("file", await shrinkPhoto(original));
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const json = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(json?.data)) {
      throw new Error(json?.error || (res.status === 413 ? "That photo is too big. Try a smaller one." : "Photo upload failed. Please try again."));
    }
    urls.push(...json.data);
  }
  return urls;
}
