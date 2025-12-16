'use client';

import Link from 'next/link';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';

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
    imageId: string | null;
  }[];
}



export default function RecipesList({ initialRecipes }: RecipesListProps) {
  return (
    <div className="overflow-hidden ">
      <div className="px-6 pt-5 rounded-none">
        <div className="text-2xl text-center mx-auto text-gray-900 w-full font-semibold mb-2">Explore Recent Recipes</div>
      </div>
      <div className="pt-2">
        {initialRecipes.length === 0 ? (
          <div className="text-center py-10 text-gray-500 italic">No recipes found. Create one now!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
            {initialRecipes.map((recipe) => (
              <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block col-span-1">
                <div className="h-full flex flex-col border-2 border-gray-600 overflow-hidden rounded-md bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">

                  <div className="relative">
                    {recipe.imageId && recipe.imageId.length > 0 ? (
                      <div className="h-full w-full flex ">
                        <div className=" overflow-hidden mx-auto">
                          <CldImage
                            alt="Thumbnail"
                            src={recipe.imageId}
                            width="100"
                            height="100"
                            crop="fill"
                            aspectRatio="1:1"
                            sizes="100vw"
                            className="mx-auto w-72 h-72 border-b-2 border-gray-600 overflow-hidden"
                          />
                        </div>
                      </div>
                      
                    ) : (
                      <Image
                        className="w-full"
                        width={100}
                        height={100}
                        unoptimized
                        src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
                        alt={recipe.id}
                      />
                    )}
                    {/* <div >
                      <div
                        className="text-xs absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
                        Cooking
                      </div>
                    </div> */}
                  </div>
                  <div className="px-3 py-2 flex-grow">
                    <p className="font-medium text-lg line-clamp-2">
                      {recipe.title || 'Recipe'}</p>
                    <p className="text-gray-500 text-sm">
                      {recipe.user.username}
                    </p>
                  </div>
                  <div className=" px-2 py-2 flex flex-row items-center justify-between bg-gray-400 group-hover:bg-gray-300 transition-colors border-t-2 border-gray-600">
                    <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                        <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 8.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 9.5A.75.75 0 1 0 8 11a.75.75 0 0 0 0-1.5Z" />
                        <path fillRule="evenodd" d="M4.75 1a.75.75 0 0 0-.75.75V3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2V1.75a.75.75 0 0 0-1.5 0V3h-5V1.75A.75.75 0 0 0 4.75 1ZM3.5 7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7Z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-1">{formatDate(recipe.updatedAt)}</span>
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
        )}
      </div>
    </div>
  );
}
