import type { Metadata } from "next";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import RecipeCard, { toCardData } from "@/components/recipes/RecipeCard";
import SearchBar from "@/components/browse/SearchBar";
import LinkSelect from "@/components/browse/LinkSelect";
import Pagination from "@/components/browse/Pagination";
import {
  PAGE_SIZE,
  browseHref,
  getCategoryCounts,
  getPopularTags,
  parseBrowseParams,
  searchRecipes,
} from "@/lib/recipe-queries";
import { SORT_OPTIONS, getCategory, tagLabel } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Browse the Vault" };

const TOP_TAGS = 8;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ExplorePage({ searchParams }: Props) {
  const params = parseBrowseParams(await searchParams);
  const [{ recipes, total, pages }, categories, allTags] = await Promise.all([
    searchRecipes(params),
    getCategoryCounts(),
    getPopularTags(TOP_TAGS + 24),
  ]);

  // Filter changes always go back to page 1.
  const to = (changes: Parameters<typeof browseHref>[1]) => browseHref(params, { page: 1, ...changes });

  const activeCategory = params.category ? getCategory(params.category) : null;
  const filtered = !!(params.q || params.category || params.tag);

  // Only the most-used tags are shown; the rest sit behind "More tags".
  const topTags = allTags.slice(0, TOP_TAGS);
  if (params.tag && !topTags.includes(params.tag)) topTags.push(params.tag);
  const moreTags = allTags.slice(TOP_TAGS).filter((t) => t !== params.tag);

  const first = total === 0 ? 0 : (params.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(params.page * PAGE_SIZE, total);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors ${
      active ? "border-ink bg-ink text-cream" : "border-line bg-paper text-ink hover:border-ink-soft"
    }`;
  const tagChip = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
      active
        ? "border-brand bg-brand text-white"
        : "border-line bg-paper text-ink-soft hover:border-brand hover:text-brand"
    }`;

  return (
    <div>
      {/* Title + search + categories */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6">
          <p className="eyebrow mb-1">Recipe Card Vault</p>
          <h1 className="font-serif text-3xl font-bold text-ink md:text-4xl">
            {activeCategory ? activeCategory.label : "Browse the Vault"}
          </h1>
          <SearchBar
            size="lg"
            placeholder="Search the vault…"
            className="mt-5 max-w-2xl"
            defaultValue={params.q}
            keep={{ category: params.category, tag: params.tag, sort: params.sort === "newest" ? "" : params.sort }}
          />

          {/* Phones: one compact dropdown */}
          <LinkSelect
            className="mt-4 sm:hidden"
            label="Category"
            value={params.category}
            options={[
              { value: "", label: "All categories", href: to({ category: "" }) },
              ...categories.map((c) => ({
                value: c.slug,
                label: c.count ? `${c.label} (${c.count})` : c.label,
                href: to({ category: c.slug }),
              })),
            ]}
          />

          {/* Larger screens: chips that wrap instead of running off the page */}
          <nav aria-label="Categories" className="mt-5 hidden flex-wrap gap-2 sm:flex">
            <Link href={to({ category: "" })} className={chip(!params.category)}>
              All
            </Link>
            {categories.map((c) => {
              const active = params.category === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={to({ category: active ? "" : c.slug })}
                  className={chip(active)}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border-2"
                    style={{ backgroundColor: c.tint, borderColor: c.ink }}
                    aria-hidden
                  />
                  {c.label}
                  {c.count > 0 && (
                    <span className={active ? "font-normal text-cream/70" : "font-normal text-ink-soft"}>
                      {c.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-6">
        {/* Top tags only; the long tail is tucked away */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-bold tracking-[0.12em] text-ink-soft uppercase">Popular tags</span>
          {topTags.map((t) => {
            const active = params.tag === t;
            return (
              <Link key={t} href={to({ tag: active ? "" : t })} className={tagChip(active)} aria-current={active ? "true" : undefined}>
                {tagLabel(t)}
              </Link>
            );
          })}
          {moreTags.length > 0 && (
            <details className="group relative">
              <summary className="cursor-pointer list-none rounded-full px-2 py-1 text-xs font-semibold text-brand hover:underline">
                <span className="group-open:hidden">More tags</span>
                <span className="hidden group-open:inline">Fewer tags</span>
              </summary>
              <div className="absolute left-0 z-20 mt-2 flex w-72 flex-wrap gap-1.5 rounded-lg border border-line bg-paper p-3 shadow-lg shadow-ink/10 sm:w-96">
                {moreTags.map((t) => (
                  <Link key={t} href={to({ tag: t })} className={tagChip(false)}>
                    {tagLabel(t)}
                  </Link>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Result summary + sort */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-ink">
              {total} {total === 1 ? "recipe" : "recipes"}
            </h2>
            {params.q && <ActivePill label={`“${params.q}”`} href={to({ q: "" })} />}
            {activeCategory && <ActivePill label={activeCategory.label} href={to({ category: "" })} />}
            {params.tag && <ActivePill label={tagLabel(params.tag)} href={to({ tag: "" })} />}
            {filtered && (
              <Link href="/explore" className="text-sm font-semibold text-brand hover:underline">
                Clear all
              </Link>
            )}
          </div>
          <LinkSelect
            label="Sort by"
            value={params.sort}
            options={SORT_OPTIONS.map((o) => ({ ...o, href: to({ sort: o.value }) }))}
          />
        </div>

        {/* Results */}
        {recipes.length === 0 ? (
          <div className="panel mt-8 px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">
              {total > 0 ? "There's nothing on this page." : "Nothing in the vault matches that."}
            </p>
            <p className="mt-2 text-ink-soft">
              {total > 0 ? "Head back to the first page." : "Try a different word, or clear a filter."}
            </p>
            <Link href={total > 0 ? to({}) : "/explore"} className="btn-outline mt-6">
              {total > 0 ? "Go to page 1" : "Show all recipes"}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r) => (
                <RecipeCard key={r.id} recipe={toCardData(r)} />
              ))}
            </div>
            <Pagination page={params.page} pages={pages} href={(n) => browseHref(params, { page: n })} />
            <p className="mt-3 text-center text-xs text-ink-soft">
              Showing {first}–{last} of {total}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ActivePill({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-0.5 pr-1.5 pl-2.5 text-xs font-semibold text-brand-dark hover:bg-brand/15"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <XMarkIcon className="h-3.5 w-3.5" />
    </Link>
  );
}
