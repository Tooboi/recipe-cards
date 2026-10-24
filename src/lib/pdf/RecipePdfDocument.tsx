/* Vector PDF layout for a recipe, rendered with @react-pdf/renderer.
 * Only import this module dynamically from client code (see ./generate.ts). */
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatIngredient, formatMinutes, totalMinutes } from "@/lib/recipe-format";
import RecipePagePdf from "./RecipePagePdf";
import { PDF_ACCENTS, type RecipePdfData, type RecipePdfOptions } from "./options";

// Page sizes in points (72pt = 1in). Cards are landscape, like a real index card.
const PAGE: Record<RecipePdfOptions["size"], [number, number]> = {
  letter: [612, 792],
  "4x6": [432, 288],
  "3x5": [360, 216],
};

type Metrics = {
  pad: number;
  body: number;
  title: number;
  heading: number;
  small: number;
  image: number;
  gap: number;
};

const METRICS: Record<RecipePdfOptions["size"], Metrics> = {
  letter: { pad: 54, body: 11, title: 26, heading: 10, small: 9.5, image: 144, gap: 18 },
  "4x6": { pad: 18, body: 8, title: 15, heading: 7, small: 7, image: 64, gap: 8 },
  "3x5": { pad: 14, body: 7, title: 12.5, heading: 6.2, small: 6.2, image: 52, gap: 6 },
};

const INK = "#231f1c";
const MUTED = "#6b625b";
const RULE = "#d9d1c5";
const INDEX_BLUE = "#9fb7d6";

