import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import CldImageWrapper from "@/components/wrappers/CldImageWrapper";
import RecipeCard, { toCardData } from "@/components/recipes/RecipeCard";

export default async function UserIDpage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const selectedUser = (await params).id;
  const session = await auth();
  if (!session?.user) redirect("/");

  const isMe = session.user.id === selectedUser;
  const user = await prisma.user
    .findUnique({
      where: { id: selectedUser },
      include: { Recipe: { orderBy: { updatedAt: "desc" } } },
    })
    .catch(() => null);

  if (!user) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-ink-soft">Cook not found.</p>;
  }

  // Other people only see public recipes.
  const recipes = isMe ? user.Recipe : user.Recipe.filter((r) => !r.hidden);

  return (
    <div>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-8 sm:gap-6">
          {user.image ? (
            <CldImageWrapper
              src={user.image}
              alt=""
              width={88}
              height={88}
              crop="fill"
              aspectRatio="1:1"
              className="h-16 w-16 shrink-0 rounded-full ring-4 ring-brand-soft sm:h-22 sm:w-22"
            />
          ) : (
            <Image
              width={88}
              height={88}
              unoptimized
              className="h-16 w-16 shrink-0 rounded-full bg-brand-soft ring-4 ring-brand-soft sm:h-22 sm:w-22"
              src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?size=88&seed=${user.id}`}
              alt=""
            />
          )}
          <div className="min-w-0">
            <p className="eyebrow mb-1">{isMe ? "My vault" : "Recipe vault"}</p>
            <h1 className="truncate font-serif text-3xl font-bold text-ink md:text-4xl">
              {user.username}&apos;s Vault
            </h1>
            <p className="text-sm text-ink-soft">
              {recipes.length} recipe{recipes.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        {recipes.length === 0 ? (
          <div className="panel px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink">This vault is empty.</p>
            {isMe && (
              <Link href="/new-recipe" className="btn-brand mt-6">
                Put your first recipe in the vault
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={toCardData({ ...recipe, user }, { showPrivate: isMe })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
