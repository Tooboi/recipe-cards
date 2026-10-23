import RecipeCard, { type RecipeCardData } from "@/components/recipes/RecipeCard";
import AdSlot from "@/components/ads/AdSlot";
import { ADS, infeedEnabled } from "@/lib/ads";

/**
 * Recipe card grid with optional in-feed ad cards at fixed positions.
 * Each ad card has a spare recipe to show instead if no ad loads.
 */
export default function RecipeGrid({
  recipes,
  adPositions = [],
  fallbacks = [],
  compact = false,
}: {
  recipes: RecipeCardData[];
  /** 0-based positions in the grid for ad cards (ignored when ads are off). */
  adPositions?: number[];
  /** Spare recipes, one per ad position, shown when an ad doesn't load. */
  fallbacks?: RecipeCardData[];
  /** Dense layout: smaller cards, 2 per row on phones and 4 on desktop. */
  compact?: boolean;
}) {
  const items: React.ReactNode[] = recipes.map((r) => <RecipeCard key={r.id} recipe={r} compact={compact} />);

  if (infeedEnabled) {
    adPositions
      .filter((pos) => pos > 0 && pos < items.length) // never first, never trailing after the last recipe
      .forEach((pos, i) => {
        const spare = fallbacks[i];
        items.splice(
          pos,
          0,
          <AdSlot
            key={`ad-${pos}`}
            variant={compact ? "compact" : "card"}
            slot={ADS.infeedSlot}
            layoutKey={ADS.infeedLayoutKey}
            fallback={spare ? <RecipeCard recipe={spare} compact={compact} /> : null}
          />
        );
      });
  }

  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
          : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items}
    </div>
  );
}
