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
  }));

  return (
    <div className="flex flex-col items-center">
      {/* <div className="flex w-full flex-col rounded-xl border-4 border-stone-600 bg-stone-700 py-4 transition-all sm:w-1/2">
        <h1 className="text-center text-3xl tracking-wide">Recipe Card Generator</h1>
      </div> */}
      <div className="flex w-full flex-col  pt-6 transition-all sm:w-1/2">
        <Link
          className=" mx-auto mb-4 justify-center rounded-lg border-stone-600 bg-stone-700 text-lg font-medium text-stone-300 transition-all  hover:bg-tertiary-950 hover:text-tertiary-500"
          href={"/new-recipe"}
        >
          <h1 className="text-center w-full mx-auto p-2 justify-center rounded-md border-2 border-stone-600 bg-stone-300 text-lg font-medium text-stone-900 transition-all hover:bg-stone-400/80 hover:text-stone-700 active:bg-stone-500 active:text-stone-900 ">
            MAKE NEW RECIPE CARD
          </h1>
        </Link>
      </div>
      <RecipesList initialRecipes={cleanedRecipes} />
    </div>
  );
}
