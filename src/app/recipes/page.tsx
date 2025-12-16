import prisma from '@/lib/prisma'; // Adjust this path based on your setup
import RecipesList from '@/components/RecipesList';

export default async function RecipesListPage() {
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
  // console.log(RecipesListCall);

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

  return <RecipesList initialRecipes={cleanedRecipes} />;
}
