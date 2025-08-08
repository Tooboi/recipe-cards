import prisma from '@/lib/prisma';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import Link from 'next/link';

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const daysDifference = differenceInDays(new Date(), date);

  if (daysDifference < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';



export default async function UserIDpage({ params }: { params: Promise<{ id: string }> }) {
  const selectedUser = (await params).id;
  console.log(selectedUser);

  const user = await prisma.user.findUnique({
    where: { id: selectedUser },
    include: {
      Recipe: true,
    },
  });

  console.log(user);

  return (
    <div>
      <div className="overflow-hidden pt-0">
        <div className="px-6 py-5 rounded-none">
          <div className="text-2xl text-stone-900 font-semibold text-center">{user?.username}&#39;s Recipes</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto px-6">
          {user?.Recipe.map((recipe) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
              <div className="px-4 py-2 border border-stone-600 rounded-lg bg-stone-300 hover:bg-stone-100 transition-colors group">
                <div className="font-medium text-lg text-stone-900 group-hover:text-stone-700">{recipe.title || 'Recipe'}</div>
                <div className="text-sm text-stone-600">{formatDate(recipe.updatedAt.toISOString())}</div>
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
      </div>
    </div>
  );
}
