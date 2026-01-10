import { auth } from '@/auth';
import RecipeEdit from '@/components/forms/RecipeEdit';
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
  
  const session = await auth();
  const internalUserId = session?.user?.id ?? null;
  const isOwner = internalUserId && recipe?.userId === internalUserId;
  if (!isOwner) {
    return <div>You do not have permission to edit this recipe.</div>;
  }

  return (
    <div>
      <RecipeEdit recipe={recipe} />
    </div>
  );
}
