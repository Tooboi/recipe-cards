// import Link from "next/link";
import prisma from '@/lib/prisma'; // Adjust this path based on your setup
import RecipesList from '@/components/RecipesList';


export default async function Home() {
  const RecipesListCall = await prisma.recipe.findMany({
    take: 12,
    where: {
      hidden: false,
    },
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const cleanedRecipes = RecipesListCall.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? '',
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    font: recipe.font,
    pdfSize: recipe.pdfSize,
    hidden: recipe.hidden,
    userId: recipe.userId,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    user: {
      username: recipe.user.username ?? 'Unknown',
    },
  }));

  return (
    <div className="flex flex-col items-center">
      <RecipesList initialRecipes={cleanedRecipes} />
    </div>
  );
}
