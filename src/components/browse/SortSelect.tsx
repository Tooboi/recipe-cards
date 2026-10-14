"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, type SortOption } from "@/lib/taxonomy";

export default function SortSelect({ value, hrefs }: { value: SortOption; hrefs: Record<SortOption, string> }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft">
      <span className="hidden sm:inline">Sort by</span>
      <select
        className="field !w-auto !py-1.5"
        value={value}
        onChange={(e) => router.push(hrefs[e.target.value as SortOption])}
        aria-label="Sort recipes"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
