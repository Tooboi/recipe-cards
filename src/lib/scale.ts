// Scaling recipe amounts: "1 1/2" × 2 → "3", "3/4" × ½ → "3/8", "2-3" × 2 → "4-6".

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4,
  "⅕": 1 / 5, "⅛": 1 / 8, "⅜": 3 / 8, "⅝": 5 / 8, "⅞": 7 / 8,
};

/** Parses one amount: "2", "1.5", "1/2", "1 1/2", "1½", "½". Returns null if it isn't a number. */
function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  let m = s.match(/^(\d+)?\s*([½⅓⅔¼¾⅕⅛⅜⅝⅞])$/);
  if (m) return (m[1] ? Number(m[1]) : 0) + UNICODE_FRACTIONS[m[2]];
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[2]) ? Number(m[1]) / Number(m[2]) : null;
  m = s.match(/^\d+(\.\d+)?$/);
  if (m) return Number(s);
  return null;
}

const NICE: [number, string][] = [
  [1 / 16, "1/16"], [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"], [3 / 8, "3/8"], [1 / 2, "1/2"],
  [5 / 8, "5/8"], [2 / 3, "2/3"], [3 / 4, "3/4"], [7 / 8, "7/8"],
];

/** 1.5 → "1 1/2", 0.333 → "1/3", 2 → "2", 0.1 → "0.1". Uses cook-friendly fractions. */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.04) return String(whole);
  if (frac > 0.96) return String(whole + 1);
  const [value, label] = NICE.reduce((best, cur) =>
    Math.abs(cur[0] - frac) < Math.abs(best[0] - frac) ? cur : best
  );
  if (Math.abs(value - frac) > 0.045) {
    // Not close to a kitchen fraction: show a short decimal instead.
    return String(Math.round(n * 100) / 100);
  }
  if (whole === 0) return label;
  return `${whole} ${label}`;
}

/** Scales a quantity string. Ranges ("2-3", "2 to 3") scale both ends; text like "a pinch" is left alone. */
export function scaleQuantity(quantity: string, factor: number): string {
  const q = (quantity ?? "").trim();
  if (!q || factor === 1) return q;
  const range = q.match(/^(.+?)\s*(-|–|to)\s*(.+)$/);
  if (range) {
    const a = parseAmount(range[1]);
    const b = parseAmount(range[3]);
    if (a !== null && b !== null) {
      const sep = range[2] === "to" ? " to " : "-";
      return `${formatAmount(a * factor)}${sep}${formatAmount(b * factor)}`;
    }
  }
  const n = parseAmount(q);
  return n === null ? q : formatAmount(n * factor);
}

export function amountValue(quantity: string): number | null {
  const q = (quantity ?? "").trim();
  const range = q.match(/^(.+?)\s*(-|–|to)\s*(.+)$/);
  return parseAmount(range ? range[3] : q);
}

// Units that read differently for one vs. several ("1 cup" / "2 cups").
const PLURALS: Record<string, string> = {
  cup: "cups", tablespoon: "tablespoons", teaspoon: "teaspoons", ounce: "ounces", pound: "pounds",
  can: "cans", clove: "cloves", stick: "sticks", package: "packages", slice: "slices",
  pinch: "pinches", dash: "dashes", container: "containers", quart: "quarts", pint: "pints",
  gallon: "gallons", jar: "jars", bag: "bags", box: "boxes", bunch: "bunches", head: "heads",
  // yield words
  serving: "servings", cookie: "cookies", loaf: "loaves", muffin: "muffins", biscuit: "biscuits",
  bar: "bars", cupcake: "cupcakes", roll: "rolls", pie: "pies", cake: "cakes", portion: "portions",
  pancake: "pancakes", sandwich: "sandwiches", batch: "batches", person: "people",
  sprig: "sprigs", piece: "pieces", liter: "liters", litre: "litres", gram: "grams",
  kilogram: "kilograms", envelope: "envelopes", packet: "packets", dozen: "dozen",
};
const SINGULARS = Object.fromEntries(Object.entries(PLURALS).map(([s, p]) => [p, s]));

