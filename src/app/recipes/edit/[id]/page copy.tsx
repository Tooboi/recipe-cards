import { getRecipeById } from '@/actions/recipes'; // adjust path as needed
import RecipeForm from '@/components/RecipeForm'; // use the same form as create page
import { getCurrentUser } from '@/lib/auth'; // adjust path as needed

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return <div>You must be logged in to edit recipes.</div>;

  const recipe = await getRecipeById(params.id);

  if (!recipe) return <div>Recipe not found</div>;
  if (recipe.userId !== user.id) return <div>You do not have permission to edit this recipe.</div>;

  return <RecipeForm initialData={recipe} mode="edit" />;
}
