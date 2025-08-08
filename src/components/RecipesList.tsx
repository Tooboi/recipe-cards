'use client';

import Link from 'next/link';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const daysDifference = differenceInDays(new Date(), date);

  if (daysDifference < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

interface RecipesListProps {
  initialRecipes: {
    id: string;
    title: string;
    description: string | null;
    ingredients: string[];
    instructions: string[];
    font: string;
    pdfSize: string;
    hidden: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: {
      username: string;
    };
  }[];
}

export default function RecipesList({ initialRecipes }: RecipesListProps) {
  return (
    <div className="overflow-hidden">
      <div className="px-6 pt-5 rounded-none">
        <div className="text-xl text-center mx-auto text-stone-900 w-full font-semibold">Explore Recent Recipes</div>
      </div>
      <div className="pt-2">
        {initialRecipes.length === 0 ? (
          <div className="text-center py-10 text-stone-500 italic">No recipes found. Create one now!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {initialRecipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
                <div className="px-4 py-2 border border-stone-600 rounded-lg bg-stone-300 hover:bg-stone-100 transition-colors group">
                  <div className="font-medium text-lg text-stone-900 group-hover:text-stone-700">{recipe.title || 'Recipe'}</div>
                  <div className="text-sm text-stone-600">{recipe.user.username}</div>
                  <div className="text-xs text-stone-600">{formatDate(recipe.updatedAt)}</div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-600">
                    <div className="flex items-center bg-stone-100 border border-stone-400 px-3 py-1 rounded-full">
                      <span className="font-medium mr-1">Ingredients:</span>
                      <span className="text-stone-600 font-medium">{recipe.ingredients.length}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
