"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatAmount, MAX_SCALE, scaleServing, scaleStep } from "@/lib/scale";

const PRESETS = [
  { factor: 0.5, label: "½×" },
  { factor: 1, label: "1×" },
  { factor: 2, label: "2×" },
  { factor: 3, label: "3×" },
];

/** ½× / 1× / 2× / 3× buttons plus fine − / + steps, with the scaled yield underneath. */
export default function ScaleControl({
  factor,
  onChange,
  serving,
}: {
  factor: number;
  onChange: (factor: number) => void;
  serving?: string | null;
}) {
  const stepBy = scaleStep(serving);
  const step = (dir: 1 | -1) => {
    const next = Math.round((factor + dir * stepBy) * 1000) / 1000;
    onChange(Math.min(MAX_SCALE, Math.max(stepBy, next)));
  };
  const scaled = factor !== 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Scale recipe" className="flex rounded-md border border-line p-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.factor}
              type="button"
              role="radio"
              aria-checked={factor === p.factor}
              onClick={() => onChange(p.factor)}
              className={`h-8 min-w-11 rounded px-2 text-sm font-semibold transition-colors ${
                factor === p.factor ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Make less"
            onClick={() => step(-1)}
            disabled={factor <= stepBy}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-soft hover:border-brand hover:text-brand disabled:opacity-40"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-12 text-center text-sm font-semibold text-ink" aria-live="polite">
            {formatAmount(factor) || factor}×
          </span>
          <button
            type="button"
            aria-label="Make more"
            onClick={() => step(1)}
            disabled={factor >= MAX_SCALE}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-soft hover:border-brand hover:text-brand disabled:opacity-40"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      {serving && (
        <p className="mt-2 text-sm text-ink-soft">
          Makes{" "}
          <span className={`font-semibold ${scaled ? "text-brand" : "text-ink"}`}>
            {scaled ? scaleServing(serving, factor) : serving}
          </span>
          {scaled && <span> (original: {serving})</span>}
        </p>
      )}
    </div>
  );
}
