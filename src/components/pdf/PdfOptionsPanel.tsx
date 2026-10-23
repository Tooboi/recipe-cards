"use client";

import {
  PDF_ACCENTS,
  PDF_FONTS,
  PDF_SIZES,
  PDF_THEMES,
  availableDetails,
  type PdfSize,
  type RecipePdfData,
  type RecipePdfOptions,
} from "@/lib/pdf/options";

/** Size / design controls for the recipe PDF. Every option works for every size. */
export default function PdfOptionsPanel({
  options,
  onChange,
  recipe,
}: {
  options: RecipePdfOptions;
  onChange: (next: RecipePdfOptions) => void;
  /** Used to grey out "Include" options this recipe has nothing for. */
  recipe: RecipePdfData;
}) {
  const has = availableDetails(recipe);
  const set = <K extends keyof RecipePdfOptions>(key: K, value: RecipePdfOptions[K]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="field-label">Size</legend>
        <div className="grid grid-cols-3 gap-2">
          {PDF_SIZES.map((size) => {
            const active = options.size === size.value;
            return (
              <button
                key={size.value}
                type="button"
                onClick={() => set("size", size.value)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-2 rounded-md border px-2 py-3 text-center transition-colors ${
                  active
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-line bg-paper text-ink hover:border-ink-soft"
                }`}
              >
                <SizeIcon size={size.value} active={active} />
                <span className="text-sm leading-tight font-semibold">{size.label}</span>
                <span className="text-[11px] leading-tight text-ink-soft">{size.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Design</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PDF_THEMES.map((theme) => {
            const active = options.theme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...options,
                    theme: theme.value,
                    // The website-style page reads best in a clean sans.
                    ...(theme.value === "page" && options.font === "Times-Roman" ? { font: "Helvetica" as const } : {}),
                  })
                }
                aria-pressed={active}
                className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-paper hover:border-ink-soft"
                }`}
              >
                <span className={`block text-sm font-semibold ${active ? "text-brand-dark" : "text-ink"}`}>
                  {theme.label}
                </span>
                <span className="block text-xs text-ink-soft">{theme.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pdf-font" className="field-label">
            Font
          </label>
          <select
            id="pdf-font"
            className="field"
            value={options.font}
            onChange={(e) => set("font", e.target.value as RecipePdfOptions["font"])}
          >
            {PDF_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Accent color</legend>
          <div className="flex gap-2 pt-1">
            {PDF_ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                title={a.label}
                aria-label={a.label}
                aria-pressed={options.accent === a.value}
                onClick={() => set("accent", a.value)}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  options.accent === a.value
                    ? "scale-110 border-ink ring-2 ring-paper ring-offset-1"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: a.color }}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset>
        <legend className="field-label">Include</legend>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Toggle label="Photo" checked={options.showImage} disabled={!recipe.imageId} hint={recipe.imageId ? undefined : "no photo"} onChange={(v) => set("showImage", v)} />
          <Toggle label="Description" checked={options.showDescription} disabled={!recipe.description?.trim()} onChange={(v) => set("showDescription", v)} />
          <Toggle label="Star rating" checked={options.showRating} disabled={!has.rating} hint={has.rating ? undefined : "no ratings yet"} onChange={(v) => set("showRating", v)} />
          <Toggle label="Author" checked={options.showAuthor} disabled={!recipe.author?.trim()} onChange={(v) => set("showAuthor", v)} />
          <Toggle label="Course & cuisine" checked={options.showCourse} disabled={!has.course} onChange={(v) => set("showCourse", v)} />
          <Toggle label="Keywords (tags)" checked={options.showKeywords} disabled={!has.keywords} onChange={(v) => set("showKeywords", v)} />
          <Toggle label="Prep, cook & total time" checked={options.showTimes} disabled={!has.times} onChange={(v) => set("showTimes", v)} />
          <Toggle label="Servings" checked={options.showServings} disabled={!has.servings} onChange={(v) => set("showServings", v)} />
          <Toggle label="Notes" checked={options.showNotes} disabled={!has.notes} onChange={(v) => set("showNotes", v)} />
        </div>
        {(!has.times || !has.notes || !has.course) && (
          <p className="mt-1 text-xs text-ink-soft">Greyed-out items have nothing to show yet — add them when editing the recipe.</p>
        )}
      </fieldset>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 rounded-md py-1.5 text-sm ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <span>
        {label}
        {hint && <span className="ml-2 text-xs text-ink-soft">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-brand"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function SizeIcon({ size, active }: { size: PdfSize; active: boolean }) {
  const dims = { letter: [22, 28], "4x6": [33, 22], "3x5": [30, 18] }[size];
  return (
    <span className="flex h-8 items-center" aria-hidden>
      <span
        className={`block rounded-[2px] border-2 ${active ? "border-brand bg-paper" : "border-ink-soft/60 bg-cream"}`}
        style={{ width: dims[0], height: dims[1] }}
      />
    </span>
  );
}
