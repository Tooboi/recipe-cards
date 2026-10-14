// Turns raw text read from a photo (OCR) into recipe fields.
// Heuristic, so the result is always shown to the user to check before saving.

import type { Ingredient } from "./recipe-format";

export type ParsedRecipe = {
  title: string;
  description: string;
  yieldAmount: string;
  yieldUnit: string;
  ingredients: Ingredient[];
  instructions: string[];
};

const FRACTIONS: Record<string, string> = {
  "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3",
  "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8",
};

const UNITS = [
  "cups", "cup", "c",
  "tablespoons", "tablespoon", "tbsp", "tbs", "tbl", "T",
  "teaspoons", "teaspoon", "tsp", "t",
  "ounces", "ounce", "oz", "fl oz",
  "pounds", "pound", "lbs", "lb",
  "grams", "gram", "g", "kilograms", "kg",
  "milliliters", "ml", "liters", "liter", "l",
  "quarts", "quart", "qt", "pints", "pint", "pt", "gallons", "gallon",
  "pinch", "pinches", "dash", "dashes",
  "cloves", "clove", "cans", "can", "packages", "package", "pkg", "sticks", "stick",
  "slices", "slice", "sprigs", "sprig", "bunch", "bunches", "heads", "head",
  "large", "medium", "small", "whole",
];

