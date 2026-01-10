import CldImageWrapper from '@/components/wrappers/CldImageWrapper';
// import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
// import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
// import { toggleBookmark } from '@/components/wrappers/BookmarkAction';
// import { getBookmarks } from '@/components/wrappers/GetBookmarks';
import prisma from '@/lib/prisma';
import {
  differenceInMinutes,
  differenceInHours,
  format,
} from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
// import BookmarkButton from '@/components/wrappers/BookmarkButton';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }



  return format(date, 'M/d/yy');
}

// type SortOption = 'recent' | 'oldest' | 'title-asc' | 'title-desc';



export default async function UserIDpage({ params }: { params: Promise<{ id: string }> }) {

  const selectedUser = (await params).id;
  const session = await auth();

  if (!session?.user) redirect("/")

  const user = await prisma.user.findUnique({
    where: { id: selectedUser },
    include: {
      Recipe: {
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  });


  return (

    <div className="overflow-hidden">
      <div className="px-6 py-2 sm:rounded-b-lg bg-slate-400 w-full md:w-1/2 mx-auto border-b-2 sm:border-x-2 border-slate-700">
        <div className="text-2xl text-center mx-auto text-slate-900 w-full font-semibold sm:mb-2">{user?.username}&#39;s Recipes</div>
      </div>
      {user?.Recipe.length === 0 ?
        (
          <>
            <div className="text-center py-4 text-slate-800 italic">No recipes found. Create one now!</div>
            <Link
              className="sm:mx-8 mx-6  flex sm:mb-4 rounded-lg border-slate-600 bg-slate-700 text-lg font-medium text-slate-300 transition-all "
              href={"/new-recipe"}
            >
              <h1 className="justify-center w-full text-center p-2  rounded-md border-2 border-slate-600 bg-slate-300 text-lg font-medium text-slate-900 transition-all hover:bg-slate-500 hover:text-slate-200 active:bg-slate-600 active:text-slate-300 ">
                MAKE NEW RECIPE CARD
              </h1>
            </Link>
          </>
        ) : (
          <div className='flex justify-center'>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 gap-2 sm:px-4 px-2 pt-2">
              {user?.Recipe.map((recipe) => (
                <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1 max-w-72">
                  
                  <div className="h-full flex flex-col border-2 border-slate-600 overflow-hidden rounded-md bg-slate-300 hover:bg-slate-200 transition-colors group shadow-md hover:shadow-lg">
                    <div className="flex justify-between items-start p-2">
                      <p className="font-medium text-lg/5 line-clamp-2 ">
                        {recipe.title || 'Recipe'}</p>

                      {/* <div><BookmarkButton recipeId={recipe.id} /></div> */}

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
                          className="mx-auto w-full h-full border-t-2 group-hover:brightness-110 transition-all border-slate-600 overflow-hidden"
                        />
                      ) : (
                        <div className='bg-slate-400/50 h-full flex w-full'>
                        <Image
                          className="w-full h-full grow border-t-2 border-slate-600"
                          width={100}
                          height={100}
                          unoptimized
                          src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
                          alt={recipe.id}
                        />
                        </div>
                      )}
                    </div>


                    <div className=" px-2 py-1 flex flex-row items-center justify-between bg-slate-400 group-hover:bg-slate-400/70 transition-colors border-t-2 border-slate-600">
                      <span className="py-1 h-full text-xs font-regular text-slate-900 mr-1 flex flex-row items-end">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="size-4"
                        >
                          <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 8.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 9.5A.75.75 0 1 0 8 11a.75.75 0 0 0 0-1.5Z" />
                          <path
                            fillRule="evenodd"
                            d="M4.75 1a.75.75 0 0 0-.75.75V3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2V1.75a.75.75 0 0 0-1.5 0V3h-5V1.75A.75.75 0 0 0 4.75 1ZM3.5 7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-1">{formatDate(recipe.updatedAt.toISOString())}</span>
                      </span>
                      <span className="py-1 text-xs font-regular text-slate-900 mr-1 flex flex-row items-center">
                        <div>
                          <span className="ml-1 hidden sm:block line-clamp-1">
                            Yield: {recipe.serving}
                          </span>
                          <span className="ml-1 sm:hidden block line-clamp-1">
                            {recipe.serving}
                          </span>
                          <span className="ml-1 hidden sm:block line-clamp-1">
                            {recipe.ingredients.length} Ingredients
                          </span>
                          <span className="ml-1 sm:hidden block line-clamp-1">
                            {recipe.ingredients.length} Items
                          </span>
                        </div>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}</div>
          </div>
        )}
    </div>

  );
}
{/* <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
              <div className="px-4 py-2 border border-slate-600 rounded-lg bg-slate-300 hover:bg-slate-100 transition-colors group">
                <div className="font-medium text-lg text-slate-900 group-hover:text-slate-700">{recipe.title || 'Recipe'}</div>
                <div className="text-sm text-slate-600">{formatDate(recipe.updatedAt.toISOString())}</div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center bg-slate-100 border border-slate-400 px-3 py-1 rounded-full">
                    <span className="font-medium mr-1">Ingredients:</span>
                    <span className="text-slate-600 font-medium">{recipe.ingredients.length}</span>
                  </div>
                </div>
              </div>
            </Link> */}