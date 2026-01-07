/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import prisma from '@/lib/prisma';
import { getServerSession  } from "next-auth/react";

export async function getBookmarks() {
    const { data: session } = getServerSession ();
  const AuthUser = session?.user;
  if (!AuthUser?.id) throw new Error('Not logged in');

  const user = await prisma.user.findUnique({
    where: { id: AuthUser.id },
    select: { bookmarkedRecipeIds: true } as any,
  });

  return (user as any)?.bookmarkedRecipeIds ?? [];
}

export async function getBookmarkedRecipes() {
  const { data: session } = useSession();
  const AuthUser = session?.user;
  if (!AuthUser?.id) throw new Error('Not logged in');

  const user = await prisma.user.findUnique({
    where: { id: AuthUser.id },
    select: { bookmarkedRecipeIds: true },
  });

  const bookmarkedIds = user?.bookmarkedRecipeIds ?? [];

  if (bookmarkedIds.length === 0) return [];

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: bookmarkedIds } },
    include: { user: true }, // include author info
  });

  return recipes;
}