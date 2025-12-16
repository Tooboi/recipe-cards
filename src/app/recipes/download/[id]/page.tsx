import RecipeDownload from '@/components/RecipeDownload';
import prisma from '@/lib/prisma';

export default async function DownloadRecipePage({ params }: { params: Promise<{ id: string }> }) {
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
      <RecipeDownload recipe={recipe} />
    </div>
  );
}
