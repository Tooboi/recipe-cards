import Link from "next/link";
import CldImage from "@/components/wrappers/CldImageWrapper";
import CategoryArt from "./CategoryArt";
import StarRating from "./StarRating";
import { getCategory, tagLabel } from "@/lib/taxonomy";

export type RecipeCardData = {
  id: string;
  title: string;
  description?: string | null;
  imageId?: string | null;
  serving?: string | null;
  ingredientCount: number;
  authorName?: string | null;
  updatedAt: string | Date;
  hidden?: boolean;
  category?: string | null;
  tags?: string[];
  ratingAvg?: number | null;
  ratingCount?: number | null;
};

type RecipeLike = {
  id: string;
  title: string;
  description?: string | null;
  imageId?: string | null;
  serving?: string | null;
  ingredients: string[];
  author?: string | null;
  updatedAt: string | Date;
  hidden?: boolean;
  category?: string | null;
  tags?: string[] | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  user?: { username?: string | null } | null;
};

/** Maps a recipe row (from Prisma or a serialized prop) to card data. */
export function toCardData(r: RecipeLike, opts: { showPrivate?: boolean } = {}): RecipeCardData {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    imageId: r.imageId,
    serving: r.serving,
    ingredientCount: r.ingredients.length,
    authorName: r.author || r.user?.username,
    updatedAt: r.updatedAt,
    hidden: opts.showPrivate ? r.hidden : false,
    category: r.category,
    tags: r.tags ?? [],
    ratingAvg: r.ratingAvg,
    ratingCount: r.ratingCount,
  };
}

/** Photo-first recipe tile, the way most recipe sites list recipes. */
export default function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const title = recipe.title || "Untitled Recipe";
  const category = getCategory(recipe.category);
  const tags = recipe.tags ?? [];

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
        {recipe.imageId ? (
          <CldImage
            alt={title}
            src={recipe.imageId}
            width="600"
            height="450"
            crop="fill"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <CategoryArt
            id={recipe.id}
            category={recipe.category}
            tags={recipe.tags}
            className="transition duration-500 group-hover:scale-105"
          />
        )}
        {recipe.hidden && (
          <span className="absolute top-3 right-3 rounded-full bg-ink/80 px-2.5 py-0.5 text-xs font-semibold text-cream">
            Private
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow mb-1" style={category.slug ? { color: category.ink } : undefined}>
          {category.slug ? category.label : recipe.serving ? `Makes ${recipe.serving}` : "Recipe"}
        </p>
        <h3 className="line-clamp-2 font-serif text-xl leading-snug font-bold text-ink transition-colors group-hover:text-brand">
          {title}
        </h3>
        <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} className="mt-1.5" />
        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
            {tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="rounded-full border border-line bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink-soft"
              >
                {tagLabel(t)}
              </li>
            ))}
            {tags.length > 3 && (
              <li className="px-1 py-0.5 text-[11px] font-semibold text-ink-soft">+{tags.length - 3}</li>
            )}
          </ul>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-ink-soft">
          {recipe.authorName ? (
            <span className="truncate">
              By <span className="font-semibold text-ink">{recipe.authorName}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="shrink-0">
            {recipe.ingredientCount} ingredient{recipe.ingredientCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
