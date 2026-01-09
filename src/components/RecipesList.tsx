"use client";

import Link from "next/link";
import {
  differenceInMinutes,
  differenceInHours,
  format,
} from "date-fns";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
// import Avatar from "boring-avatars";
// import { toggleBookmark } from './wrappers/BookmarkAction';
// import { useState } from 'react';
// import { useEffect } from 'react';
// import { getBookmarks } from './wrappers/GetBookmarks';
// import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }


  return format(date, "M/d/yy");
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
    serving: string;
  }[];
}

export default function RecipesList({ initialRecipes }: RecipesListProps) {
  // const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  // useEffect(() => {
  //   async function fetchBookmarks() {
  //     try {
  //       const bookmarkedIds = await getBookmarks();
  //       const map: Record<string, boolean> = {};
  //       bookmarkedIds.forEach((id: string) => {
  //         map[id] = true;
  //       });
  //       setBookmarks(map);
  //     } catch (error) {
  //       console.error('Failed to fetch bookmarks', error);
  //     }
  //   }

  //   fetchBookmarks();
  // }, []);
  return (
    <div className="flex flex-col">
      <div className="overflow-hidden ">
        <div className="px-6 py-2 sm:rounded-b-lg bg-gray-400 w-full md:w-1/2 mx-auto border-b-2 sm:border-x-2 border-gray-700">
          <div className="text-2xl text-center mx-auto text-gray-900 w-full font-semibold sm:mb-2 mb-1">
            Explore Recent Recipes
          </div>
          <Link
            className="sm:mx-8 mx-6 flex sm:mb-4 rounded-lg border-gray-600 bg-gray-700 text-lg font-medium text-gray-300 transition-all "
            href={"/new-recipe"}
          >
            <h1 className="justify-center w-full text-center p-2  rounded-md border-2 border-gray-600 bg-gray-300 text-lg font-medium text-gray-900 transition-all hover:bg-gray-500 hover:text-gray-200 active:bg-gray-600 active:text-gray-300 ">
              MAKE NEW RECIPE CARD
            </h1>
          </Link>
        </div>
        <div className="pt-2 flex sm:justify-center">
          {initialRecipes.length === 0 ? (
            <div className="text-center py-10 text-gray-500 italic">
              No recipes found. Create one now!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 gap-2 px-4 w-full sm:w-max">
              {initialRecipes.map((recipe) => (
                <Link
                  href={`/recipes/${recipe.id}`}
                  key={recipe.id}
                  className="block col-span-1 w-full sm:max-w-72"
                >
                  <div className="sm:h-full flex sm:hidden flex-col border-2 border-gray-600 overflow-hidden rounded-md bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">
                    <div className="flex flex-row">
                      <div className="w-1/4">
                        {recipe.imageId && recipe.imageId.length > 0 ? (
                          <div className="h-full w-full flex ">
                            <div className="overflow-hidden mx-auto">
                              <CldImage
                                alt="Thumbnail"
                                src={recipe.imageId}
                                width="100"
                                height="100"
                                crop="fill"
                                aspectRatio="1:1"
                                sizes="100vw"
                                className="mx-auto w-full h-full border-r-2 group-hover:brightness-110 transition-all border-gray-600 overflow-hidden"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-400/50 h-full flex w-full">
                            <Image
                              className="w-full h-full grow border-r-2 border-gray-600 "
                              width={100}
                              height={100}
                              unoptimized
                              src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
                              alt={recipe.id}
                            />
                          </div>
                        )}
                      </div>
                      <div className=" w-3/4 flex flex-col ">
                        <div className="pl-2  bg-gray-200 border-b-2 border-gray-600 h-1/2">
                          <div className="flex flex-col ">
                            <p className="font-medium text-md/5 line-clamp-1 ">
                              {recipe.title || "Recipe"}
                            </p>
                            <p className="text-gray-500 text-sm -mt-1">
                              {recipe.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="h-1/2">
                          <div className="flex justify-between h-full">
                            <span className=" py-1 pl-1 h-full text-xs font-regular text-gray-900 mr-1 flex flex-row items-end">
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
                              <span className="ml-1">
                                {formatDate(recipe.updatedAt)}
                              </span>
                            </span>
                            <div>
                              <span className="h-full py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
                                <div>
                                  <span className="ml-1 line-clamp-1 text-end">
                                    {recipe.serving}
                                  </span>

                                  <span className="ml-1 line-clamp-1 text-end">
                                    {recipe.ingredients.length}{" "}
                                    {recipe.ingredients.length === 1
                                      ? "Ingredient"
                                      : "Ingredients"}
                                  </span>
                                </div>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:h-full sm:flex flex-col border-2 border-gray-600 overflow-hidden rounded-md bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">
                    <div className=" flex justify-between items-start p-2">
                      <div className="flex flex-col">
                        <p className="font-medium text-lg/5 line-clamp-1 ">
                          {recipe.title || "Recipe"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {recipe.user.username}
                        </p>
                      </div>
                      {/* <button
                        className=" transition-colors"
                        onClick={async (e) => {
                          e.preventDefault();
                          setBookmarks(prev => ({
                            ...prev,
                            [recipe.id]: !prev[recipe.id],
                          }));

                          try {
                            await toggleBookmark(recipe.id);
                          } catch {
                            // rollback on error
                            setBookmarks(prev => ({
                              ...prev,
                              [recipe.id]: !prev[recipe.id],
                            }));
                          }
                        }}
                      >
                        {bookmarks[recipe.id] ? (
                          <BookmarkSolidIcon className="w-9 h-10 text-amber-600 hover:text-amber-500 bg-amber-400 hover:bg-amber-300  border-2 border-amber-600 hover:stroke-2 hover:stroke-amber-600 hover:border-amber-300 rounded-sm p-1 transition-all active:scale-95 active:drop-shadow-none drop-shadow-sm" />
                        ) : (
                          <BookmarkSolidIcon className="w-9 h-10 text-gray-700 bg-gray-400 hover:text-amber-900 hover:stroke-2 hover:stroke-amber-600 hover:infill-amber-500 rounded-sm p-1 transition-all active:scale-95 active:drop-shadow-none drop-shadow-sm" />
                        )}
                      </button> */}
                    </div>
                    <div className="relative h-full">
                      {recipe.imageId && recipe.imageId.length > 0 ? (
                        <div className="h-full w-full flex ">
                          <div className="overflow-hidden mx-auto">
                            <CldImage
                              alt="Thumbnail"
                              src={recipe.imageId}
                              width="100"
                              height="100"
                              crop="fill"
                              aspectRatio="1:1"
                              sizes="100vw"
                              className="mx-auto w-full h-full border-t-2 group-hover:brightness-110 transition-all border-gray-600 overflow-hidden"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-400/50 h-full flex w-full">
                          {/* <Avatar
                            name={recipe?.id}
                            variant="pixel"
                            size={256}
                            square
                            colors={[
                              "#d1d5db",
                              "#4b5563",
                              // "#111827",
                              // "#030712",
                            ]}
                          /> */}
                          <Image
                            className="w-full h-full grow border-t-2 border-gray-600 "
                            width={100}
                            height={100}
                            unoptimized
                            src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${recipe.id}&backgroundType[]&backgroundColor=transparent`}
                            alt={recipe.id}
                          />
                        </div>
                      )}
                      {/* <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBookmark(recipe.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-sm bg-yellow-600 border-2 border-gray-700 hover:bg-gray-800"
                      >
                        <svg className="w-4 h-4 text-yellow-400" />
                      </button> */}

                      {/* <div >
                      <div
                        className="text-xs absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
                        Cooking
                      </div>
                    </div> */}
                    </div>
                    <div className=" px-2 py-1 flex flex-row items-center justify-between bg-gray-400 group-hover:bg-gray-400/70 transition-colors border-t-2 border-gray-600">
                      <span className="py-1 h-full text-xs font-regular text-gray-900 mr-1 flex flex-row items-end">
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
                        <span className="ml-1">
                          {formatDate(recipe.updatedAt)}
                        </span>
                      </span>
                      <span className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
                        <div>
                          <span className="ml-1 hidden sm:block line-clamp-1 text-end">
                            {recipe.serving}
                          </span>
                          <span className="ml-1 line-clamp-1 text-end">
                            {recipe.ingredients.length}{" "}
                            {recipe.ingredients.length === 1
                              ? "Ingredient"
                              : "Ingredients"}
                          </span>
                        </div>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
