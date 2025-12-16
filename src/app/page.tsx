import Link from "next/link";
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
    imageId: recipe.imageId ?? '',
  }));

  return (
    <div className="flex flex-col items-center">
      {/* <div className="flex w-full flex-col rounded-xl border-4 border-gray-600 bg-gray-700 py-4 transition-all sm:w-1/2">
        <h1 className="text-center text-3xl tracking-wide">Recipe Card Generator</h1>
      </div> */}
      
      <RecipesList initialRecipes={cleanedRecipes} />
    </div>
  );
}
