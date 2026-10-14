import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowDownTrayIcon,
  PencilSquareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import CldImage from "@/components/wrappers/CldImageWrapper";
import BookmarkButton from "@/components/wrappers/BookmarkButton";
import PrintButton from "@/components/recipes/PrintButton";
import IngredientChecklist from "@/components/recipes/IngredientChecklist";
import { formatIngredient, parseIngredient } from "@/lib/recipe-format";
import { getCategory, tagLabel } from "@/lib/taxonomy";
import CategoryArt from "@/components/recipes/CategoryArt";
import StarRating from "@/components/recipes/StarRating";
import RateRecipe from "@/components/recipes/RateRecipe";
import { getMyRating } from "@/lib/actions/rating.actions";

type Props = { params: Promise<{ id: string }> };

async function getRecipe(id: string) {
  try {
    return await prisma.recipe.findUnique({ where: { id }, include: { user: true } });
  } catch {
    // Malformed ids throw in Mongo; treat as not found.
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = await getRecipe((await params).id);
  return recipe
    ? { title: recipe.title, description: recipe.description || undefined }
    : { title: "Recipe not found" };
}

export default async function RecipeDetails({ params }: Props) {
  const recipeId = (await params).id;
  const [session, recipe] = await Promise.all([auth(), getRecipe(recipeId)]);
  if (!recipe) notFound();

  const isOwner = !!session?.user?.id && recipe.userId === session.user.id;
  const ingredients = recipe.ingredients
    .map((s: string) => formatIngredient(parseIngredient(s)))
    .filter(Boolean);
  const steps = recipe.instructions.map((s: string) => s.trim()).filter(Boolean);
  const authorName = recipe.author || recipe.user.username;
  const category = getCategory(recipe.category);
  const tags = recipe.tags ?? [];
  const myRating = session?.user?.id ? await getMyRating(recipe.id) : null;

  const facts = [
    recipe.serving ? { label: "Yield", value: recipe.serving } : null,
    { label: "Ingredients", value: String(ingredients.length) },
    { label: "Steps", value: String(steps.length) },
    { label: "Updated", value: format(recipe.updatedAt, "MMM d, yyyy") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-1 text-xs font-semibold tracking-wide text-ink-soft uppercase print:hidden"
      >
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <Link href="/explore" className="hover:text-brand">
          The Vault
        </Link>
        {category.slug && (
          <>
            <ChevronRightIcon className="h-3 w-3" />
            <Link href={`/explore?category=${category.slug}`} className="whitespace-nowrap hover:text-brand">
              {category.label}
            </Link>
          </>
        )}
        <ChevronRightIcon className="h-3 w-3" />
        <span className="truncate text-ink">{recipe.title}</span>
      </nav>

      {/* Title block */}
      <header className="border-b border-line pb-6">
        {recipe.hidden && (
          <span className="mb-3 inline-block rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-cream print:hidden">
            Private recipe
          </span>
        )}
        {category.slug && (
          <Link
            href={`/explore?category=${category.slug}`}
            className="eyebrow mb-2 inline-block hover:underline print:hidden"
            style={{ color: category.ink }}
          >
            {category.label}
          </Link>
        )}
        <h1 className="font-serif text-4xl leading-tight font-bold text-ink md:text-5xl">
          {recipe.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
          <a href="#rate" className="hover:opacity-80 print:hidden">
            <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} size="md" />
          </a>
          <span>
          By{" "}
          <Link
            href={`/users/${recipe.userId}`}
            className="font-semibold text-ink underline decoration-brand/40 underline-offset-4 hover:text-brand"
          >
            {authorName}
          </Link>
          </span>
        </div>
        {recipe.description && (
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink">{recipe.description}</p>
        )}
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5 print:hidden" aria-label="Tags">
            {tags.map((t: string) => (
              <li key={t}>
                <Link
                  href={`/explore?tag=${encodeURIComponent(t)}`}
                  className="inline-block rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-brand hover:text-brand"
                >
                  {tagLabel(t)}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <BookmarkButton recipeId={recipe.id} variant="pill" />
          <PrintButton />
          <Link href={`/recipes/download/${recipe.id}`} className="btn-brand">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Recipe Card PDF
          </Link>
          {isOwner && (
            <Link href={`/recipes/edit/${recipe.id}`} className="btn-ghost">
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </header>

      {/* Photo, or the category illustration when there isn't one */}
      {!recipe.imageId && (
        <div className="mt-6 aspect-[16/7] overflow-hidden rounded-lg border border-line print:hidden">
          <CategoryArt id={recipe.id} category={recipe.category} tags={tags} size="lg" />
        </div>
      )}
      {recipe.imageId && (
        <div className="mt-6 overflow-hidden rounded-lg print:hidden">
          <CldImage
            alt={recipe.title}
            src={recipe.imageId}
            width="1200"
            height="675"
            crop="fill"
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="aspect-[16/9] h-auto w-full object-cover"
            priority
          />
        </div>
      )}

      {/* Quick facts */}
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="bg-paper px-4 py-3">
            <dt className="eyebrow">{f.label}</dt>
            <dd className="mt-0.5 font-serif text-lg font-semibold text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* Ingredients + directions */}
      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] print:grid-cols-[1fr_1.7fr]">
        <section>
          <div className="md:sticky md:top-24">
            <h2 className="section-title border-b-2 border-brand pb-2">Ingredients</h2>
            {ingredients.length ? (
              <IngredientChecklist items={ingredients} />
            ) : (
              <p className="py-3 text-ink-soft italic">No ingredients listed.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="section-title border-b-2 border-brand pb-2">Directions</h2>
          {steps.length ? (
            <ol className="mt-4 space-y-6">
              {steps.map((step: string, i: number) => (
                <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-serif text-lg font-bold text-white print:border print:border-ink print:bg-transparent print:text-ink"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="eyebrow mb-1 print:hidden">Step {i + 1}</p>
                    <p className="text-[1.05rem] leading-relaxed text-ink">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-3 text-ink-soft italic">No directions yet.</p>
          )}
        </section>
      </div>

      <div className="mt-12">
        <RateRecipe
          recipeId={recipe.id}
          average={recipe.ratingAvg ?? 0}
          count={recipe.ratingCount ?? 0}
          mine={myRating}
          isOwner={isOwner}
          isSignedIn={!!session?.user?.id}
        />
      </div>

      {/* Print-out call to action */}
      <aside className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-dashed border-brand/50 bg-brand-soft/40 p-6 sm:flex-row sm:items-center print:hidden">
        <div>
          <p className="font-serif text-xl font-bold text-ink">Take a copy out of the vault</p>
          <p className="text-sm text-ink-soft">
            Download a full-page printout or a classic 3×5 / 4×6 recipe card.
          </p>
        </div>
        <Link href={`/recipes/download/${recipe.id}`} className="btn-brand shrink-0">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Make a Recipe Card
        </Link>
      </aside>
    </article>
  );
}
