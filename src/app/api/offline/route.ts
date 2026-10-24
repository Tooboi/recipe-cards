import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const MAX_RECIPES = 300;

/** Pages the installed app downloads ahead of time: your recipes and the ones you saved. */
export async function GET() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ user: null, urls: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = await prisma.user
    .findUnique({ where: { id }, select: { bookmarkedRecipeIds: true } })
    .catch(() => null);

  const recipes = await prisma.recipe
    .findMany({
      where: {
        OR: [
          { userId: id },
          { id: { in: user?.bookmarkedRecipeIds ?? [] }, hidden: false },
        ],
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_RECIPES,
    })
    .catch(() => []);

  const urls = [
    "/me",
    "/me?tab=saved",
    `/users/${id}`,
    `/users/${id}/bookmarks`,
    ...recipes.map((r) => `/recipes/${r.id}`),
  ];
  return NextResponse.json({ user: id, urls }, { headers: { "Cache-Control": "no-store" } });
}

export const dynamic = "force-dynamic";
