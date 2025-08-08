import prisma from '@/lib/prisma'; // Adjust this path based on your setup
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server'

export default async function RecipeDetails({ params }: { params: Promise<{ id: string }> }) {
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
    where: {
      id: recipeId,
    },
    include: {
      user: true,
    },
  });

  const isOwner = internalUserId && SingleRecipeById?.userId === internalUserId;

  console.log(isOwner);
  

  return (
    <div className="bg-stone-300 border-stone-800 flex-2/5 rounded-lg border-2 w-full flex flex-col h-max py-4 px-6 drop-shadow-md">
      <p className="text-2xl font-semibold">{SingleRecipeById?.title}</p>
      <p>
        By: <Link href={`/users/${SingleRecipeById?.userId}`}>{SingleRecipeById?.user.username}</Link>{' '}
      </p>
      <p>{SingleRecipeById?.description}</p>

      <h2 className="text-lg font-medium mt-4">Ingredients</h2>
      <ul className="list-disc list-inside text-sm mb-4">
        {SingleRecipeById?.ingredients?.map((ingredientStr, i) => {
          const [quantity = '', unit = '', item = ''] = ingredientStr.split('_');
          return (
            <li key={i}>
              {quantity} {unit} {item}
            </li>
          );
        })}
      </ul>

      <h2 className="text-lg font-medium mt-4">Instructions</h2>
      <ol className="list-decimal list-inside text-sm">
        {SingleRecipeById?.instructions.filter(Boolean).map((step, i) => (
          <li className="mb-0" key={i}>
            {step}
          </li>
        ))}
      </ol>
      <Link
        className="mt-6 w-max p-2 justify-center rounded-md border-2 border-stone-600 bg-stone-200 text-lg font-medium text-stone-900 transition-all hover:border-2 hover:border-stone-500 hover:bg-stone-300 hover:text-stone-700 active:bg-stone-500 active:text-stone-900 active:border-stone-600"
        href={`/recipes/edit/${recipeId}`}
      >
        EDIT OR SAVE
      </Link>
    </div>
  );
}
