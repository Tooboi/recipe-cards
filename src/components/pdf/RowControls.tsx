"use client";

import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@heroicons/react/24/outline";

/** Move up / move down / remove buttons with phone-sized tap targets. */
export default function RowControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-cream hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0">
      <button type="button" className={base} onClick={() => onMove("up")} disabled={index === 0} title="Move up" aria-label="Move up">
        <ArrowUpIcon className="h-4 w-4" />
      </button>
      <button type="button" className={base} onClick={() => onMove("down")} disabled={index === count - 1} title="Move down" aria-label="Move down">
        <ArrowDownIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${base} hover:bg-red-50 hover:text-red-700`}
        onClick={onRemove}
        title="Remove"
        aria-label="Remove"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
