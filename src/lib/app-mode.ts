// Browser-only helpers for the installed (home-screen) version of the site.

/** True when the site was opened from its home-screen icon rather than a browser tab. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iPhone/iPad home-screen apps
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const SAVED_CACHES = ["rcv-pages", "rcv-images", "rcv-meta"];
export const LAST_SYNC_KEY = "rcv-offline-synced";

/** Deletes the offline copies of recipes (used when signing out). */
export async function clearOfflineCopies() {
  try {
    localStorage.removeItem(LAST_SYNC_KEY);
  } catch {
    /* storage blocked */
  }
  try {
    if ("caches" in window) await Promise.all(SAVED_CACHES.map((name) => caches.delete(name)));
    navigator.serviceWorker?.controller?.postMessage({ type: "clear" });
  } catch {
    /* nothing saved */
  }
}
