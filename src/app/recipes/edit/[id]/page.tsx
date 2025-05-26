import RecipeEdit from '@/components/RecipeEdit';
import prisma from '@/lib/prisma';

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!recipe) {
    return <div>Recipe not found.</div>;
  }

  return (
    <div>
      <RecipeEdit recipe={recipe} />
    </div>
  );
}
