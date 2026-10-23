/* "Recipe page" PDF style: modelled on the print view of a recipe website —
 * title with star rating, a details block (course, cuisine, keywords, times,
 * servings, author), photo top-right, ingredients with greyed prep notes,
 * numbered instructions and a Notes section. */
import { Document, Page, View, Text, Image, Svg, Path, StyleSheet } from "@react-pdf/renderer";
import { formatMinutes, splitIngredientNote, totalMinutes } from "@/lib/recipe-format";
import { PDF_ACCENTS, type RecipePdfData, type RecipePdfOptions } from "./options";

const PAGE: Record<RecipePdfOptions["size"], [number, number]> = {
  letter: [612, 792],
  "4x6": [432, 288],
  "3x5": [360, 216],
};

const INK = "#1f1f1f";
const SOFT = "#777777";
const STAR = "M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z";

export default function RecipePagePdf({
  recipe,
  options,
  imageSrc,
  scale = 1,
}: {
  recipe: RecipePdfData;
  options: RecipePdfOptions;
  imageSrc?: string | null;
  scale?: number;
}) {
  const isCard = options.size !== "letter";
  const k = (isCard ? (options.size === "4x6" ? 0.72 : 0.62) : 1) * scale;
  const pad = isCard ? (options.size === "4x6" ? 16 : 13) : 46;
  const accent = PDF_ACCENTS.find((a) => a.value === options.accent)?.color ?? INK;
  const fs = (n: number) => n * k;

  const ingredients = recipe.ingredients.filter((i) => i.item?.trim() || i.quantity?.trim());
  const steps = recipe.instructions.map((s) => s.trim()).filter(Boolean);
  const notes = options.showNotes ? (recipe.notes ?? "").trim() : "";
  const description = options.showDescription ? recipe.description?.trim() : "";
  const author = options.showAuthor ? recipe.author?.trim() : "";
  const rating = options.showRating && recipe.rating?.count ? recipe.rating : null;
  const showImage = options.showImage && !!imageSrc;
  const total = totalMinutes(recipe);

  // Details block, one row per group, like the website print view.
  type Pair = [string, string];
  const rows: Pair[][] = [
    options.showCourse
      ? ([
          recipe.course?.trim() ? ["Course", recipe.course.trim()] : null,
          recipe.cuisine?.trim() ? ["Cuisine", recipe.cuisine.trim()] : null,
        ].filter(Boolean) as Pair[])
      : [],
    options.showKeywords && recipe.tags?.length ? [["Keyword", recipe.tags.join(", ")] as Pair] : [],
    options.showTimes
      ? ([
          recipe.prepTime ? ["Prep Time", formatMinutes(recipe.prepTime)] : null,
          recipe.cookTime ? ["Cook Time", formatMinutes(recipe.cookTime)] : null,
          recipe.extraTime
            ? [`${recipe.extraTimeLabel?.trim() || "Additional"} Time`, formatMinutes(recipe.extraTime)]
            : null,
        ].filter(Boolean) as Pair[])
      : [],
    [
      options.showTimes && total ? (["Total Time", formatMinutes(total)] as Pair) : null,
      options.showServings && recipe.serving?.trim() ? (["Servings", recipe.serving.trim()] as Pair) : null,
      author ? (["Author", author] as Pair) : null,
    ].filter(Boolean) as Pair[],
  ].filter((r) => r.length > 0);

  const s = StyleSheet.create({
    page: { fontFamily: options.font, fontSize: fs(10.5), color: INK, padding: pad, paddingBottom: pad + (isCard ? 4 : 14) },
    header: { flexDirection: "row", gap: isCard ? 8 : 18 },
    headerText: { flex: 1 },
    title: { fontSize: fs(22), fontWeight: "bold", lineHeight: 1.2 },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: isCard ? 1.5 : 4 },
    ratingText: { fontSize: fs(9), color: SOFT, lineHeight: 1.2 },
    description: { fontSize: fs(10.5), lineHeight: 1.45, marginTop: isCard ? 3 : 9 },
    details: { marginTop: isCard ? 3 : 10 },
    detailRow: { flexDirection: "row", flexWrap: "wrap", columnGap: isCard ? 8 : 16, marginBottom: isCard ? 0.5 : 2.5 },
    detailText: { fontSize: fs(10), lineHeight: 1.4 },
    label: { fontWeight: "bold" },
    image: { width: isCard ? 58 * Math.max(scale, 0.85) : 128, height: isCard ? 58 * Math.max(scale, 0.85) : 128, objectFit: "cover", borderRadius: 3 },
    h2: { fontSize: fs(13), fontWeight: "bold", marginTop: isCard ? 4 : 16, marginBottom: isCard ? 2 : 5, lineHeight: 1.2 },
    row: { flexDirection: "row", marginBottom: isCard ? 0.5 : 2.5 },
    bullet: { width: fs(12), fontSize: fs(10.5), lineHeight: 1.45, paddingLeft: fs(3) },
    num: { width: fs(steps.length > 9 ? 20 : 15), fontSize: fs(10.5), lineHeight: 1.45, textAlign: "right", paddingRight: fs(5) },
    text: { flex: 1, fontSize: fs(10.5), lineHeight: 1.45 },
    soft: { color: SOFT },
    note: { fontSize: fs(10), lineHeight: 1.45, marginBottom: isCard ? 1 : 4 },
    columns: { flexDirection: "row", gap: 10 },
    footer: { position: "absolute", left: pad, right: pad, bottom: isCard ? 6 : 24, height: isCard ? 8 : 12, fontSize: isCard ? 5 : 7.5, color: "#aaaaaa", flexDirection: "row", justifyContent: "space-between" },
    pageNum: { fontSize: isCard ? 5 : 7.5, color: "#aaaaaa", height: isCard ? 8 : 12, textAlign: "right" },
  });

  const stars = (size: number) => {
    const avg = Math.max(0, Math.min(5, rating?.average ?? 0));
    const row = (fill: string) => (
      <View style={{ flexDirection: "row" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Svg key={i} viewBox="0 0 20 20" style={{ width: size, height: size }}>
            <Path d={STAR} fill={fill} />
          </Svg>
        ))}
      </View>
    );
    return (
      <View style={{ position: "relative", width: size * 5, height: size }}>
        {row("#d6d6d6")}
        <View style={{ position: "absolute", top: 0, left: 0, width: (avg / 5) * size * 5, height: size, overflow: "hidden" }}>
          {row(accent === "#333333" ? "#444444" : accent)}
        </View>
      </View>
    );
  };

  const ingredientList = (
    <View>
      {ingredients.map((ing, i) => {
        const [main, note] = splitIngredientNote(ing.item.trim());
        const lead = [ing.quantity, ing.unit].map((x) => x?.trim()).filter(Boolean).join(" ");
        return (
          <View key={i} style={s.row} wrap={false}>
            <Text style={s.bullet}>•</Text>
            <Text style={s.text}>
              {lead ? `${lead} ` : ""}
              {main}
              {note ? <Text style={s.soft}> {note}</Text> : null}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const stepList = (
    <View>
      {steps.map((step, i) => (
        <View key={i} style={s.row} wrap={!isCard}>
          <Text style={s.num}>{i + 1}.</Text>
          <Text style={s.text}>{step}</Text>
        </View>
      ))}
    </View>
  );

  const noteParas = notes
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Heading is kept together with the first paragraph so it never dangles at a page end.
  const notesBlock = noteParas.length ? (
    <View>
      <View wrap={false}>
        <Text style={s.h2}>Notes</Text>
        <Text style={s.note}>{noteParas[0]}</Text>
      </View>
      {noteParas.slice(1).map((p, i) => (
        <Text key={i} style={s.note}>
          {p}
        </Text>
      ))}
    </View>
  ) : null;

  return (
    <Document title={recipe.title || "Recipe"} author={recipe.author || undefined} creator="Recipe Card Vault">
      <Page size={PAGE[options.size]} style={s.page}>
        <View style={s.header} wrap={false}>
          <View style={s.headerText}>
            <Text style={s.title}>{recipe.title || "Untitled Recipe"}</Text>
            {rating && (
              <View style={s.ratingRow}>
                {stars(fs(11))}
                <Text style={s.ratingText}>
                  {rating.average.toFixed(1)} ({rating.count} {rating.count === 1 ? "rating" : "ratings"})
                </Text>
              </View>
            )}
            {description ? <Text style={s.description}>{description}</Text> : null}
            {rows.length > 0 && (
              <View style={s.details}>
                {isCard ? (
                  // Cards: everything on one compact line.
                  <Text style={s.detailText}>
                    {rows.flat().map(([label, value], i) => (
                      // non-breaking spaces keep each "Label value" pair on one line
                      <Text key={label}>
                        {i > 0 ? "   " : ""}
                        <Text style={s.label}>{label.replace(/ /g, "\u00a0") + "\u00a0"}</Text>
                        {label === "Keyword" ? value : value.replace(/ /g, "\u00a0")}
                      </Text>
                    ))}
                  </Text>
                ) : (
                  rows.map((row, r) => (
                    <View key={r} style={s.detailRow}>
                      {row.map(([label, value]) => (
                        <Text key={label} style={s.detailText}>
                          <Text style={s.label}>{label} </Text>
                          {value}
                        </Text>
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {showImage && <Image src={imageSrc!} style={s.image} />}
        </View>

        {isCard ? (
          <>
            <View style={s.columns}>
              <View style={{ width: "38%" }}>
                <Text style={s.h2}>Ingredients</Text>
                {ingredientList}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>Instructions</Text>
                {stepList}
              </View>
            </View>
            {notesBlock}
          </>
        ) : (
          <>
            <Text style={s.h2} minPresenceAhead={40}>
              Ingredients
            </Text>
            {ingredientList}
            <Text style={s.h2} minPresenceAhead={40}>
              Instructions
            </Text>
            {stepList}
            {notesBlock}
          </>
        )}

        <View style={s.footer} fixed>
          <Text>{isCard ? "" : "Recipe Card Vault"}</Text>
        </View>
        <Text
          style={[s.footer, s.pageNum]}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${isCard ? "Card" : "Page"} ${pageNumber} of ${totalPages}` : " "
          }
        />
      </Page>
    </Document>
  );
}
