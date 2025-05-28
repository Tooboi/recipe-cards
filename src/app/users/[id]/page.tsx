import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import Link from 'next/link';

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
      <Card className="shadow-sm bg-white overflow-hidden border-0 pt-0">
        <CardHeader className="bg-slate-50 border-b px-6 py-5 rounded-none">
          <CardTitle className="text-xl text-slate-900">{user?.username}&#39;s Recipes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {user?.Recipe.map((recipe) => (
            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1 pb-2">
              <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="font-medium text-lg text-slate-900 group-hover:text-slate-700">{recipe.title || 'Recipe'}</div>
                <div className="text-sm text-slate-600 mt-1">{formatDate(recipe.updatedAt.toISOString())}</div>
                <div className="text-sm text-slate-600 mt-1">{user.username}</div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full">
                    <span className="font-medium mr-1">Ingredients:</span>
                    <span className="text-slate-600 font-medium">{recipe.ingredients.length}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
