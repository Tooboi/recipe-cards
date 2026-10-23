"use client";

import { formatMinutes } from "@/lib/recipe-format";

export type RecipeDetails = {
  prepTime: string;
  cookTime: string;
  extraTime: string;
  extraTimeLabel: string;
  cuisine: string;
  notes: string;
};

export const emptyDetails = (): RecipeDetails => ({
  prepTime: "",
  cookTime: "",
  extraTime: "",
  extraTimeLabel: "",
  cuisine: "",
  notes: "",
});

/** From a saved recipe (minutes as numbers) to form state (strings). */
export function detailsFromRecipe(r: {
  prepTime?: number | null;
  cookTime?: number | null;
  extraTime?: number | null;
  extraTimeLabel?: string | null;
  cuisine?: string | null;
  notes?: string | null;
}): RecipeDetails {
  const n = (v?: number | null) => (v ? String(v) : "");
  return {
    prepTime: n(r.prepTime),
    cookTime: n(r.cookTime),
    extraTime: n(r.extraTime),
    extraTimeLabel: r.extraTimeLabel ?? "",
    cuisine: r.cuisine ?? "",
    notes: r.notes ?? "",
  };
}

/** From form state to what the server action / PDF expects. */
export function detailsToData(d: RecipeDetails) {
  const n = (v: string) => {
    const x = Math.round(Number(v));
    return Number.isFinite(x) && x > 0 ? x : null;
  };
  return {
    prepTime: n(d.prepTime),
    cookTime: n(d.cookTime),
    extraTime: n(d.extraTime),
    extraTimeLabel: d.extraTimeLabel.trim() || null,
    cuisine: d.cuisine.trim() || null,
    notes: d.notes.trim() || null,
  };
}

const CUISINES = [
  "American", "Southern", "Cajun", "Tex-Mex", "Mexican", "Italian", "French", "Spanish",
  "Greek", "Mediterranean", "Middle Eastern", "Indian", "Chinese", "Japanese", "Korean",
  "Thai", "Vietnamese", "British", "German", "Caribbean",
];
const EXTRA_LABELS = ["Chilling", "Resting", "Rising", "Marinating", "Freezing", "Soaking", "Cooling"];

export default function RecipeDetailsFields({
  value,
  onChange,
}: {
  value: RecipeDetails;
  onChange: (next: RecipeDetails) => void;
}) {
  const set = (k: keyof RecipeDetails, v: string) => onChange({ ...value, [k]: v });
  const total = (["prepTime", "cookTime", "extraTime"] as const).reduce(
    (sum, k) => sum + (Number(value[k]) > 0 ? Math.round(Number(value[k])) : 0),
    0
  );

  const minutes = (k: "prepTime" | "cookTime" | "extraTime", label: string) => (
    <div>
      <label htmlFor={k} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={k}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          className="field pr-12"
          placeholder="0"
          value={value[k]}
          onChange={(e) => set(k, e.target.value)}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-ink-soft">
          min
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {minutes("prepTime", "Prep time")}
          {minutes("cookTime", "Cook time")}
          <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1 sm:grid-cols-1">
            {minutes("extraTime", value.extraTimeLabel.trim() ? `${value.extraTimeLabel.trim()} time` : "Extra time")}
            <div className="sm:hidden">
              <label htmlFor="extraTimeLabel-m" className="field-label">
                Extra time is for
              </label>
              <input
                id="extraTimeLabel-m"
                list="extra-time-labels"
                className="field"
                placeholder="Chilling"
                value={value.extraTimeLabel}
                onChange={(e) => set("extraTimeLabel", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 hidden items-center gap-2 sm:flex">
          <label htmlFor="extraTimeLabel" className="text-sm text-ink-soft">
            Extra time is for
          </label>
          <input
            id="extraTimeLabel"
            list="extra-time-labels"
            className="field !w-40 !py-1"
            placeholder="Chilling"
            value={value.extraTimeLabel}
            onChange={(e) => set("extraTimeLabel", e.target.value)}
          />
        </div>
        <datalist id="extra-time-labels">
          {EXTRA_LABELS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        {total > 0 && (
          <p className="mt-2 text-sm text-ink-soft">
            Total time: <span className="font-semibold text-ink">{formatMinutes(total)}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="cuisine" className="field-label">
          Cuisine
        </label>
        <input
          id="cuisine"
          list="cuisine-options"
          className="field"
          placeholder="e.g. American, Italian"
          value={value.cuisine}
          onChange={(e) => set("cuisine", e.target.value)}
        />
        <datalist id="cuisine-options">
          {CUISINES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="notes" className="field-label">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          className="field"
          placeholder="Storage, freezing, substitutions, variations… (start a new line for each note)"
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>
    </div>
  );
}
