// Shared helpers for turning stored recipe data into display/print data.

export type Ingredient = { quantity: string; unit: string; item: string };

/** Ingredients are stored as "quantity_unit_item". Items may themselves contain "_". */
export function parseIngredient(str: string): Ingredient {
  const [quantity = "", unit = "", ...rest] = (str ?? "").split("_");
  return { quantity, unit, item: rest.join("_") };
}

export function formatIngredient(ing: Ingredient): string {
  return [ing.quantity, ing.unit, ing.item]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/** Builds a plain Cloudinary delivery URL (usable outside <CldImage>, e.g. in PDFs). */
export function cloudinaryUrl(
  publicId: string,
  { width = 800, height = 800 }: { width?: number; height?: number } = {}
): string | null {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!publicId) return null;
  if (/^https?:\/\//.test(publicId)) return publicId;
  if (!cloud) return null;
  return `https://res.cloudinary.com/${cloud}/image/upload/c_fill,g_auto,w_${width},h_${height},q_auto,f_jpg/${publicId}`;
}

/** 15 → "15 mins", 60 → "1 hr", 75 → "1 hr 15 mins". */
export function formatMinutes(total: number | null | undefined, short = false): string {
  const t = Math.round(total ?? 0);
  if (t <= 0) return "";
  const h = Math.floor(t / 60);
  const m = t % 60;
  const hrs = h ? `${h} ${short ? "h" : h === 1 ? "hr" : "hrs"}` : "";
  const mins = m ? `${m} ${short ? "m" : m === 1 ? "min" : "mins"}` : "";
  return [hrs, mins].filter(Boolean).join(" ");
}

export function totalMinutes(r: { prepTime?: number | null; cookTime?: number | null; extraTime?: number | null }) {
  return (r.prepTime ?? 0) + (r.cookTime ?? 0) + (r.extraTime ?? 0);
}

/**
 * Splits an ingredient name into the main part and a softer note, the way recipe
 * sites grey out prep notes: "butter, softened" → ["butter", "softened"],
 * "flour (spooned & leveled)" → ["flour", "(spooned & leveled)"].
 */
export function splitIngredientNote(item: string): [string, string] {
  const paren = item.match(/^(.*?\S)\s*(\(.*\))\s*$/);
  if (paren) return [paren[1], paren[2]];
  const comma = item.indexOf(", ");
  if (comma > 0) return [item.slice(0, comma), item.slice(comma + 2)];
  return [item, ""];
}
