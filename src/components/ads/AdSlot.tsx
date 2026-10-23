"use client";

import { useEffect, useRef, useState } from "react";
import { ADS } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One AdSense unit. If Google has no ad to show, or the ad is blocked or slow,
 * it quietly turns into `fallback` (a recipe card) so the grid never has a hole.
 */
export default function AdSlot({
  slot,
  layoutKey,
  variant,
  fallback,
  className = "",
}: {
  slot: string;
  /** In-feed units need their layout key; display units don't. */
  layoutKey?: string;
  variant: "card" | "compact" | "banner";
  fallback: React.ReactNode;
  className?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const [state, setState] = useState<"loading" | "filled" | "fallback">("loading");

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;

    const read = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") setState("filled");
      else if (status === "unfilled") setState("fallback");
    };
    const observer = new MutationObserver(read);
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      setState("fallback");
    }
    // Ad blockers (or a very slow network) never answer: show the recipe instead.
    const timer = setTimeout(() => {
      if (ins.getAttribute("data-ad-status") !== "filled") setState("fallback");
    }, 4500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (state === "fallback") return <>{fallback}</>;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-sm print:hidden ${className}`}
      aria-label="Advertisement"
    >
      <span
        className={`pt-3 text-[10px] font-bold tracking-[0.16em] text-ink-soft uppercase ${
          variant === "compact" ? "px-3" : "px-4"
        }`}
      >
        Advertisement
      </span>
      <div
        className={`flex-1 px-2 pb-2 ${
          variant === "card" ? "min-h-[300px]" : variant === "compact" ? "min-h-[220px]" : "min-h-[120px]"
        }`}
      >
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADS.client}
          data-ad-slot={slot}
          {...(variant !== "banner"
            ? { "data-ad-format": "fluid", "data-ad-layout-key": layoutKey }
            : { "data-ad-format": "auto", "data-full-width-responsive": "true" })}
        />
      </div>
      {state === "loading" && (
        // Placeholder shimmer so nothing jumps while the ad loads
        <div className="pointer-events-none absolute inset-x-4 top-9 bottom-4 animate-pulse rounded-md bg-cream" />
      )}
    </div>
  );
}
