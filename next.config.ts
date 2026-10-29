import type { NextConfig } from "next";

// A Vercel deployment without its own Supabase settings (e.g. the older
// mulyankan-bay project that old APKs still open) can't store bikes or photos.
// It forwards its API calls to the deployment that has the database, so every
// copy of the app shares the same data. Local dev and the main deployment
// (which has Supabase) are unchanged.
const hasOwnStorage = Object.keys(process.env).some((k) => k.endsWith("SUPABASE_URL") && process.env[k]);
const backendUrl = (process.env.MULYANKAN_BACKEND_URL || "https://mulyankan-app.vercel.app").replace(/\/$/, "");
const forwardApi = !!process.env.VERCEL && !hasOwnStorage;

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: forwardApi ? [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }] : [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
