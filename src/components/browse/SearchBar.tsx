import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/** Plain GET form to /explore, so search works even before JavaScript loads. */
export default function SearchBar({
  defaultValue = "",
  keep = {},
  size = "md",
  placeholder = "Search recipes, tags or cooks…",
  className = "",
}: {
  defaultValue?: string;
  /** Other filters to carry along (category, tag, sort). */
  keep?: Record<string, string | undefined>;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  className?: string;
}) {
  const height = { sm: "h-9 text-sm", md: "h-11 text-base", lg: "h-14 text-base sm:text-lg" }[size];
  return (
    <form action="/explore" method="get" role="search" className={`relative ${className}`}>
      {Object.entries(keep).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null
      )}
      <MagnifyingGlassIcon
        className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft ${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`}
        aria-hidden
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="Search recipes"
        className={`w-full rounded-full border border-input bg-paper ${size === "sm" ? "pl-9" : "pl-11"} ${size === "lg" ? "pr-28" : "pr-4"} text-ink shadow-sm placeholder:text-ink-soft/60 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none ${height}`}
      />
      {size === "lg" && (
        <button type="submit" className="btn-brand absolute top-1.5 right-1.5 bottom-1.5 rounded-full px-5">
          Search
        </button>
      )}
    </form>
  );
}
