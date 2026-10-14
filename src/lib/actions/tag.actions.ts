"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export type TagCount = { tag: string; count: number };

/** Every tag already in use (public recipes plus your own), most-used first. */
export async function getExistingTags(): Promise<TagCount[]> {
  const session = await auth();
  const userId = session?.user?.id;
  const rows = await prisma.recipe
    .findMany({
      where: userId ? { OR: [{ hidden: false }, { userId }] } : { hidden: false },
      select: { tags: true },
      take: 2000,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  const counts = new Map<string, number>();
  for (const r of rows) for (const t of r.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
