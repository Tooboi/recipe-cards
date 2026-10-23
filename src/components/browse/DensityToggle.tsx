"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Squares2X2Icon, TableCellsIcon } from "@heroicons/react/24/outline";

const COOKIE = "rcv-density";

/** Comfortable (big cards) vs compact (more per row). Remembered for a year. */
export default function DensityToggle({ value }: { value: "comfortable" | "compact" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (v: "comfortable" | "compact") => {
    if (v === value) return;
    document.cookie = `${COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  };

  const btn = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded transition-colors ${
      active ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <div
      role="radiogroup"
      aria-label="Card layout"
      className={`flex items-center rounded-md border border-line bg-paper p-0.5 ${pending ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "comfortable"}
        title="Comfortable"
        aria-label="Comfortable layout"
        className={btn(value === "comfortable")}
        onClick={() => choose("comfortable")}
      >
        <Squares2X2Icon className="h-4 w-4" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "compact"}
        title="Compact"
        aria-label="Compact layout"
        className={btn(value === "compact")}
        onClick={() => choose("compact")}
      >
        <TableCellsIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
