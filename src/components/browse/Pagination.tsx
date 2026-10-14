import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/** Page numbers with first/last and neighbours: ‹ 1 … 4 5 6 … 20 › */
export default function Pagination({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;

  const nums = new Set([1, pages, page - 1, page, page + 1]);
  const list = [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  list.forEach((n, i) => {
    if (i > 0 && n - list[i - 1] > 1) items.push("gap");
    items.push(n);
  });

  const box =
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors sm:h-10 sm:min-w-10 sm:px-3";

  return (
    <nav aria-label="Pages" className="mt-10 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${box} border-line bg-paper text-ink hover:border-brand hover:text-brand`} aria-label="Previous page">
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className={`${box} border-line text-ink-soft/40`} aria-hidden>
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Prev</span>
        </span>
      )}

      {items.map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-0.5 text-ink-soft sm:px-1" aria-hidden>
            …
          </span>
        ) : n === page ? (
          <span key={n} className={`${box} border-ink bg-ink text-cream`} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={`${box} border-line bg-paper text-ink hover:border-brand hover:text-brand`}>
            {n}
          </Link>
        )
      )}

      {page < pages ? (
        <Link href={href(page + 1)} className={`${box} border-line bg-paper text-ink hover:border-brand hover:text-brand`} aria-label="Next page">
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className={`${box} border-line text-ink-soft/40`} aria-hidden>
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
