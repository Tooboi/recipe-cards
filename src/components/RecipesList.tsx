'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const daysDifference = differenceInDays(new Date(), date);

  if (daysDifference < 7) {
    // Show relative time like "2 days ago"
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    // Show formatted date like "May 25, 2025"
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
    <div className="shadow-sm bg-white overflow-hidden border-0 pt-0">
      <div className="bg-slate-50 border-b px-6 py-5 rounded-none">
        <div className="text-xl text-slate-900">Recipes</div>
      </div>
      <div className="p-6">
        {initialRecipes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 italic">No recipes found. Create one now!</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {initialRecipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
                <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="font-medium text-lg text-slate-900 group-hover:text-slate-700">{recipe.title || 'Recipe'}</div>
                  <div className="text-sm text-slate-600 mt-1">{formatDate(recipe.updatedAt)}</div>
                  <div className="text-sm text-slate-600 mt-1">{recipe.user.username}</div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full">
                      <span className="font-medium mr-1">Ingredients:</span>
                      <span className="text-slate-600 font-medium">{recipe.ingredients.length}</span>
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
