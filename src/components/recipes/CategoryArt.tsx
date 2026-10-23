import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Beef,
  CakeSlice,
  Carrot,
  ChefHat,
  Cherry,
  Citrus,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Drumstick,
  EggFried,
  Fish,
  Flame,
  IceCreamCone,
  Leaf,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  Wheat,
  Wine,
} from "lucide-react";
import { getCategory, type CategorySlug } from "@/lib/taxonomy";

// Main icon + two "wallpaper" icons for each category.
const CATEGORY_ICONS: Record<CategorySlug | "", [LucideIcon, LucideIcon, LucideIcon]> = {
  breakfast: [EggFried, Coffee, Croissant],
  lunch: [Sandwich, Salad, Citrus],
  dinner: [UtensilsCrossed, Drumstick, Carrot],
  sides: [Carrot, Leaf, Wheat],
  "soups-salads": [Soup, Salad, Leaf],
  baking: [Croissant, Wheat, Cookie],
  desserts: [CakeSlice, IceCreamCone, Cherry],
  snacks: [Popcorn, Pizza, Cookie],
  drinks: [Coffee, Wine, CupSoda],
  "": [ChefHat, UtensilsCrossed, Leaf],
};

// A tag can swap in a more specific centerpiece (e.g. a fish for "seafood").
const TAG_ICONS: Record<string, LucideIcon> = {
  seafood: Fish,
  fish: Fish,
  chicken: Drumstick,
  beef: Beef,
  meat: Beef,
  pork: Beef,
  pasta: Wheat,
  pizza: Pizza,
  vegetarian: Leaf,
  vegan: Leaf,
  spicy: Flame,
  grill: Flame,
};

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Illustration for recipes without a photo: a patterned, category-colored
 * background with one large icon. No text. Each recipe gets its own variation.
 */
export default function CategoryArt({
  id,
  category,
  tags = [],
  className = "",
  size = "md",
}: {
  id: string;
  category?: string | null;
  tags?: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cat = getCategory(category);
  const [catIcon, a, b] = CATEGORY_ICONS[cat.slug];
  const tagIcon = tags.map((t) => TAG_ICONS[t]).find(Boolean);
  const Main = tagIcon ?? catIcon;
  const h = hash(id || "recipe");

  const rotate = [-18, -8, 0, 12, 20][h % 5];
  const tile = [52, 60, 68][(h >>> 3) % 3];
  const P1 = (h >>> 5) % 2 ? a : b;
  const P2 = P1 === a ? b : a;
  const patternId = `art-${id}-${size}`;
  const badge = { sm: "h-12 w-12", md: "h-24 w-24", lg: "h-32 w-32" }[size];
  const icon = { sm: 26, md: 48, lg: 64 }[size];

  return (
    <div
      className={`category-art relative h-full w-full overflow-hidden ${className}`}
      // Colours go through CSS variables so dark mode can swap them (see globals.css).
      style={{ "--art-tint": cat.tint, "--art-ink": cat.ink, backgroundColor: "var(--art-bg)" } as React.CSSProperties}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" style={{ color: "var(--art-fg)", opacity: 0.16 }}>
        <defs>
          <pattern
            id={patternId}
            width={tile}
            height={tile}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotate})`}
          >
            <P1 x={4} y={4} width={tile * 0.34} height={tile * 0.34} strokeWidth={1.6} />
            <P2
              x={tile / 2 + 4}
              y={tile / 2 + 4}
              width={tile * 0.34}
              height={tile * 0.34}
              strokeWidth={1.6}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* soft vignette so the centerpiece pops */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--art-bg) 0%, color-mix(in srgb, var(--art-bg) 80%, transparent) 30%, transparent 70%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex ${badge} items-center justify-center rounded-full border-2 bg-paper/80 shadow-sm`}
          style={{ borderColor: "color-mix(in srgb, var(--art-fg) 22%, transparent)", color: "var(--art-fg)" }}
        >
          <Main size={icon} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
