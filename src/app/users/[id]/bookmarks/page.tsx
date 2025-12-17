import CldImageWrapper from "@/components/wrappers/CldImageWrapper";
// import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
// import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
// import { toggleBookmark } from '@/components/wrappers/BookmarkAction';
// import { getBookmarks } from '@/components/wrappers/GetBookmarks';
import prisma from "@/lib/prisma";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  format,
  differenceInYears,
} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "@/components/wrappers/BookmarkButton";

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const years = differenceInYears(now, date);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (years > 1) {
    return `${years} year ago`;
  }

  if (years > 2) {
    return `${years} years ago`;
  }

  return format(date, "MMM d, yyyy");
}

// type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';

export default async function UserIDpage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const selectedUser = (await params).id;

  if (!selectedUser) return <div>User ID not provided</div>;

  const user = await prisma.user.findUnique({
    where: { id: selectedUser },
    select: {
      username: true,
      bookmarkedRecipeIds: true,
    },
  });

  if (!user) return <div>User not found</div>;

  const bookmarkedRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: user.bookmarkedRecipeIds },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-2 sm:rounded-b-lg bg-gray-400 w-full md:w-1/2 mx-auto border-b-2 sm:border-x-2 border-gray-700">
        <div className="text-2xl text-center mx-auto text-gray-900 w-full font-semibold sm:mb-2">
          {user.username}&#39;s Bookmarks
        </div>
      </div>

      {bookmarkedRecipes.length === 0 ? (
        <>
          <div className="text-center py-4 text-gray-800 italic">
            No bookmarked recipes found.
          </div>
          <Link
            className="sm:mx-8 mx-6 flex sm:mb-4 rounded-lg border-gray-600 bg-gray-700 text-lg font-medium text-gray-300 transition-all"
            href="/new-recipe"
          >
            <h1 className="justify-center w-full text-center p-2 rounded-md border-2 border-gray-600 bg-gray-300 text-lg font-medium text-gray-900 transition-all hover:bg-gray-500 hover:text-gray-200 active:bg-gray-600 active:text-gray-300">
              MAKE NEW RECIPE CARD
            </h1>
          </Link>
        </>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 gap-2 sm:px-4 px-2 pt-2">
            {bookmarkedRecipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1 max-w-72">
                  <div className="h-full flex flex-col border-2 border-gray-600 overflow-hidden rounded-md bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">
                    <div className="flex justify-between items-start p-2">
                      <p className="font-medium text-lg/5 line-clamp-2 ">
                        {recipe.title || 'Recipe'}</p>
                      <div><BookmarkButton recipeId={recipe.id} /></div>

                    </div>
                    <div className="relative h-full">
                      {recipe.imageId ? (
                        <CldImageWrapper
                          alt="Thumbnail"
                          src={recipe.imageId}
                          width="100"
                          height="100"
                          crop="fill"
                          aspectRatio="1:1"
                          sizes="100vw"
                          className="mx-auto w-full h-full border-t-2 group-hover:brightness-110 transition-all border-gray-600 overflow-hidden"
                        />
                      ) : (
                        <div className='bg-gray-400/50 h-full flex w-full'>
                        <Image
                          className="w-full h-full grow border-t-2 border-gray-600"
                          width={100}
                          height={100}
                          unoptimized
                          src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
                          alt={recipe.id}
                        />
                        </div>
                      )}
                    </div>


                    <div className="px-2 py-2 flex flex-row items-center justify-between bg-gray-400 group-hover:bg-gray-400/70 transition-colors border-t-2 border-gray-600">
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
                        <span className="ml-1 hidden sm:block">{recipe.ingredients.length} Ingredients</span>
                        <span className="ml-1 sm:hidden block">{recipe.ingredients.length}</span>
                      </span>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
