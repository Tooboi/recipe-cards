// Options shared by the PDF generator and the UI that configures it.
// Kept free of @react-pdf imports so it can be used anywhere (server or client).

export type PdfSize = "letter" | "4x6" | "3x5";
export type PdfTheme = "page" | "classic" | "index" | "minimal";
export type PdfFont = "Times-Roman" | "Helvetica" | "Courier" | "Rubik" | "Nunito";
export type PdfAccent = "terracotta" | "sage" | "navy" | "charcoal";

export const PDF_SIZES: { value: PdfSize; label: string; hint: string }[] = [
  { value: "letter", label: "Full page", hint: "8.5 × 11 in" },
  { value: "4x6", label: "4 × 6 card", hint: "Index card" },
  { value: "3x5", label: "3 × 5 card", hint: "Index card" },
];

export const PDF_THEMES: { value: PdfTheme; label: string; hint: string }[] = [
  { value: "page", label: "Recipe page", hint: "Like a recipe website's print view" },
  { value: "classic", label: "Classic", hint: "Framed, centered title" },
  { value: "index", label: "Index card", hint: "Ruled header, like Grandma's box" },
  { value: "minimal", label: "Minimal", hint: "Clean and ink-friendly" },
];

export const PDF_FONTS: { value: PdfFont; label: string }[] = [
  { value: "Times-Roman", label: "Classic serif" },
  { value: "Helvetica", label: "Clean sans" },
  { value: "Courier", label: "Typewriter" },
  { value: "Rubik", label: "Rubik" },
  { value: "Nunito", label: "Nunito" },
];

export const PDF_ACCENTS: { value: PdfAccent; label: string; color: string }[] = [
  { value: "terracotta", label: "Terracotta", color: "#b5452c" },
  { value: "sage", label: "Sage", color: "#4f6b4f" },
  { value: "navy", label: "Navy", color: "#2c4a6e" },
  { value: "charcoal", label: "Charcoal", color: "#333333" },
];

export type RecipePdfOptions = {
  size: PdfSize;
  theme: PdfTheme;
  font: PdfFont;
  accent: PdfAccent;
  showImage: boolean;
  showDescription: boolean;
  showAuthor: boolean;
  showRating: boolean;
  /** Course (category) and cuisine. */
  showCourse: boolean;
  /** Tags, printed as "Keywords". */
  showKeywords: boolean;
  showTimes: boolean;
  showServings: boolean;
  showNotes: boolean;
};

export type RecipePdfData = {
  title: string;
  description?: string | null;
  author?: string | null;
  serving?: string | null;
  ingredients: { quantity: string; unit: string; item: string }[];
  instructions: string[];
  /** Cloudinary public id or full URL. */
  imageId?: string | null;
  /** Category label, printed as "Course". */
  course?: string | null;
  cuisine?: string | null;
  tags?: string[] | null;
  /** Minutes. */
  prepTime?: number | null;
  cookTime?: number | null;
  extraTime?: number | null;
  /** e.g. "Chilling", "Rising", "Marinating". */
  extraTimeLabel?: string | null;
  notes?: string | null;
  rating?: { average: number; count: number } | null;
};

/** Which "Include" toggles have something to show for this recipe. */
export function availableDetails(r: RecipePdfData) {
  return {
    rating: !!r.rating?.count,
    course: !!(r.course?.trim() || r.cuisine?.trim()),
    keywords: !!r.tags?.length,
    times: !!(r.prepTime || r.cookTime || r.extraTime),
    servings: !!r.serving?.trim(),
    notes: !!r.notes?.trim(),
  };
}

export function normalizeSize(value: string | null | undefined): PdfSize {
  return value === "3x5" || value === "4x6" ? value : "letter";
}

export function normalizeFont(value: string | null | undefined): PdfFont {
  return PDF_FONTS.some((f) => f.value === value) ? (value as PdfFont) : "Times-Roman";
}

export function defaultPdfOptions(partial: Partial<RecipePdfOptions> = {}): RecipePdfOptions {
  return {
    size: "letter",
    theme: "classic",
    font: "Times-Roman",
    accent: "terracotta",
    showImage: true,
    showDescription: true,
    showAuthor: true,
    showRating: true,
    showCourse: true,
    showKeywords: true,
    showTimes: true,
    showServings: true,
    showNotes: true,
    ...partial,
  };
}
