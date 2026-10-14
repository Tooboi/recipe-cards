import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RecipeDownload from "@/components/forms/RecipeDownload";
import prisma from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

async function getRecipe(id: string) {
  try {
    return await prisma.recipe.findUnique({ where: { id }, include: { user: true } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).id);
  return { title: recipe ? `Print ${recipe.title}` : "Recipe not found" };
}

export default async function DownloadRecipePage({ params }: Props) {
  const recipe = await getRecipe((await params).id);
  if (!recipe) notFound();
  return <RecipeDownload recipe={recipe} />;
}
