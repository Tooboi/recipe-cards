'use client';

type SafeRecipe = {
  id: string;
  title: string;
  user: { username: string | null };
};

export default function RecipeEdit({ recipe }: { recipe: SafeRecipe }) {
  return (
    <div>
      <h1>Edit Recipe: {recipe.title}</h1>
      <p>Created by: {recipe.user.username}</p>
    </div>
  );
}
