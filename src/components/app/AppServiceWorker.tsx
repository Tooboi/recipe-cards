"use client";

import { useEffect, useState } from "react";
import { WifiIcon } from "@heroicons/react/24/outline";
import { clearOfflineCopies, isStandalone, LAST_SYNC_KEY } from "@/lib/app-mode";

const SYNC_EVERY_MS = 6 * 60 * 60 * 1000;

/** Re-downloads your recipes for offline use at most every few hours. */
async function syncOfflineCopies(force = false) {
  const sw = await navigator.serviceWorker.ready;
  let last = 0;
  try {
    last = Number(localStorage.getItem(LAST_SYNC_KEY)) || 0;
  } catch {
    /* storage blocked */
  }
  if (!force && Date.now() - last < SYNC_EVERY_MS) return;

  const res = await fetch("/api/offline", { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return;
  const { user, urls } = (await res.json()) as { user: string | null; urls: string[] };
  if (!user) {
    await clearOfflineCopies();
    return;
  }
  sw.active?.postMessage({ type: "download-ahead", user, urls });
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  } catch {
    /* storage blocked */
  }
}

/**
 * Installed app only: turns on offline recipes and shows a small note when there's
 * no connection. On the regular website this does nothing.
 */
export default function AppServiceWorker({ userId }: { userId: string | null }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator) || !isStandalone()) {
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => syncOfflineCopies())
      .catch((err) => console.warn("Offline mode unavailable", err));

    const onVisible = () => {
      if (document.visibilityState === "visible") syncOfflineCopies().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Signed in as someone else (or out) since the last download: refresh right away.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator) || !isStandalone()) {
      return;
    }
    let previous: string | null = null;
    try {
      previous = localStorage.getItem("rcv-offline-user");
      localStorage.setItem("rcv-offline-user", userId ?? "");
    } catch {
      /* storage blocked */
    }
    if (previous !== null && previous !== (userId ?? "")) {
      if (userId) syncOfflineCopies(true).catch(() => {});
      else clearOfflineCopies();
    }
  }, [userId]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 flex justify-center px-4 pt-2 print:hidden"
    >
      <p className="flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream shadow-md">
        <WifiIcon className="h-4 w-4" />
        Offline: showing saved recipes
      </p>
    </div>
  );
}