const INGREDIENTS_HEADER = /^(ingredients?|you(?:'ll)? need|what you need)\b[:\s]*$/i;
const DIRECTIONS_HEADER = /^(directions?|instructions?|method|preparation|prep|steps?|how to make( it)?)\b[:\s]*$/i;
const YIELD_LINE = /^(?:yield|yields|makes|serves|servings|serving size)\b[:\s]*(.+)$/i;
const NOISE = /^(page \d+|\d+|notes?:?|tips?:?)$/i;

function clean(line: string) {
  let s = line;
  for (const [k, v] of Object.entries(FRACTIONS)) s = s.replaceAll(k, ` ${v}`);
  return s
    .replace(/[|]/g, "l") // OCR often reads l as |
    .replace(/^[\s•·*▪◦●○■□✓✔\-–—>]+/, "") // bullets
    .replace(/\s+/g, " ")
    .trim();
}

const QTY = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?(?:\s*(?:-|to)\s*\d+(?:[.,]\d+)?)?|a|an|one|two|three|four|five|six|half)`;
const QTY_START = new RegExp(`^${QTY}\\b`, "i");
// "1." "2)" "3 -" or "Step 4" (separator optional after "Step")
const STEP_START = /^(?:step\s*\d{1,2}\s*[.):\-]?|\d{1,2}\s*[.):\-])\s*(.*)$/i;

/** "2 1/2 cups flour, sifted" → { quantity: "2 1/2", unit: "cups", item: "flour, sifted" } */
export function parseIngredientLine(line: string): Ingredient {
  const s = clean(line);
  const q = s.match(new RegExp(`^(${QTY})\\s*(.*)$`, "i"));
  if (!q || !/\d|^(a|an|one|two|three|four|five|six|half)\b/i.test(q[1])) {
    return { quantity: "", unit: "", item: s };
  }
  const quantity = q[1].replace(",", ".");
  let rest = q[2];
  // "(14 oz) can tomatoes" – keep size note with the item
  const um = rest.match(new RegExp(`^(${UNITS.map((u) => u.replace(/\s/g, "\\s")).join("|")})\\.?(?=\\s|$)\\s*(?:of\\s+)?`, "i"));
  let unit = "";
  if (um) {
    unit = um[1];
    rest = rest.slice(um[0].length);
  }
  return { quantity, unit, item: rest.trim() };
}

function looksLikeIngredient(line: string) {
  const s = clean(line);
  if (!s || s.length > 90) return false;
  if (/^\d/.test(s)) return QTY_START.test(s) && !STEP_START.test(s);
  // short lines with a unit word but no sentence punctuation
  return /\b(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|grams?|pinch|cloves?|cans?)\b/i.test(s) && !/[.!?]$/.test(s);
}

function looksLikeSentence(line: string) {
  return line.length > 40 || /[.!?]$/.test(line);
}

function parseYield(text: string): { yieldAmount: string; yieldUnit: string } {
  const m = text.match(/^(?:about\s+)?(\d+(?:\s*(?:-|to)\s*\d+)?)\s*(.*)$/i);
  if (m) return { yieldAmount: m[1].replace(/\s+/g, ""), yieldUnit: m[2].trim() || "Servings" };
  return { yieldAmount: "", yieldUnit: text.trim() };
}

export function parseRecipeText(raw: string): ParsedRecipe {
  const lines = raw
    .split(/\r?\n/)
    .map(clean)
    .filter((l) => l && !NOISE.test(l));

  const result: ParsedRecipe = {
    title: "",
    description: "",
    yieldAmount: "",
    yieldUnit: "",
    ingredients: [],
    instructions: [],
  };

  // Pull out a yield line wherever it is ("Serves 4", "Makes 2 dozen")
  const body: string[] = [];
  for (const l of lines) {
    const y = l.match(YIELD_LINE);
    if (y && !result.yieldAmount && l.length < 50) Object.assign(result, parseYield(y[1]));
    else body.push(l);
  }

  // Sections by headers, if the recipe has them
  let ingIdx = body.findIndex((l) => INGREDIENTS_HEADER.test(l));
  let dirIdx = body.findIndex((l) => DIRECTIONS_HEADER.test(l));

  // Title: first short line that isn't a header, ingredient or sentence
  const titleIdx = body.findIndex(
    (l, i) =>
      (ingIdx === -1 || i < ingIdx) &&
      !INGREDIENTS_HEADER.test(l) &&
      !DIRECTIONS_HEADER.test(l) &&
      !looksLikeIngredient(l) &&
      l.length <= 70
  );
  if (titleIdx >= 0) result.title = toTitleCase(body[titleIdx]);

  let ingLines: string[] = [];
  let dirLines: string[] = [];
  let introLines: string[] = [];

  if (ingIdx >= 0 || dirIdx >= 0) {
    if (ingIdx < 0) ingIdx = titleIdx; // no ingredients header: start after title
    if (dirIdx < 0) {
      // no directions header: directions start at the first sentence-like line after ingredients
      const rel = body.slice(ingIdx + 1).findIndex((l) => !looksLikeIngredient(l) && looksLikeSentence(l));
      dirIdx = rel >= 0 ? ingIdx + 1 + rel : body.length;
      ingLines = body.slice(ingIdx + 1, dirIdx);
      dirLines = body.slice(dirIdx);
    } else {
      ingLines = body.slice(ingIdx + 1, dirIdx > ingIdx ? dirIdx : undefined);
      dirLines = body.slice(dirIdx + 1);
    }
    introLines = body.slice(titleIdx + 1, Math.min(...[ingIdx, dirIdx].filter((i) => i > titleIdx), body.length));
  } else {
    // No headers: classify line by line
    body.forEach((l, i) => {
      if (i === titleIdx) return;
      if (looksLikeIngredient(l) && dirLines.length === 0) ingLines.push(l);
      else if (ingLines.length === 0 && dirLines.length === 0 && !STEP_START.test(l)) introLines.push(l);
      else dirLines.push(l);
    });
  }

  result.description = introLines
    .filter((l) => !INGREDIENTS_HEADER.test(l) && !DIRECTIONS_HEADER.test(l))
    .join(" ")
    .slice(0, 300);

  result.ingredients = ingLines
    .filter((l) => !INGREDIENTS_HEADER.test(l))
    .map(parseIngredientLine)
    .filter((i) => i.item || i.quantity);

  result.instructions = joinSteps(dirLines.filter((l) => !DIRECTIONS_HEADER.test(l)));
  return result;
}

/** Joins wrapped lines back into steps; numbered lines ("1.", "Step 2") start new steps. */
function joinSteps(lines: string[]) {
  const steps: string[] = [];
  const numbered = lines.some((l) => STEP_START.test(l));
  for (const line of lines) {
    const m = line.match(STEP_START);
    if (m && m[1]) {
      steps.push(m[1]);
    } else if (numbered) {
      if (steps.length) steps[steps.length - 1] += " " + line;
      else steps.push(line);
    } else {
      // unnumbered: a line continues the previous step unless that one ended a sentence
      const prev = steps[steps.length - 1];
      if (prev && !/[.!?]$/.test(prev)) steps[steps.length - 1] = prev + " " + line;
      else steps.push(line);
    }
  }
  return steps.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function toTitleCase(s: string) {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|\s)([a-z])/g, (_, sp, c) => sp + c.toUpperCase());
}
