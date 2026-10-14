"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export type RatingSummary = { average: number; count: number; mine: number | null };

/** Saves (or changes) the signed-in user's 1–5 star rating and refreshes the recipe's totals. */
export async function rateRecipe(recipeId: string, value: number): Promise<RatingSummary> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Sign in to rate recipes");

  const stars = Math.round(Number(value));
  if (!(stars >= 1 && stars <= 5)) throw new Error("Ratings are 1 to 5 stars");

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { userId: true, hidden: true },
  });
  if (!recipe || recipe.hidden) throw new Error("Recipe not found");
  if (recipe.userId === userId) throw new Error("You can't rate your own recipe");

  await prisma.rating.upsert({
    where: { recipeId_userId: { recipeId, userId } },
    create: { recipeId, userId, value: stars },
    update: { value: stars },
  });

  const summary = await refreshRatingTotals(recipeId);
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath("/explore");
  return { ...summary, mine: stars };
}

export async function getMyRating(recipeId: string): Promise<number | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const rating = await prisma.rating
    .findUnique({ where: { recipeId_userId: { recipeId, userId } }, select: { value: true } })
    .catch(() => null);
  return rating?.value ?? null;
}

async function refreshRatingTotals(recipeId: string) {
  const agg = await prisma.rating.aggregate({
    where: { recipeId },
    _avg: { value: true },
    _count: { value: true },
  });
  const average = Math.round((agg._avg.value ?? 0) * 100) / 100;
  const count = agg._count.value;
  await prisma.recipe.update({
    where: { id: recipeId },
    data: { ratingAvg: average, ratingCount: count },
  });
  return { average, count };
}
