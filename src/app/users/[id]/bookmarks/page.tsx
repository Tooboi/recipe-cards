import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { toCardData } from "@/components/recipes/RecipeCard";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import DensityToggle from "@/components/browse/DensityToggle";
import { getDensity } from "@/lib/density";

export default async function BookmarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const selectedUser = (await params).id;
  const session = await auth();
  const density = await getDensity();

  const user = await prisma.user
    .findUnique({
      where: { id: selectedUser },
      select: { username: true, bookmarkedRecipeIds: true },
    })
    .catch(() => null);

  if (!user) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-ink-soft">Cook not found.</p>;
  }

  const isMe = session?.user?.id === selectedUser;
  const bookmarkedRecipes = await prisma.recipe.findMany({
    where: {
      id: { in: user.bookmarkedRecipeIds },
      // Someone else's private recipes stay private even if bookmarked earlier.
      OR: [{ hidden: false }, ...(session?.user?.id ? [{ userId: session.user.id }] : [])],
    },
    include: { user: { select: { username: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="eyebrow mb-1">Saved recipes</p>
          <h1 className="font-serif text-3xl font-bold text-ink md:text-4xl">
            {isMe ? "Your saved recipes" : `${user.username}'s saved recipes`}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-4 flex justify-end">
          <DensityToggle value={density} />
        </div>
        {bookmarkedRecipes.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">Nothing saved yet.</p>
            <p className="mt-2 text-ink-soft">
              Tap <span className="font-semibold">Save</span> on any recipe to keep it here.
            </p>
            <Link href="/explore" className="btn-brand mt-6">
              Browse recipes
            </Link>
          </div>
        ) : (
          <RecipeGrid
            recipes={bookmarkedRecipes.map((recipe) => toCardData(recipe))}
            compact={density === "compact"}
          />
        )}
      </section>
    </div>
  );
}
