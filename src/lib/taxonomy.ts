// Categories and tags used for browsing and filtering.
// Kept free of React so server code (actions, queries) can import it too.

export type CategorySlug =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "sides"
  | "soups-salads"
  | "baking"
  | "desserts"
  | "snacks"
  | "drinks";

export type Category = {
  slug: CategorySlug;
  label: string;
  /** Background tint and darker ink for illustrations/chips. */
  tint: string;
  ink: string;
};

/** Categories are meal types; tags describe what's in it or what it's like. */
export const CATEGORIES: Category[] = [
  { slug: "breakfast", label: "Breakfast", tint: "#f6e7c8", ink: "#9a6a12" },
  { slug: "lunch", label: "Lunch", tint: "#e8eadb", ink: "#5f6a2c" },
  { slug: "dinner", label: "Dinner", tint: "#efd9d3", ink: "#9b3b25" },
  { slug: "sides", label: "Sides", tint: "#e3e9dc", ink: "#4f6b4f" },
  { slug: "soups-salads", label: "Soups & Salads", tint: "#dfe8e4", ink: "#3f6a5c" },
  { slug: "baking", label: "Bread & Baking", tint: "#f3e3d3", ink: "#8a5a32" },
  { slug: "desserts", label: "Desserts", tint: "#f2dfe6", ink: "#9a4566" },
  { slug: "snacks", label: "Snacks & Apps", tint: "#f4ead2", ink: "#8a6a1e" },
  { slug: "drinks", label: "Drinks", tint: "#dde6ee", ink: "#2c4a6e" },
];

export const UNCATEGORIZED: Omit<Category, "slug"> & { slug: "" } = {
  slug: "",
  label: "Recipe",
  tint: "#ece6dc",
  ink: "#6b5d50",
};

export function getCategory(slug: string | null | undefined) {
  return CATEGORIES.find((c) => c.slug === slug) ?? UNCATEGORIZED;
}

export function isCategory(slug: string | null | undefined): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

/** Offered as one-tap suggestions in the tag input. */
export const SUGGESTED_TAGS = [
  // what's in it
  "meat",
  "chicken",
  "beef",
  "pork",
  "seafood",
  "pasta",
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  // what it's like
  "quick",
  "family favorite",
  "comfort food",
  "holiday",
  "make-ahead",
  "one-pot",
  "slow cooker",
  "grill",
  "spicy",
  "healthy",
  "kid-friendly",
];

export const MAX_TAGS = 10;

export function normalizeTag(raw: string) {
  return raw
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9 &'-]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

export function normalizeTags(tags: string[] | null | undefined) {
  const out: string[] = [];
  for (const t of tags ?? []) {
    const n = normalizeTag(t);
    if (n && !out.includes(n)) out.push(n);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/**
 * Key used to spot near-duplicate tags: ignores spaces, hyphens, "&"/"and"
 * and a trailing plural, so "Cookie", "cookies" and "gluten free"/"gluten-free" match.
 */
export function tagKey(tag: string) {
  return normalizeTag(tag)
    .replace(/\band\b|&/g, "")
    .replace(/[\s'-]+/g, "")
    .replace(/([^s])s$/, "$1") // cookies → cookie, berries → berrie
    .replace(/ie$/, "y"); // cookie → cooky, berrie → berry (keys only, never shown)
}

/** "gluten-free" → "Gluten-Free" for display. */
export function tagLabel(tag: string) {
  return tag.replace(/(^|[\s-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

export type SortOption = "newest" | "top-rated" | "most-rated" | "a-z";
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "top-rated", label: "Top rated" },
  { value: "most-rated", label: "Most rated" },
  { value: "a-z", label: "A–Z" },
];
