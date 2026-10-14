import RecipeCard, { type RecipeCardData } from "@/components/recipes/RecipeCard";

/** Responsive grid of recipe cards. */
export default function RecipesList({ recipes }: { recipes: RecipeCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
