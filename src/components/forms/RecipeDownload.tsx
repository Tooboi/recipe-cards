"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import PdfOptionsPanel from "@/components/pdf/PdfOptionsPanel";
import PdfPreview from "@/components/pdf/PdfPreview";
import RowControls from "@/components/pdf/RowControls";
import { useMediaQuery } from "@/lib/use-media-query";
import { getCategory } from "@/lib/taxonomy";
import { parseIngredient, type Ingredient } from "@/lib/recipe-format";
import {
  defaultPdfOptions,
  normalizeFont,
  normalizeSize,
  type RecipePdfOptions,
} from "@/lib/pdf/options";

type SafeRecipe = {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[] | null;
  instructions: string[];
  user: { username: string | null };
  pdfSize: string;
  font: string;
  hidden: boolean;
  imageId: string | null;
  author: string | null;
  serving: string;
  category?: string | null;
  tags?: string[] | null;
  cuisine?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  extraTime?: number | null;
  extraTimeLabel?: string | null;
  notes?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
};

function move<T>(list: T[], index: number, direction: "up" | "down") {
  const next = [...list];
  const swap = direction === "up" ? index - 1 : index + 1;
  if (swap < 0 || swap >= next.length) return list;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}

export default function RecipeDownload({ recipe }: { recipe: SafeRecipe }) {
  // Text can be tweaked for this printout only; nothing here is saved to the recipe.
  const [title, setTitle] = useState(recipe.title || "");
  const [description, setDescription] = useState(recipe.description || "");
  const [author, setAuthor] = useState(recipe.author || recipe.user.username || "");
  const [serving, setServing] = useState(recipe.serving || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    (recipe.ingredients ?? []).map(parseIngredient)
  );
  const [instructions, setInstructions] = useState<string[]>(recipe.instructions || []);
  const [notes, setNotes] = useState(recipe.notes || "");

  const [options, setOptions] = useState<RecipePdfOptions>(() =>
    defaultPdfOptions({
      size: normalizeSize(recipe.pdfSize),
      font: normalizeFont(recipe.font),
      showImage: !!recipe.imageId,
    })
  );

  // Only one preview is mounted: inline on phones/tablets, sticky sidebar on desktop.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const pdfRecipe = {
    title,
    description,
    author,
    serving,
    ingredients,
    instructions,
    imageId: recipe.imageId,
    notes,
    course: recipe.category ? getCategory(recipe.category).label : "",
    cuisine: recipe.cuisine,
    tags: recipe.tags ?? [],
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    extraTime: recipe.extraTime,
    extraTimeLabel: recipe.extraTimeLabel,
    rating: recipe.ratingCount ? { average: recipe.ratingAvg ?? 0, count: recipe.ratingCount } : null,
  };

  const updateIngredient = (i: number, patch: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((ing, j) => (j === i ? { ...ing, ...patch } : ing)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <Link
        href={`/recipes/${recipe.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-brand"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to recipe
      </Link>

      <header className="mb-6">
        <p className="eyebrow mb-1">Print &amp; download</p>
        <h1 className="font-serif text-3xl leading-tight font-bold text-ink md:text-4xl">
          {recipe.title}
        </h1>
        <p className="mt-1 text-ink-soft">
          Choose a full page or an index card, pick a design, and download a print-ready PDF.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
        <div className="space-y-6">
          <section className="panel p-4 sm:p-6">
            <h2 className="mb-4 font-serif text-xl font-bold">Layout &amp; design</h2>
            <PdfOptionsPanel
              options={options}
              onChange={setOptions}
              recipe={pdfRecipe}
            />
          </section>

          {/* On phones the preview + download button come right after the options. */}
          {!isDesktop && <PdfPreview recipe={pdfRecipe} options={options} />}

          <details className="panel group p-4 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-xl font-bold">
              Edit text for this printout
              <span className="text-sm font-normal text-brand group-open:hidden">Show</span>
              <span className="hidden text-sm font-normal text-brand group-open:inline">Hide</span>
            </summary>
            <p className="mt-1 text-sm text-ink-soft">
              Shorten steps to fit a card, or fix a typo. These changes only affect the PDF.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="title" className="field-label">Title</label>
                <input id="title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="author" className="field-label">From the kitchen of</label>
                  <input id="author" className="field" value={author} onChange={(e) => setAuthor(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="serving" className="field-label">Yield</label>
                  <input id="serving" className="field" placeholder="e.g. 12 biscuits" value={serving} onChange={(e) => setServing(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="field-label">Description</label>
                <textarea id="description" rows={3} className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <h3 className="field-label">Ingredients</h3>
                <ul className="space-y-3 sm:space-y-2">
                  {ingredients.map((ing, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2 border-b border-line pb-3 sm:flex-nowrap sm:border-0 sm:pb-0">
                      <div className="grid w-full grid-cols-[4.5rem_5.5rem_minmax(0,1fr)] gap-2 sm:flex-1">
                        <input className="field" placeholder="Qty" aria-label={`Ingredient ${i + 1} quantity`} value={ing.quantity} onChange={(e) => updateIngredient(i, { quantity: e.target.value })} />
                        <input className="field" placeholder="Unit" aria-label={`Ingredient ${i + 1} unit`} value={ing.unit} onChange={(e) => updateIngredient(i, { unit: e.target.value })} />
                        <input className="field" placeholder="Ingredient" aria-label={`Ingredient ${i + 1}`} value={ing.item} onChange={(e) => updateIngredient(i, { item: e.target.value })} />
                      </div>
                      <div className="ml-auto">
                        <RowControls
                          index={i}
                          count={ingredients.length}
                          onMove={(d) => setIngredients((prev) => move(prev, i, d))}
                          onRemove={() => setIngredients((prev) => prev.filter((_, j) => j !== i))}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-ghost mt-2 px-2" onClick={() => setIngredients((p) => [...p, { quantity: "", unit: "", item: "" }])}>
                  <PlusIcon className="h-4 w-4" /> Add ingredient
                </button>
              </div>

              <div>
                <h3 className="field-label">Directions</h3>
                <ol className="space-y-3">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                      <span className="mt-2 w-6 shrink-0 text-right font-serif font-bold text-brand">{i + 1}.</span>
                      <textarea
                        rows={2}
                        className="field min-w-0 flex-1"
                        aria-label={`Step ${i + 1}`}
                        value={step}
                        onChange={(e) => setInstructions((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))}
                      />
                      <div className="ml-auto">
                        <RowControls
                          index={i}
                          count={instructions.length}
                          onMove={(d) => setInstructions((prev) => move(prev, i, d))}
                          onRemove={() => setInstructions((prev) => prev.filter((_, j) => j !== i))}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
                <button type="button" className="btn-ghost mt-2 px-2" onClick={() => setInstructions((p) => [...p, ""])}>
                  <PlusIcon className="h-4 w-4" /> Add step
                </button>
              </div>

              <div>
                <label htmlFor="pdf-notes" className="field-label">Notes</label>
                <textarea
                  id="pdf-notes"
                  rows={3}
                  className="field"
                  placeholder="Storage, freezing, substitutions… (one per line)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </details>
        </div>

        {isDesktop && (
          <div>
            <div className="sticky top-24">
              <PdfPreview recipe={pdfRecipe} options={options} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
