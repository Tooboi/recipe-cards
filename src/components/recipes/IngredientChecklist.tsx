"use client";

import { useState } from "react";

/** Tick ingredients off while you cook, like most recipe sites allow. */
export default function IngredientChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <ul className="divide-y divide-line">
      {items.map((item, i) => (
        <li key={i}>
          <label className="flex cursor-pointer items-start gap-3 py-2.5">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-brand print:hidden"
              checked={!!checked[i]}
              onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
            />
            <span className="hidden print:inline">•</span>
            <span className={checked[i] ? "text-ink-soft line-through" : "text-ink"}>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
