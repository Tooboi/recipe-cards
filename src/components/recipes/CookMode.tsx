"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FireIcon,
  ListBulletIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import IngredientChecklist from "@/components/recipes/IngredientChecklist";
import { formatAmount, parseScale, scaleIngredient, scaleServing } from "@/lib/scale";

type Ingredient = { quantity: string; unit: string; item: string };

/** Keeps the screen on while cooking (where the browser supports it). */
function useWakeLock(active: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) return void lock.release();
        setOn(true);
        lock.addEventListener("release", () => setOn(false));
      } catch {
        setOn(false); // e.g. battery saver
      }
    };
    // The lock drops when the app goes to the background; take it again on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
      setOn(false);
    };
  }, [active]);
  return on;
}

/** Full-screen, one-step-at-a-time view with big text, for cooking from a phone or tablet. */
export default function CookMode({
  title,
  steps,
  ingredients,
  serving,
}: {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
  serving?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const screenOn = useWakeLock(open);
  // Uses the batch size chosen on the recipe page (kept in ?scale=).
  const factor = parseScale(useSearchParams().get("scale"));
  const touchX = useRef<number | null>(null);

  const last = steps.length - 1;
  const go = useCallback((dir: 1 | -1) => setStep((s) => Math.min(last, Math.max(0, s + dir))), [last]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, go]);

  if (!steps.length) return null;

  const lines = ingredients.map((ing) => {
    const s = scaleIngredient(ing, factor);
    return { amount: [s.quantity, s.unit].filter((x) => x?.trim()).join(" "), item: ing.item.trim() };
  });

  return (
    <>
      <button
        type="button"
        className="btn-outline"
        onClick={() => {
          setStep(0);
          setShowIngredients(false);
          setOpen(true);
        }}
      >
        <FireIcon className="h-4 w-4" />
        Cook mode
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Cook mode: ${title}`}
          className="fixed inset-0 z-[70] flex flex-col bg-cream pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-ink print:hidden"
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg font-bold">{title}</p>
              <p className="flex items-center gap-1 text-xs text-ink-soft">
                {screenOn ? (
                  <>
                    <SunIcon className="h-3.5 w-3.5 text-brand" /> Screen will stay on
                  </>
                ) : (
                  "Your screen may still turn off on its own"
                )}
                {factor !== 1 && <> · {formatAmount(factor)}× batch</>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIngredients((v) => !v)}
              aria-pressed={showIngredients}
              className={`flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold ${
                showIngredients ? "border-brand bg-brand text-white" : "border-line text-ink"
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Ingredients</span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close cook mode"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-line"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {showIngredients ? (
            <div className="flex-1 overflow-y-auto px-5 py-4 text-lg">
              <h2 className="section-title mb-1">Ingredients</h2>
              {serving && <p className="mb-2 text-sm text-ink-soft">Makes {scaleServing(serving, factor)}</p>}
              <IngredientChecklist items={lines} highlightAmounts={factor !== 1} />
            </div>
          ) : (
            <div
              className="flex flex-1 flex-col overflow-y-auto px-6 py-6"
              onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
              }}
            >
              <p className="eyebrow">
                Step {step + 1} of {steps.length}
              </p>
              {/* progress */}
              <div className="mt-2 flex gap-1" aria-hidden>
                {steps.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`} />
                ))}
              </div>
              <p className="my-auto py-8 text-2xl leading-relaxed sm:text-3xl" aria-live="polite">
                {steps[step]}
              </p>
            </div>
          )}

          {/* Step buttons, big enough for messy hands */}
          <div className="grid grid-cols-2 gap-3 border-t border-line bg-paper p-3">
            <button
              type="button"
              onClick={() => (showIngredients ? setShowIngredients(false) : go(-1))}
              disabled={!showIngredients && step === 0}
              className="btn-outline h-14 justify-center text-base disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              {showIngredients ? "Back to steps" : "Back"}
            </button>
            {step < last || showIngredients ? (
              <button
                type="button"
                onClick={() => (showIngredients ? setShowIngredients(false) : go(1))}
                className="btn-brand h-14 justify-center text-base"
              >
                {showIngredients ? `Step ${step + 1}` : "Next"}
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={() => setOpen(false)} className="btn-brand h-14 justify-center text-base">
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
