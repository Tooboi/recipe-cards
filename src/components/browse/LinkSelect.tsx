"use client";

import { useRouter } from "next/navigation";

/** A <select> whose options are links (used for sort and, on phones, category). */
export default function LinkSelect({
  label,
  value,
  options,
  showLabel = true,
  className = "",
}: {
  label: string;
  value: string;
  options: { value: string; label: string; href: string }[];
  showLabel?: boolean;
  className?: string;
}) {
  const router = useRouter();
  return (
    <label className={`flex items-center gap-2 text-sm text-ink-soft ${className}`}>
      {showLabel && <span className="shrink-0">{label}</span>}
      <select
        className="field !py-1.5"
        value={value}
        aria-label={label}
        onChange={(e) => {
          const opt = options.find((o) => o.value === e.target.value);
          if (opt) router.push(opt.href);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
