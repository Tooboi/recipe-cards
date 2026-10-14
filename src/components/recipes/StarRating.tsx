/** Read-only 5-star display with partial stars (e.g. 4.3 ★). */
const STAR =
  "M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z";

export default function StarRating({
  value,
  count,
  size = "sm",
  showCount = true,
  className = "",
}: {
  value: number | null | undefined;
  count?: number | null;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}) {
  const avg = Math.max(0, Math.min(5, value ?? 0));
  const n = count ?? 0;
  const px = { sm: 14, md: 18, lg: 22 }[size];
  const text = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${text} ${className}`}
      title={n ? `${avg.toFixed(1)} out of 5 from ${n} rating${n === 1 ? "" : "s"}` : "No ratings yet"}
    >
      <span className="relative inline-flex" aria-hidden>
        <Stars px={px} className="text-line" />
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${(avg / 5) * 100}%` }}>
          <Stars px={px} className="text-[#e0a526]" />
        </span>
      </span>
      <span className="sr-only">
        {n ? `Rated ${avg.toFixed(1)} out of 5 by ${n} people` : "No ratings yet"}
      </span>
      {showCount && (
        <span className="text-ink-soft" aria-hidden>
          {n ? (
            <>
              <span className="font-semibold text-ink">{avg.toFixed(1)}</span> ({n})
            </>
          ) : (
            "No ratings yet"
          )}
        </span>
      )}
    </span>
  );
}

function Stars({ px, className }: { px: number; className: string }) {
  return (
    <span className={`flex shrink-0 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" width={px} height={px} fill="currentColor" className="shrink-0">
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

export { STAR };
