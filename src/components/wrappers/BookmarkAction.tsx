/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function toggleBookmark(recipeId: string) {
  const session = await auth();
  const AuthUser = session?.user;
  if (!AuthUser?.id) throw new Error('Not logged in');

  // find internal user id and current bookmarks
  const user = await prisma.user.findUnique({
    where: { id: AuthUser.id },
    // cast to any because bookmarkedRecipeIds isn't present in the generated types
    select: { id: true, bookmarkedRecipeIds: true } as any,
  });

  if (!user) throw new Error('User not found');

  const bookmarkedIds: string[] = (user as any).bookmarkedRecipeIds ?? [];
  const alreadyBookmarked = bookmarkedIds.includes(recipeId);

  let updated: string[];
  if (alreadyBookmarked) {
    // remove the recipe id
    updated = bookmarkedIds.filter((id: string) => id !== recipeId);
  } else {
    // add the recipe id
    updated = [...bookmarkedIds, recipeId];
  }

  await prisma.user.update({
    where: { id: (user as any).id },
    data: { bookmarkedRecipeIds: updated } as any,
  });

  return { bookmarked: !alreadyBookmarked, updated };
}
