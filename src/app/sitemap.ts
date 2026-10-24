import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { CATEGORIES } from "@/lib/taxonomy";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recipecardvault.com";

// Rebuilt at most once an hour.
export const revalidate = 3600;

// Served at /sitemap.xml: home, browse, each category, and every public recipe.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await prisma.recipe
    .findMany({
      where: { hidden: false },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
    .catch(() => []);

  return [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/explore`, changeFrequency: "daily", priority: 0.8 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE}/explore?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...recipes.map((r) => ({
      url: `${SITE}/recipes/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
