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
