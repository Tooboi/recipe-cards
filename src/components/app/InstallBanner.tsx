"use client";

import { useEffect, useState } from "react";
import { ArrowUpOnSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import VaultMark from "@/components/VaultMark";
import { isStandalone } from "@/lib/app-mode";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "rcv-install-dismissed";
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000; // a month
const SHOW_AFTER_MS = 4000;

function recentlyDismissed() {
  try {
    return Date.now() - Number(localStorage.getItem(DISMISS_KEY) || 0) < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

/**
 * Phone browsers only: a small, dismissible "Get the app" bar.
 * Android gets the real install prompt; iPhone gets the Share → Add to Home Screen hint.
 * Never shown on computers or inside the installed app.
 */
export default function InstallBanner() {
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    const isPhone = window.matchMedia("(max-width: 767px) and (pointer: coarse)").matches;
    if (!isPhone) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (isIOS) timer = setTimeout(() => setMode("ios"), SHOW_AFTER_MS);

    const onPrompt = (e: Event) => {
      e.preventDefault(); // we show our own, quieter bar instead of Chrome's
      setPrompt(e as InstallPromptEvent);
      timer = setTimeout(() => setMode("android"), SHOW_AFTER_MS);
    };
    const onInstalled = () => {
      setMode(null);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 10 * DISMISS_FOR_MS));
      } catch {
        /* storage blocked */
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setMode(null);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage blocked */
    }
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setMode(null);
    else dismiss();
  };

  if (!mode) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden standalone:hidden print:hidden">
      <div className="mx-auto max-w-md rounded-xl border border-line bg-paper p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <VaultMark className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">Get the Recipe Vault app</p>
            <p className="text-xs text-ink-soft">Your recipes on your home screen, even offline.</p>
          </div>
          {mode === "android" ? (
            <button type="button" onClick={install} className="btn-brand shrink-0 px-3 py-1.5 text-sm">
              Install
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSteps((v) => !v)}
              className="btn-brand shrink-0 px-3 py-1.5 text-sm"
              aria-expanded={showSteps}
            >
              How
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Not now"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-soft hover:text-ink"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {mode === "ios" && showSteps && (
          <ol className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm text-ink">
            <li className="flex items-center gap-1.5">
              <span className="font-bold text-brand">1.</span> Tap
              <ArrowUpOnSquareIcon className="h-5 w-5 text-brand" aria-label="Share" />
              <span>Share in the browser bar</span>
            </li>
            <li>
              <span className="font-bold text-brand">2.</span> Choose <strong>Add to Home Screen</strong>
            </li>
            <li>
              <span className="font-bold text-brand">3.</span> Tap <strong>Add</strong>, then open it from your home screen
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}