/** Matches the unit word to the new amount: "cup" ↔ "cups". Abbreviations (tbsp, oz) stay as they are. */
export function adjustUnit(unit: string, amount: number | null): string {
  if (!unit || amount === null) return unit;
  const m = unit.match(/^(\S+)(.*)$/);
  if (!m) return unit;
  const [, word, rest] = m;
  const lower = word.toLowerCase();
  const swap = amount > 1 ? PLURALS[lower] : SINGULARS[lower];
  if (!swap) return unit;
  const cased = word[0] === word[0].toUpperCase() ? swap[0].toUpperCase() + swap.slice(1) : swap;
  return cased + rest;
}

const NUM = "\\d+(?:\\.\\d+)?(?:\\s+\\d+\\/\\d+|\\/\\d+)?|\\d*[½⅓⅔¼¾⅕⅛⅜⅝⅞]";

/** Scales the first amount in a servings line: "12 cookies" → "24 cookies", "Serves 4" → "Serves 8". */
export function scaleServing(serving: string, factor: number): string {
  const s = (serving ?? "").trim();
  if (!s || factor === 1) return s;
  const re = new RegExp(`^(\\D*?)((?:${NUM})(?:\\s*(?:-|–|to)\\s*(?:${NUM}))?)(\\s+(\\S+))?(.*)$`);
  const m = s.match(re);
  if (!m) return s;
  const [, before, qty, , word = "", after = ""] = m;
  const scaled = scaleQuantity(qty, factor);
  const unitWord = word ? " " + adjustUnit(word, amountValue(scaled)) : "";
  return `${before}${scaled}${unitWord}${after}`;
}

/**
 * Scales amounts written inside the unit, e.g. "cup plus 1 tablespoon" → "cups plus 2 tablespoons",
 * then matches the leading unit word to the new amount.
 */
export function scaleUnit(unit: string, amount: number | null, factor: number): string {
  if (!unit) return unit;
  const inner = new RegExp(`(\\b(?:plus|and)\\s+|\\+\\s*)(${NUM})(\\s+)(\\S+)`, "gi");
  const scaledInner =
    factor === 1
      ? unit
      : unit.replace(inner, (_, lead, qty, space, word) => {
          const q = scaleQuantity(qty, factor);
          return `${lead}${q}${space}${adjustUnit(word, amountValue(q))}`;
        });
  return adjustUnit(scaledInner, amount);
}

export const MIN_SCALE = 0.01;
export const MAX_SCALE = 20;

/** Reads a ?scale= value safely. Anything missing or out of range means 1×. */
export function parseScale(value: string | string[] | null | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  if (!raw || !Number.isFinite(n) || n < MIN_SCALE || n > MAX_SCALE) return 1;
  return Math.round(n * 1000) / 1000;
}

/** Adds ?scale= to a path when the recipe is scaled. */
export function withScale(href: string, factor: number): string {
  return factor === 1 ? href : `${href}?scale=${Math.round(factor * 1000) / 1000}`;
}

/** Scales one parsed ingredient: quantity, plural unit and any "plus 1 tbsp" inside the unit. */
export function scaleIngredient<T extends { quantity: string; unit: string }>(ing: T, factor: number): T {
  if (factor === 1) return ing;
  const quantity = scaleQuantity(ing.quantity, factor);
  return { ...ing, quantity, unit: scaleUnit(ing.unit, amountValue(quantity), factor) };
}

/** − / + step one serving at a time when the yield starts with a number, else half a batch. */
export function scaleStep(serving: string | null | undefined): number {
  const base = serving ? amountValue(serving.replace(/^\D*/, "").split(/\s/)[0] ?? "") : null;
  return base && base >= 2 ? 1 / base : 0.5;
}
