"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { rateRecipe } from "@/lib/actions/rating.actions";
import StarRating, { STAR } from "./StarRating";

const LABELS = ["", "Not for me", "It was okay", "Pretty good", "Really good", "A keeper!"];

export default function RateRecipe({
  recipeId,
  average,
  count,
  mine,
  isOwner,
  isSignedIn,
}: {
  recipeId: string;
  average: number;
  count: number;
  mine: number | null;
  isOwner: boolean;
  isSignedIn: boolean;
}) {
  const [summary, setSummary] = useState({ average, count, mine });
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();

  const shown = hover || summary.mine || 0;
  const canRate = isSignedIn && !isOwner;

  const rate = (value: number) => {
    if (!canRate) return;
    const previous = summary;
    setSummary((s) => ({ ...s, mine: value }));
    startTransition(async () => {
      try {
        const next = await rateRecipe(recipeId, value);
        setSummary(next);
        toast.success(previous.mine ? "Rating updated" : "Thanks for rating!");
      } catch (err) {
        setSummary(previous);
        toast.error(err instanceof Error ? err.message : "Couldn't save your rating");
      }
    });
  };

  return (
    <section id="rate" className="panel scroll-mt-24 p-5 sm:p-6 print:hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink">
            {isOwner ? "Ratings" : summary.mine ? "Your rating" : "Rate this recipe"}
          </h2>
          <StarRating value={summary.average} count={summary.count} size="md" className="mt-1" />
        </div>

        {isOwner ? (
          <p className="text-sm text-ink-soft">You can&apos;t rate your own recipe.</p>
        ) : !isSignedIn ? (
          <Link href="/signin" className="btn-outline">
            Sign in to rate
          </Link>
        ) : (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div
              className="flex"
              role="radiogroup"
              aria-label="Your rating"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={summary.mine === v}
                  aria-label={`${v} star${v === 1 ? "" : "s"}`}
                  disabled={pending}
                  onMouseEnter={() => setHover(v)}
                  onFocus={() => setHover(v)}
                  onBlur={() => setHover(0)}
                  onClick={() => rate(v)}
                  className="p-1 transition-transform hover:scale-110 disabled:opacity-60"
                >
                  <svg viewBox="0 0 20 20" className={`h-9 w-9 ${v <= shown ? "text-[#e0a526]" : "text-line"}`} fill="currentColor">
                    <path d={STAR} />
                  </svg>
                </button>
              ))}
            </div>
            <p className="h-5 text-sm font-semibold text-ink-soft">{LABELS[shown]}</p>
          </div>
        )}
      </div>
    </section>
  );
}
