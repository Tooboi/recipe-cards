import prisma from "@/lib/prisma";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import CldImage from "@/components/wrappers/CldImageWrapper";
import BookmarkButton from "@/components/wrappers/BookmarkButton";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  format,
  differenceInYears,
} from "date-fns";

function formatDate(createdAt: string | Date | undefined) {
  if (!createdAt) {
    return "Unknown";
  }

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

export default async function RecipeDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const [b
  const clerkUser = await currentUser();

  let internalUserId: string | null = null;

  if (clerkUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true },
    });
    internalUserId = dbUser?.id || null;
  }

  const recipeId = (await params).id;

  const SingleRecipeById = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { user: true },
  });

  const isOwner = internalUserId && SingleRecipeById?.userId === internalUserId;

  return (
    <div className="sm:m-4 m-2">
      {/* MOBILE */}
      <div className=" bg-gray-400 border-gray-800  rounded-lg border-2 w-full flex flex-col h-max drop-shadow-md overflow-hidden">
        <div className="flex sm:hidden flex-col border-b-2 border-gray-700 overflow-hidden  bg-gray-300 hover:bg-gray-200 transition-colors group shadow-md hover:shadow-lg">
          <div className="flex flex-row">
            <div className="flex flex-col w-full">
              <div className="pl-2 bg-gray-200 border-b-2 border-gray-600 flex flex-row justify-between">
                <div className="flex flex-col h-full">
                  <p className="font-medium text-base/4 line-clamp-2 pt-1.5">
                    {SingleRecipeById?.title || "Recipe"}
                  </p>
                  <p className="text-gray-500 text-sm ">
                    {SingleRecipeById?.user.username}
                  </p>
                </div>
                <div className="pt-2 px-2">
                  <BookmarkButton recipeId={SingleRecipeById?.id || ""} />
                </div>
              </div>
              <div className="flex flex-row pt-2 px-2 ">
                {isOwner ? (
                  <div className="flex flex-row w-full justify-between">
                    <Link
                      className="w-max py-0.5 px-2 self-center rounded-md  border-2 border-gray-600 bg-gray-400 text-base font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
                      href={`/recipes/download/${recipeId}`}
                    >
                      DOWNLOAD
                    </Link>
                    <Link
                      className=" text-center py-0.5 px-2 self-center rounded-md border-2 border-gray-600 bg-gray-400 text-base font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
                      href={`/recipes/edit/${recipeId}`}
                    >
                      EDIT
                    </Link>
                  </div>
                ) : (
                  <div className="flex w-full justify-end">
                    <Link
                      className="w-max py-0.5 px-2  self-center rounded-md border-2 border-gray-600 bg-gray-400 text-base font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
                      href={`/recipes/download/${recipeId}`}
                    >
                      DOWNLOAD
                    </Link>
                  </div>
                )}
              </div>

              <div className="">
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
                      {formatDate(SingleRecipeById?.updatedAt)}
                    </span>
                  </span>
                  <div>
                    <span className="h-full py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center">
                      <div>
                        <span className="ml-1 line-clamp-1 text-end">
                          {SingleRecipeById?.serving}
                        </span>

                        <span className="ml-1 line-clamp-1 text-end">
                          {SingleRecipeById?.ingredients.length}{" "}
                          {SingleRecipeById?.ingredients.length === 1
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

        {/* DESKTOP */}
        <div className="hidden w-full bg-gray-300 py-2 px-4 border-b-2 border-gray-800 sm:flex justify-between items-center">
          <div className="flex flex-row">
            <BookmarkButton recipeId={SingleRecipeById?.id || ""} />
            <div className="flex flex-col px-3">
              <p className="text-2xl font-semibold">
                {SingleRecipeById?.title}
              </p>
              <p className="text-sm">
                By:{" "}
                <Link href={`/users/${SingleRecipeById?.userId}`}>
                  {SingleRecipeById?.user.username}
                </Link>
              </p>
              <p className="text-sm">Yield: {SingleRecipeById?.serving}</p>
            </div>
          </div>

          {/* Only show if the logged-in user owns this recipe */}
          {isOwner ? (
            <div className="items-center flex flex-col">
              <Link
                className="w-max py-1 px-2 self-center rounded-md mb-2 border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
                href={`/recipes/download/${recipeId}`}
              >
                DOWNLOAD
              </Link>
              <Link
                className="w-full text-center py-1 px-2 self-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
                href={`/recipes/edit/${recipeId}`}
              >
                EDIT
              </Link>
            </div>
          ) : (
            <Link
              className="w-max py-1 px-2 mr-2 self-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-800 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-300/50 hover:text-gray-800 active:bg-gray-400 active:text-gray-900 active:border-gray-600"
              href={`/recipes/download/${recipeId}`}
            >
              DOWNLOAD
            </Link>
          )}
        </div>
        <div className="px-4 pb-4">
          {SingleRecipeById?.imageId && SingleRecipeById?.imageId.length > 0 ? (
            <div className="h-full w-full flex ">
              <div className="mt-4">
                <CldImage
                  alt="Thumbnail"
                  src={SingleRecipeById?.imageId}
                  width="100"
                  height="100"
                  crop="fill"
                  aspectRatio="1:1"
                  sizes="100vw"
                  className="rounded-sm border-2 border-gray-800"
                />
              </div>
            </div>
          ) : (
            <div className=" h-full flex w-full">
              <Image
                className=" mt-4 rounded-sm border-2 border-gray-800 bg-gray-500/50"
                width={100}
                height={100}
                unoptimized
                src={`https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=${SingleRecipeById?.id}&backgroundType[]&backgroundColor=transparent`}
                alt={SingleRecipeById?.id ?? ""}
              />
            </div>
          )}
          <p className="pt-4 text-gray-700 pb-2">
            {SingleRecipeById?.description}
          </p>
          <h2 className="text-lg font-medium">Ingredients</h2>
          <ul className="list-disc list-inside text-sm mb-4">
            {SingleRecipeById?.ingredients?.map((ingredientStr, i) => {
              const [quantity = "", unit = "", item = ""] =
                ingredientStr.split("_");
              return (
                <li key={i}>
                  {quantity} {unit} {item}
                </li>
              );
            })}
          </ul>
          <h2 className="text-lg font-medium mt-4">Instructions</h2>
          <ol className="list-decimal list-outside ml-4 text-sm/4">
            {SingleRecipeById?.instructions.filter(Boolean).map((step, i) => (
              <li className="mb-2" key={i}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
