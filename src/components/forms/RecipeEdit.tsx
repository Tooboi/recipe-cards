"use client";

import { updateRecipe } from "@/app/actions";
import { redirect } from "next/navigation";
import { useState } from "react";
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
    console.log({
      updatedTitle,
      updatedDescription,
      ingredients: formattedIngredients,
      instructions,
      hidden,
    });
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
      });
    } finally {
      setLoading(false);
      toast.success("Recipe updated!");
      redirect(`/recipes/${recipe.id}`);
    }
  };

  return (
    <div>
      <div className="drop-shadow-md sm:rounded-md bg-slate-400 mx-auto sm:max-w-2/3 overflow-hidden border-2 border-slate-800 pt-4 sm:mt-4">
        <div className="border-b-2 border-slate-800 drop-shadow-md px-4 rounded-none">
          <div className="text-2xl text-slate-900">Edit: {recipe.title}</div>
          <p className="pb-2">By: {recipe.user.username}</p>
        </div>
        <div className="p-4 bg-slate-300">
          <div>
            <label htmlFor="title" className="font-semibold pt-4 pb-2">
              Recipe Title
            </label>
            <input
              name="title"
              id="title"
              placeholder={updatedTitle}
              className="w-full border-2 p-2 rounded-md bg-slate-50 border-slate-400 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block"
              onChange={(e) => setUpdatedTitle(e.target.value)}
              value={updatedTitle}
            />
          </div>
          <div className="pt-4">
            <label htmlFor="description" className="font-semibold pt-4 pb-2">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              placeholder={recipe.description || "description"}
              className="w-full border-2 p-2 rounded-md bg-slate-50 border-slate-400 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block"
              onChange={(e) => setUpdatedDescription(e.target.value)}
              value={updatedDescription}
            />
          </div>

          <h2 className="font-semibold pt-4 pb-2">Ingredients</h2>
          {ingredients.map((ingredient, i) => (
            <div key={i} className="flex gap-2 mb-2 justify-between">
              <label htmlFor={`unit-input-${i}`} className="sr-only">
                Ingredient unit
              </label>
              <input
                type="text"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(i, {
                    ...ingredient,
                    quantity: e.target.value,
                  })
                }
                className=" w-1/4 bg-slate-50 border-slate-400 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md border-2"
              />
              
              <input
                type="text"
                id={`unit-input-${i}`}
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, unit: e.target.value })
                }
                className="w-1/4 bg-slate-50 border-slate-400 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md border-2"
              />

              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, item: e.target.value })
                }
                className="w-1/2 bg-slate-50 border-slate-400 text-slate-900 text-sm border-2 focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md"
              />
              <button
                className="text-slate-700"
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
                className="text-slate-700"
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
                className="text-rose-600"
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
            className="text-slate-800 flex-row flex px-1 pr-2 py-0.5 bg-slate-400 hover:bg-slate-200 active:bg-slate-400 transition-all rounded border-slate-400 border-2"
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

          <h2 className="font-semibold py-4">Instructions</h2>
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <div className="text-sm text-slate-600 font-medium text-right">
                Step {i + 1}
              </div>
              <input
                id={`step-${i}`}
                name={`step-${i}`}
                placeholder={`Step ${i + 1}`}
                className="flex-grow bg-slate-50 border-2 border-slate-400 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md"
                value={step}
                onChange={(e) =>
                  updateField(setInstructions, i, e.target.value)
                }
              />
              <button
                className="text-slate-700"
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
                className="text-slate-700"
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
                className="text-rose-600"
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
            className="text-slate-800 flex-row flex px-1 pr-2 py-0.5 bg-slate-400 hover:bg-slate-200 active:bg-slate-400 transition-all rounded border-slate-400 border-2"
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
            className="mt-6 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600"
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
