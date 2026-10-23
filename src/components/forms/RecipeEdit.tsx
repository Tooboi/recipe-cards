"use client";

import { updateRecipe } from "@/app/actions";
import { useRouter } from "next/navigation";
import CategoryTagsFields from "@/components/forms/CategoryTagsFields";
import RecipeDetailsFields, { detailsFromRecipe, detailsToData } from "@/components/forms/RecipeDetailsFields";
import { useState } from "react";
import RecipePhotoField from "@/components/forms/RecipePhotoField";
import { toast } from "sonner";

type Ingredient = {
  quantity: string;
  unit: string;
  item: string;
};

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
  serving?: string | null;
  category?: string | null;
  tags?: string[] | null;
  prepTime?: number | null;
  cookTime?: number | null;
  extraTime?: number | null;
  extraTimeLabel?: string | null;
  cuisine?: string | null;
  notes?: string | null;
};

export default function RecipeEdit({ recipe }: { recipe: SafeRecipe }) {
  const [updatedTitle, setUpdatedTitle] = useState(recipe.title || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients?.map((str) => {
      const [quantity = "", unit = "", item = ""] = str.split("_");
      return { quantity, unit, item };
    }) || []
  );
  const [updatedDescription, setUpdatedDescription] = useState(
    recipe.description || ""
  );
  const [instructions, setInstructions] = useState(recipe.instructions || []);
  const [hidden, setHidden] = useState(recipe.hidden || false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(recipe.category ?? "");
  const [tags, setTags] = useState<string[]>(recipe.tags ?? []);
  const [details, setDetails] = useState(() => detailsFromRecipe(recipe));
  const [imageId, setImageId] = useState(recipe.imageId ?? "");
  // Servings are stored as one string ("12 cookies"); edit as amount + unit like the New Recipe form.
  const [yieldAmount, setYieldAmount] = useState(() => (recipe.serving ?? "").trim().split(/\s+/)[0] ?? "");
  const [yieldUnit, setYieldUnit] = useState(() =>
    (recipe.serving ?? "").trim().split(/\s+/).slice(1).join(" ")
  );
  const [author, setAuthor] = useState(recipe.author ?? "");
  const router = useRouter();

  const updateField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev: string[]) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    prev: string[]
  ) => {
    setter([...prev, ""]);
  };

  const removeField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    prev: string[],
    index: number
  ) => {
    const updated = [...prev];
    updated.splice(index, 1);
    setter(updated);
  };

  const moveField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    prev: string[],
    index: number,
    direction: "up" | "down"
  ) => {
    const updated = [...prev];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setter(updated);
  };

  const updateIngredient = (index: number, updated: Ingredient) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { quantity: "", unit: "", item: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const moveIngredient = (index: number, direction: "up" | "down") => {
    setIngredients((prev) => {
      const updated = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [updated[index], updated[swapIndex]] = [
        updated[swapIndex],
        updated[index],
      ];
      return updated;
    });
  };

  const handleUpdateRecipe = async () => {
    setLoading(true);
    const formattedIngredients = ingredients.map(
      ({ quantity, unit, item }) => `${quantity}_${unit}_${item}`
    );
    try {
      await updateRecipe({
        id: recipe.id,
        title: updatedTitle,
        description: updatedDescription,
        ingredients: formattedIngredients,
        instructions,
        font: recipe.font,
        pdfSize: recipe.pdfSize,
        hidden,
        category,
        tags,
        imageId,
        author: author.trim(),
        serving: [yieldAmount.trim(), yieldUnit.trim()].filter(Boolean).join(" "),
        ...detailsToData(details),
      });
      toast.success("Recipe updated!");
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="panel mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl overflow-hidden pt-5">
        <div className="border-b border-line px-4 sm:px-6">
          <div className="font-serif text-3xl font-bold text-ink">Edit: {recipe.title}</div>
          <p className="pb-2">By: {recipe.user.username}</p>
        </div>
        <div className="p-4 sm:p-6">
          <div>
            <label htmlFor="title" className="field-label pt-4">
              Recipe Title
            </label>
            <input
              name="title"
              id="title"
              placeholder={updatedTitle}
              className="field"
              onChange={(e) => setUpdatedTitle(e.target.value)}
              value={updatedTitle}
            />
          </div>
          <div className="pt-4">
            <label htmlFor="description" className="field-label pt-4">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder={recipe.description || "description"}
              className="field"
              onChange={(e) => setUpdatedDescription(e.target.value)}
              value={updatedDescription}
            />
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div>
              <span className="field-label">Servings / yield</span>
              <div className="grid grid-cols-[5rem_1fr] gap-2">
                <input
                  className="field"
                  placeholder="12"
                  aria-label="Yield amount"
                  value={yieldAmount}
                  onChange={(e) => setYieldAmount(e.target.value)}
                />
                <input
                  className="field"
                  placeholder="cookies, servings…"
                  aria-label="Yield unit"
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="author" className="field-label">
                From the kitchen of
              </label>
              <input
                id="author"
                className="field"
                placeholder="Author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <RecipePhotoField imageId={imageId} onChange={setImageId} />
          </div>

          <h2 className="field-label pt-4">Ingredients</h2>
          {ingredients.map((ingredient, i) => (
            <div key={i} className="mb-3 flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
              <label htmlFor={`unit-input-${i}`} className="sr-only">
                Ingredient unit
              </label>
              <div className="grid w-full grid-cols-[4.5rem_5.5rem_minmax(0,1fr)] gap-2 sm:flex-1">
              <input
                type="text"
                placeholder="Qty"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(i, {
                    ...ingredient,
                    quantity: e.target.value,
                  })
                }
                className="field"
              />
              
              <input
                type="text"
                id={`unit-input-${i}`}
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, unit: e.target.value })
                }
                className="field"
              />

              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, item: e.target.value })
                }
                className="field"
              />
              </div>
              <button
                className="p-1 text-ink-soft hover:text-ink disabled:opacity-30"
                onClick={() => moveIngredient(i, "up")}
                disabled={i === 0}
                title="Move up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                className="p-1 text-ink-soft hover:text-ink disabled:opacity-30"
                onClick={() => moveIngredient(i, "down")}
                disabled={i === ingredients.length - 1}
                title="Move down"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => removeIngredient(i)}
                className="text-red-700"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            className="btn-ghost px-2"
            onClick={addIngredient}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 mt-0.25  mr-1"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Add Ingredient
          </button>

          <h2 className="field-label pt-4">Instructions</h2>
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <div className="w-12 shrink-0 text-right font-serif text-sm font-bold text-brand">
                Step {i + 1}
              </div>
              <input
                id={`step-${i}`}
                name={`step-${i}`}
                placeholder={`Step ${i + 1}`}
                className="field flex-grow"
                value={step}
                onChange={(e) =>
                  updateField(setInstructions, i, e.target.value)
                }
              />
              <button
                className="p-1 text-ink-soft hover:text-ink disabled:opacity-30"
                onClick={() =>
                  moveField(setInstructions, instructions, i, "up")
                }
                disabled={i === 0}
                title="Move up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                className="p-1 text-ink-soft hover:text-ink disabled:opacity-30"
                onClick={() =>
                  moveField(setInstructions, instructions, i, "down")
                }
                disabled={i === instructions.length - 1}
                title="Move down"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => removeField(setInstructions, instructions, i)}
                className="text-red-700"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            className="btn-ghost px-2"
            onClick={() => addField(setInstructions, instructions)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 mt-0.25 mr-1"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>{" "}
            Add Step
          </button>

          <div className="mt-6 border-t border-line pt-6">
            <CategoryTagsFields
              category={category}
              onCategoryChange={setCategory}
              tags={tags}
              onTagsChange={setTags}
            />
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="mb-3 font-serif text-lg font-bold text-ink">
              Times, cuisine &amp; notes{" "}
              <span className="font-sans text-sm font-normal text-ink-soft">(optional)</span>
            </h2>
            <RecipeDetailsFields value={details} onChange={setDetails} />
          </div>

          <div className="mt-4">
            <input
              type="checkbox"
              id="hidden"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
            />
            <label htmlFor="hidden" className="text-sm font-medium ml-2">
              Private
            </label>
          </div>
          <button
            className="btn-brand mt-6 w-full py-3 text-base sm:w-auto"
            onClick={handleUpdateRecipe}
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
