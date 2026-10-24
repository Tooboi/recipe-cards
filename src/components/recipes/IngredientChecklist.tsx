"use client";

import { useState } from "react";
import { splitIngredientNote } from "@/lib/recipe-format";

type Line = { amount: string; item: string };

/** Tick ingredients off while you cook, like most recipe sites allow. */
export default function IngredientChecklist({
  items,
  highlightAmounts = false,
}: {
  items: Line[];
  /** Emphasise the amounts (used when the recipe has been scaled). */
  highlightAmounts?: boolean;
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <ul className="divide-y divide-line">
      {items.map(({ amount, item }, i) => {
        const [main, note] = splitIngredientNote(item);
        return (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 py-2.5">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-brand print:hidden"
                checked={!!checked[i]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
              />
              <span className="hidden print:inline">•</span>
              <span className={checked[i] ? "text-ink-soft line-through" : "text-ink"}>
                {amount && (
                  <span className={highlightAmounts && !checked[i] ? "font-semibold text-brand" : ""}>
                    {amount}{" "}
                  </span>
                )}
                {main}
                {note && <span className="text-ink-soft"> {note}</span>}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
