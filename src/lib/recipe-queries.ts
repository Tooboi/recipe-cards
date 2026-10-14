import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CATEGORIES,
  SUGGESTED_TAGS,
  isCategory,
  normalizeTag,
  type SortOption,
} from "@/lib/taxonomy";

export type BrowseParams = {
  q: string;
  category: string;
  tag: string;
  sort: SortOption;
  page: number;
};

export const PAGE_SIZE = 12;

/** Reads /explore's query string into safe, normalized filters. */
export function parseBrowseParams(sp: Record<string, string | string[] | undefined>): BrowseParams {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  };
  const sort = one("sort");
  const page = Number.parseInt(one("page"), 10);
  return {
    q: one("q").slice(0, 80),
    category: isCategory(one("category")) ? one("category") : "",
    tag: normalizeTag(one("tag")),
    sort: (["newest", "top-rated", "most-rated", "a-z"] as const).includes(sort as SortOption)
      ? (sort as SortOption)
      : "newest",
    page: Number.isFinite(page) && page > 1 ? Math.min(page, 1000) : 1,
  };
}

/** Builds an /explore URL, keeping current filters unless overridden ("" removes one). */
export function browseHref(current: Partial<BrowseParams>, changes: Partial<BrowseParams> = {}) {
  const next = { ...current, ...changes };
  const qs = new URLSearchParams();
  if (next.q) qs.set("q", next.q);
  if (next.category) qs.set("category", next.category);
  if (next.tag) qs.set("tag", next.tag);
  if (next.sort && next.sort !== "newest") qs.set("sort", next.sort);
  if (next.page && next.page > 1) qs.set("page", String(next.page));
  const s = qs.toString();
  return s ? `/explore?${s}` : "/explore";
}

const ORDER: Record<SortOption, Prisma.RecipeOrderByWithRelationInput[]> = {
  newest: [{ updatedAt: "desc" }],
  "top-rated": [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { updatedAt: "desc" }],
  "most-rated": [{ ratingCount: "desc" }, { ratingAvg: "desc" }],
  "a-z": [{ title: "asc" }],
};

export async function searchRecipes(params: BrowseParams) {
  const { q, category, tag, sort, page } = params;
  const where: Prisma.RecipeWhereInput = {
    hidden: false,
    ...(category && { category }),
    ...(tag && { tags: { has: tag } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { tags: { has: normalizeTag(q) } },
        { user: { is: { username: { contains: q, mode: "insensitive" } } } },
      ],
    }),
  };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: ORDER[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({ where }),
  ]);
  return { recipes, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Most-used tags on public recipes, topped up with suggestions when the vault is small. */
export async function getPopularTags(max = 14) {
  const rows = await prisma.recipe
    .findMany({ where: { hidden: false }, select: { tags: true }, take: 1000, orderBy: { updatedAt: "desc" } })
    .catch(() => []);
  const counts = new Map<string, number>();
  for (const r of rows) for (const t of r.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  const popular = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  for (const t of SUGGESTED_TAGS) {
    if (popular.length >= max) break;
    if (!popular.includes(t)) popular.push(t);
  }
  return popular.slice(0, max);
}

/** Number of public recipes in each category. */
export async function getCategoryCounts() {
  const rows = await prisma.recipe
    .groupBy({ by: ["category"], where: { hidden: false }, _count: { _all: true } })
    .catch(() => []);
  const counts: Record<string, number> = {};
  for (const r of rows) if (r.category) counts[r.category] = r._count._all;
  return CATEGORIES.map((c) => ({ ...c, count: counts[c.slug] ?? 0 }));
}
