"use client";

import { useSyncExternalStore } from "react";

// True when the site runs inside the Android app (our WebView app, a Trusted Web
// Activity) or as an installed home-screen app, false in a normal browser tab.
// Once detected it is remembered for the tab, because the Android referrer is
// only present on the first page load.
const KEY = "mulyankan_app_mode";

function detect(): boolean {
  try {
    if (sessionStorage.getItem(KEY) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("source") === "apk" || params.get("source") === "twa";
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const fromAndroidApp = document.referrer.startsWith("android-app://");
    // Our Android WebView app adds this to its user agent
    const fromWebViewApp = navigator.userAgent.includes("MulyankanApp");
    const isApp = fromUrl || standalone || fromAndroidApp || fromWebViewApp;
    if (isApp) sessionStorage.setItem(KEY, "1");
    return isApp;
  } catch {
    return false;
  }
}

let cached: boolean | null = null;
const getSnapshot = () => (cached ??= detect());
const getServerSnapshot = () => false;
const subscribe = () => () => {};

export function useIsApp(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Phone-sized screens (below Tailwind's md breakpoint) also get the app layout.
const MOBILE_QUERY = "(max-width: 767px)";
const subscribeMobile = (onChange: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

/** App layout: inside the Android app, or in a phone browser. Desktop browsers get the website layout. */
export function useAppLayout(): boolean {
  const isApp = useIsApp();
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerSnapshot);
  return isApp || isMobile;
}
