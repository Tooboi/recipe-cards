import Link from "next/link";
import prisma from "@/lib/prisma";
import RecipesList from "@/components/RecipesList";
import { toCardData } from "@/components/recipes/RecipeCard";
import CategoryArt from "@/components/recipes/CategoryArt";
import SearchBar from "@/components/browse/SearchBar";
import { getCategoryCounts, getPopularTags } from "@/lib/recipe-queries";
import { tagLabel } from "@/lib/taxonomy";

export default async function Home() {
  const include = { user: { select: { username: true } } } as const;
  const [latest, topRated, categories, tags] = await Promise.all([
    prisma.recipe.findMany({
      where: { hidden: false },
      include,
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.recipe
      .findMany({
        where: { hidden: false, ratingCount: { gte: 1 } },
        include,
        orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
        take: 3,
      })
      .catch(() => []),
    getCategoryCounts(),
    getPopularTags(8),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr] md:py-16">
          <div>
            <p className="eyebrow mb-3">The family recipe vault</p>
            <h1 className="font-serif text-4xl leading-tight font-bold text-ink md:text-5xl">
              Every recipe worth keeping, <em className="text-brand">safe in the vault.</em>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              Lock away the dishes your family asks for, share them with the people you love,
              and print any recipe as a full page or a classic 3×5 card.
            </p>
            <SearchBar size="lg" className="mt-6 max-w-xl" placeholder="What are you cooking?" />
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
              <span className="text-ink-soft">Try:</span>
              {tags.slice(0, 5).map((t) => (
                <Link
                  key={t}
                  href={`/explore?tag=${encodeURIComponent(t)}`}
                  className="rounded-full border border-line px-2.5 py-0.5 text-ink-soft transition-colors hover:border-brand hover:text-brand"
                >
                  {tagLabel(t)}
                </Link>
              ))}
            </div>
          </div>
          <HeroCards />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-10">
        <SectionHeader title="Browse by category" href="/explore" link="All recipes →" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/explore?category=${c.slug}`}
              className="group"
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-line transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CategoryArt id={`home-${c.slug}`} category={c.slug} size="sm" />
              </div>
              <p className="mt-2 text-center text-sm leading-tight font-semibold text-ink group-hover:text-brand">
                {c.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <SectionHeader title="Fresh in the Vault" href="/explore" link="See all →" />
        {latest.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">The vault is empty.</p>
            <p className="mt-2 text-ink-soft">Be the first to put a recipe inside.</p>
            <Link href="/new-recipe" className="btn-brand mt-6">
              Add a Recipe
            </Link>
          </div>
        ) : (
          <RecipesList recipes={latest.map((r) => toCardData(r))} />
        )}
      </section>

      {/* Top rated */}
      {topRated.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <SectionHeader title="Top rated" href="/explore?sort=top-rated" link="See more →" />
          <RecipesList recipes={topRated.map((r) => toCardData(r))} />
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-ink pb-2">
      <h2 className="section-title">{title}</h2>
      <Link href={href} className="shrink-0 pb-1 text-sm font-semibold whitespace-nowrap text-brand hover:underline">
        {link}
      </Link>
    </div>
  );
}

/** Decorative stack of index cards with a vault seal. */
function HeroCards() {
  return (
    <div className="relative mx-auto hidden h-64 w-full max-w-sm md:block" aria-hidden>
      <div className="absolute -right-2 -bottom-6 z-10 flex h-28 w-28 rotate-[-12deg] flex-col items-center justify-center rounded-full border-4 border-double border-brand bg-paper text-center text-brand shadow-md">
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Kept safe</span>
        <span className="font-serif text-lg leading-tight font-bold">in the</span>
        <span className="font-serif text-xl leading-none font-bold">Vault</span>
        <span className="mt-1 text-[9px] font-bold tracking-[0.2em] uppercase">No. 0001</span>
      </div>
      <div className="absolute inset-x-6 top-6 h-48 rotate-[-5deg] rounded-md border border-line bg-[#fdf9f1] shadow-md" />
      <div className="absolute inset-x-2 top-2 h-52 rotate-[3deg] rounded-md border border-line bg-paper p-5 shadow-lg">
        <p className="font-serif text-xl font-bold text-brand">Grandma&apos;s Apple Pie</p>
        <p className="text-xs text-ink-soft italic">From the kitchen of June · Serves 8</p>
        <div className="mt-2 h-px bg-[#d2504a]" />
        <div className="mt-0.5 h-px bg-[#9fb7d6]" />
        <div className="mt-3 grid grid-cols-[2fr_3fr] gap-4 text-[11px] leading-relaxed text-ink">
          <ul className="space-y-0.5">
            <li>• 6 tart apples</li>
            <li>• 3/4 cup sugar</li>
            <li>• 1 tsp cinnamon</li>
            <li>• 2 pie crusts</li>
          </ul>
          <ol className="space-y-0.5">
            <li>1. Heat oven to 425°F.</li>
            <li>2. Toss apples with sugar &amp; spice.</li>
            <li>3. Fill crust, top, crimp.</li>
            <li>4. Bake 45 min until golden.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
