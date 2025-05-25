import prisma from '@/lib/prisma';
import EditRecipeForm from '@/components/RecipeEdit';

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { user: true },
  });


  if (!recipe) return <div>Recipe not found</div>;

  return <EditRecipeForm initialData={recipe} />;
}