export default function RecipePdfDocument({
  recipe,
  options,
  imageSrc,
  scale = 1,
}: {
  recipe: RecipePdfData;
  options: RecipePdfOptions;
  /** Pre-fetched image (data URL). Omitted when no image or it failed to load. */
  imageSrc?: string | null;
  /** Shrinks text so a recipe fits on one index card (see generate.ts). */
  scale?: number;
}) {
  // The website-style layout lives in its own component.
  if (options.theme === "page") {
    return <RecipePagePdf recipe={recipe} options={options} imageSrc={imageSrc} scale={scale} />;
  }

  const { size, theme, font } = options;
  const base = METRICS[size];
  const m: Metrics = {
    ...base,
    body: base.body * scale,
    title: base.title * scale,
    heading: base.heading * scale,
    small: base.small * scale,
    image: base.image * Math.max(scale, 0.8),
  };
  const isCard = size !== "letter";
  const accent = PDF_ACCENTS.find((a) => a.value === options.accent)?.color ?? INK;
  const centered = theme === "classic";

  const ingredients = recipe.ingredients.map(formatIngredient).filter(Boolean);
  const steps = recipe.instructions.map((s) => s.trim()).filter(Boolean);
  const showImage = options.showImage && !!imageSrc;
  const description = options.showDescription ? recipe.description?.trim() : "";
  const author = options.showAuthor ? recipe.author?.trim() : "";

  const s = StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: m.body,
      color: INK,
      padding: m.pad,
      paddingBottom: m.pad + (isCard ? 4 : 10),
      backgroundColor: theme === "classic" ? "#fffdf8" : "#ffffff",
    },
    frame: {
      position: "absolute",
      top: isCard ? 6 : 24,
      left: isCard ? 6 : 24,
      right: isCard ? 6 : 24,
      bottom: isCard ? 6 : 24,
      borderWidth: isCard ? 0.75 : 1.25,
      borderColor: accent,
    },
    frameInner: {
      position: "absolute",
      top: isCard ? 8.5 : 28,
      left: isCard ? 8.5 : 28,
      right: isCard ? 8.5 : 28,
      bottom: isCard ? 8.5 : 28,
      borderWidth: 0.4,
      borderColor: accent,
    },
    header: {
      flexDirection: "row",
      alignItems: centered ? "center" : "flex-start",
      gap: m.gap,
      marginBottom: m.gap * (isCard ? 0.6 : 1),
    },
    headerText: { flex: 1, textAlign: centered ? "center" : "left" },
    title: {
      fontSize: m.title,
      fontWeight: "bold",
      lineHeight: 1.15,
      color: theme === "minimal" ? INK : accent,
    },
    byline: { fontStyle: "italic", color: MUTED, fontSize: m.small, marginTop: 2, lineHeight: 1.4 },
    description: {
      marginTop: isCard ? 3 : 8,
      color: theme === "minimal" ? MUTED : INK,
      fontSize: isCard ? m.small : m.body + 0.5,
      lineHeight: 1.4,
    },
    image: {
      width: m.image,
      height: m.image,
      objectFit: "cover",
      borderRadius: isCard ? 2 : 4,
    },
    meta: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: centered ? "center" : "flex-start",
      columnGap: isCard ? 10 : 18,
      rowGap: 3,
      fontSize: m.small,
      color: MUTED,
      paddingVertical: isCard ? 2 : 6,
      borderTopWidth: theme === "index" ? 0 : 0.5,
      borderBottomWidth: 0.5,
      borderColor: RULE,
      marginBottom: m.gap,
    },
    metaLabel: { fontWeight: "bold", color: INK, textTransform: "uppercase" },
    indexRules: { marginTop: -m.gap * 0.4, marginBottom: m.gap },
    indexRed: { height: 1, backgroundColor: "#d2504a" },
    indexBlue: { height: 0.5, backgroundColor: INDEX_BLUE, marginTop: 1.5 },
    columns: { flexDirection: "row", gap: m.gap * 1.2 },
    heading: {
      fontSize: m.heading,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: isCard ? 0.6 : 1.4,
      color: theme === "minimal" ? INK : accent,
      marginBottom: isCard ? 3 : 8,
      paddingBottom: isCard ? 1.5 : 3,
      borderBottomWidth: theme === "minimal" ? 0.5 : 0,
      borderColor: RULE,
    },
    ingRow: { flexDirection: "row", marginBottom: isCard ? 1 : 3 },
    bullet: { width: isCard ? m.body * 0.9 : 12, color: accent, fontSize: m.body, lineHeight: 1.4 },
    stepRow: { flexDirection: "row", marginBottom: isCard ? 2.5 : 7 },
    stepNum: {
      width: isCard ? m.body * (steps.length > 9 ? 2.3 : 1.7) : steps.length > 9 ? 24 : 18,
      fontWeight: "bold",
      color: accent,
      fontSize: m.body,
      lineHeight: 1.4,
    },
    flex1: { flex: 1 },
    // lineHeight is set per text style rather than on <Page>: react-pdf drops the
    // dynamic page-number text when it inherits a lineHeight.
    // fontSize must be explicit wherever lineHeight is set.
    line: { flex: 1, fontSize: m.body, lineHeight: 1.4 },
    // Not flex: in a column, flex: 1 collapses each paragraph to zero height and they overlap.
    note: { fontSize: m.body, lineHeight: 1.4, marginBottom: isCard ? 1 : 4 },

    footerLeft: {
      position: "absolute",
      bottom: isCard ? 9 : 32,
      left: m.pad,
      fontSize: isCard ? 5 : 7.5,
      color: "#a39a90",
      height: isCard ? 8 : 12,
    },
    footerRight: {
      position: "absolute",
      bottom: isCard ? 9 : 32,
      left: m.pad,
      right: m.pad,
      fontSize: isCard ? 5 : 7.5,
      color: "#a39a90",
      textAlign: "right",
      height: isCard ? 8 : 12,
    },
  });

  const ingredientItems = (items: string[]) =>
    items.map((ing, i) => (
      <View key={i} style={s.ingRow} wrap={false}>
        <Text style={s.bullet}>•</Text>
        <Text style={s.line}>{ing}</Text>
      </View>
    ));

  // Long lists on a full page read down two columns, like a cookbook.
  const ingredientList = (twoCol: boolean) => {
    if (!twoCol) return <View>{ingredientItems(ingredients)}</View>;
    const half = Math.ceil(ingredients.length / 2);
    return (
      <View style={{ flexDirection: "row", gap: m.gap * 1.5 }}>
        <View style={s.flex1}>{ingredientItems(ingredients.slice(0, half))}</View>
        <View style={s.flex1}>{ingredientItems(ingredients.slice(half))}</View>
      </View>
    );
  };

  const stepList = (
    <View>
      {steps.map((step, i) => (
        <View key={i} style={s.stepRow} wrap={!isCard}>
          <Text style={s.stepNum}>{i + 1}.</Text>
          <Text style={s.line}>{step}</Text>
        </View>
      ))}
    </View>
  );

  const total = options.showTimes ? totalMinutes(recipe) : 0;
  const serving = options.showServings ? recipe.serving?.trim() : "";
  const rating = options.showRating && recipe.rating?.count ? recipe.rating : null;
  const notes = options.showNotes ? (recipe.notes ?? "").trim() : "";

  const bylineParts = [
    author ? `From the kitchen of ${author}` : "",
    isCard && serving ? `Makes ${serving}` : "",
    isCard && total ? `Ready in ${formatMinutes(total)}` : "",
    rating ? `Rated ${rating.average.toFixed(1)}/5 (${rating.count})` : "",
  ].filter(Boolean);

  const metaItems = [
    options.showCourse && recipe.course?.trim() ? ["Course", recipe.course.trim()] : null,
    options.showCourse && recipe.cuisine?.trim() ? ["Cuisine", recipe.cuisine.trim()] : null,
    serving ? ["Yield", serving] : null,
    options.showTimes && recipe.prepTime ? ["Prep", formatMinutes(recipe.prepTime)] : null,
    options.showTimes && recipe.cookTime ? ["Cook", formatMinutes(recipe.cookTime)] : null,
    options.showTimes && recipe.extraTime
      ? [recipe.extraTimeLabel?.trim() || "Additional", formatMinutes(recipe.extraTime)]
      : null,
    total ? ["Total", formatMinutes(total)] : null,
  ].filter(Boolean) as [string, string][];
  const keywords = options.showKeywords && recipe.tags?.length ? recipe.tags.join(", ") : "";

  return (
    <Document title={recipe.title || "Recipe"} author={recipe.author || undefined} creator="Recipe Card Vault">
      <Page size={PAGE[size]} style={s.page}>
        {theme === "classic" && (
          <>
            <View style={s.frame} fixed />
            {!isCard && <View style={s.frameInner} fixed />}
          </>
        )}

        {/* Header */}
        <View style={s.header} wrap={false}>
          <View style={s.headerText}>
            <Text style={s.title}>{recipe.title || "Untitled Recipe"}</Text>
            {bylineParts.length > 0 && <Text style={s.byline}>{bylineParts.join("  ·  ")}</Text>}
            {description ? <Text style={s.description}>{description}</Text> : null}
          </View>
          {/* react-pdf's <Image> has no alt attribute */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {showImage && <Image src={imageSrc!} style={s.image} />}
        </View>

        {theme === "index" && (
          <View style={s.indexRules}>
            <View style={s.indexRed} />
            <View style={s.indexBlue} />
          </View>
        )}

        {!isCard && metaItems.length > 0 && (
          <View style={s.meta}>
            {metaItems.map(([label, value]) => (
              <Text key={label}>
                <Text style={s.metaLabel}>{label}:{"\u00a0"}</Text>
                {value.replace(/ /g, "\u00a0")}
              </Text>
            ))}
          </View>
        )}
        {!isCard && keywords && (
          <Text style={[s.byline, { marginTop: -m.gap * 0.6, marginBottom: m.gap, textAlign: centered ? "center" : "left" }]}>
            Keywords: {keywords}
          </Text>
        )}

        {isCard ? (
          // Index cards: ingredients on the left, directions on the right.
          <View style={s.columns}>
            <View style={{ width: "36%" }}>
              <Text style={s.heading}>Ingredients</Text>
              {ingredientList(false)}
            </View>
            <View style={s.flex1}>
              <Text style={s.heading}>Directions</Text>
              {stepList}
            </View>
          </View>
        ) : (
          <>
            <View wrap={false}>
              <Text style={s.heading}>Ingredients</Text>
            </View>
            {ingredientList(ingredients.length > 8)}
            <View style={{ height: m.gap }} />
            <Text style={s.heading} minPresenceAhead={40}>
              Directions
            </Text>
            {stepList}
          </>
        )}

        {notes && (
          <View style={{ marginTop: isCard ? 4 : m.gap }}>
            {notes
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) =>
                i === 0 ? (
                  // heading stays with the first paragraph
                  <View key={i} wrap={false}>
                    <Text style={s.heading}>Notes</Text>
                    <Text style={s.note}>{p}</Text>
                  </View>
                ) : (
                  <Text key={i} style={s.note}>
                    {p}
                  </Text>
                )
              )}
          </View>
        )}

        {!isCard && (
          <Text style={s.footerLeft} fixed>
            Recipe Card Vault
          </Text>
        )}
        <Text
          style={s.footerRight}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1
              ? `${recipe.title ? `${recipe.title} — ` : ""}${isCard ? "card" : "page"} ${pageNumber} of ${totalPages}`
              : " "
          }
        />
      </Page>
    </Document>
  );
}
