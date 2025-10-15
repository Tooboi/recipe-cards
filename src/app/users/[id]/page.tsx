import prisma from '@/lib/prisma';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import Image from 'next/image';
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

// type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';



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
    <div className='flex flex-col items-center'>
      <div className="overflow-hidden">
        <div className="px-6 py-5 rounded-none">
          <div className="text-2xl text-gray-900 font-semibold text-center">{user?.username}&#39;s Recipes</div>
        </div>
        
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
    {user?.Recipe.map((recipe) => (
      <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
        <div className="h-full flex flex-col border-2 border-gray-600 overflow-hidden rounded-md bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">
          <div className="relative">
            <Image
              className="w-full"
              width={100}
              height={100}
              unoptimized
              src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
              alt={recipe.id}
            />
          </div>
          <div className="px-3 pb-2 flex-grow">
            <p className="font-medium text-lg line-clamp-2">
              {recipe.title || 'Recipe'}
            </p>
          </div>
          <div className="px-2 py-2 flex flex-row items-center justify-between bg-gray-400 group-hover:bg-gray-300 transition-colors border-t-2 border-gray-600">
            <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 8.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 9.5A.75.75 0 1 0 8 11a.75.75 0 0 0 0-1.5Z" />
                <path fillRule="evenodd" d="M4.75 1a.75.75 0 0 0-.75.75V3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2V1.75a.75.75 0 0 0-1.5 0V3h-5V1.75A.75.75 0 0 0 4.75 1ZM3.5 7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7Z" clipRule="evenodd" />
              </svg>
              <span className="ml-1">{formatDate(recipe.updatedAt.toISOString())}</span>
            </span>
            <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                <path d="M3 4.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM6.25 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 7.25a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM6.25 11.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM4 12.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
              </svg>
              <span className="ml-1">{recipe.ingredients.length} Ingredients</span>
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>

      </div>
    
  );
}
{/* <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
              <div className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-300 hover:bg-gray-100 transition-colors group">
                <div className="font-medium text-lg text-gray-900 group-hover:text-gray-700">{recipe.title || 'Recipe'}</div>
                <div className="text-sm text-gray-600">{formatDate(recipe.updatedAt.toISOString())}</div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center bg-gray-100 border border-gray-400 px-3 py-1 rounded-full">
                    <span className="font-medium mr-1">Ingredients:</span>
                    <span className="text-gray-600 font-medium">{recipe.ingredients.length}</span>
                  </div>
                </div>
              </div>
            </Link> */}