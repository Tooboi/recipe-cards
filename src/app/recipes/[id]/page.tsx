import prisma from "@/lib/prisma";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
// import html2pdf from "html2pdf.js";
import Image from 'next/image';
import CldImage from "@/components/wrappers/CldImageWrapper";
// import { PhotoIcon } from "@heroicons/react/24/solid";

export default async function RecipeDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <div className="bg-gray-400 border-gray-800 flex-2/5 rounded-lg border-2 w-full flex flex-col h-max drop-shadow-md overflow-hidden">
        <div className="w-full bg-gray-300 py-2 px-4 border-b-2 border-gray-800 flex justify-between items-center">
          <div>
            <p className="text-2xl font-semibold">{SingleRecipeById?.title}</p>
            <p>
              By:{" "}
              <Link href={`/users/${SingleRecipeById?.userId}`}>
                {SingleRecipeById?.user.username}
              </Link>
            </p>
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
