"use client";

import { updateRecipe } from "@/app/actions";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

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

export default function RecipeDownload({ recipe }: { recipe: SafeRecipe }) {
  

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

  const handlePDFExport = async () => {
    const element = document.getElementById("recipe-preview");

    if (!element) {
      toast.error("Recipe preview not found");
      return;
    }

    // html2pdf is a module, default export lives here
    const pdf = (await import("html2pdf.js")).default;

    pdf()
      .from(element)
      .set({
        filename: `${updatedTitle || "recipe"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          useCORS: true,
          scale: 2,
        },
        jsPDF: {
          unit: "in",
          format: recipe.pdfSize === "3x5" ? [5, 3] : "letter",
          orientation: recipe.pdfSize === "3x5" ? "landscape" : "portrait",
        },
      })
      .save();
  };

  return (
    <div>
      <div className="shadow-sm sm:rounded-md bg-gray-200 mx-auto sm:max-w-2/3 overflow-hidden border-0 pt-4 sm:mt-4">
        <div className="border-b px-4 rounded-none">
          <div className="text-2xl text-gray-900">Download: {recipe.title}</div>
          <p className="pb-2">By: {recipe.user.username}</p>
        </div>
        <div className="p-4">
          <div>
            <label htmlFor="title" className="font-semibold pt-4 pb-2">
              Recipe Title
            </label>
            <input
              name="title"
              id="title"
              placeholder={updatedTitle}
              className="w-full border p-2 rounded-md bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block"
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
              className="w-full border p-2 rounded-md bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block"
              onChange={(e) => setUpdatedDescription(e.target.value)}
              value={updatedDescription}
            />
          </div>

          <h2 className="font-semibold pt-4 pb-2">Ingredients</h2>
          {ingredients.map((ingredient, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
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
                className="shrink-0 w-20 bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md"
              />
              <select
                id={`unit-select-${i}`}
                title={`Select unit for ingredient ${i + 1}`}
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, unit: e.target.value })
                }
                className="bg-gray-50 shrink-0 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md placeholder:text-gray-300"
              >
                <option value="">Unit</option>
                <option value="tsp">tsp</option>
                <option value="tbsp">tbsp</option>
                <option value="cup">cup</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
                <option value="pint">pint</option>
                <option value="liter">liter</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
                <option value="pinch">pinch</option>
                <option value="dash">dash</option>
                <option value="knob">knob</option>
                <option value="finger">finger</option>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) =>
                  updateIngredient(i, { ...ingredient, item: e.target.value })
                }
                className="flex-grow bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded"
              />
              <button
                className="text-gray-700"
                onClick={() => moveIngredient(i, "up")}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="text-gray-700"
                onClick={() => moveIngredient(i, "down")}
                disabled={i === ingredients.length - 1}
              >
                ↓
              </button>
              <button
                onClick={() => removeIngredient(i)}
                className="text-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="text-gray-700 mt-2" onClick={addIngredient}>
            + Add Ingredient
          </button>

          <h2 className="font-semibold py-4">Instructions</h2>
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <div className="text-sm text-gray-600 font-medium text-right">
                Step {i + 1}
              </div>
              <input
                id={`step-${i}`}
                name={`step-${i}`}
                placeholder={`Step ${i + 1}`}
                className="flex-grow bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block border p-2 rounded-md"
                value={step}
                onChange={(e) =>
                  updateField(setInstructions, i, e.target.value)
                }
              />
              <button
                className="text-gray-700"
                onClick={() =>
                  moveField(setInstructions, instructions, i, "up")
                }
                disabled={i === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                className="text-gray-700"
                onClick={() =>
                  moveField(setInstructions, instructions, i, "down")
                }
                disabled={i === instructions.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => removeField(setInstructions, instructions, i)}
                className="text-rose-600"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="text-gray-700"
            onClick={() => addField(setInstructions, instructions)}
          >
            + Add Step
          </button>
{/* 
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
          </div> */}
          <div>
          <button
            className="mt-6 p-2 rounded-md border-2 border-gray-600 bg-gray-300 text-lg font-medium text-gray-900 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-200 hover:text-gray-700 active:bg-gray-500 active:text-gray-900 active:border-gray-600"
            onClick={handlePDFExport}
            disabled={loading}
          >
            {loading ? "Saving..." : "Download Recipe"}
          </button></div>
          
        </div>
      </div>
      <div className="hidden">
        <div
          id="recipe-preview"
          className="export-recipe"
          style={{
            fontFamily: `'${recipe.font}', sans-serif`,
            aspectRatio: recipe.pdfSize === "3x5" ? "5 / 3" : "8.5 / 11",
          }}
        >
          <div className="p-4">
            <h1 className="text-xl font-bold">{updatedTitle}</h1>

            {updatedDescription && (
              <p className="italic mb-2">{updatedDescription}</p>
            )}

            <h2 className="font-semibold mt-4">Ingredients</h2>
            <ul>
              {ingredients.map((ing, i) => (
                <li key={i}>
                  • {ing.quantity} {ing.unit} {ing.item}
                </li>
              ))}
            </ul>

            <h2 className="font-semibold mt-4">Instructions</h2>
            <ol>
              {instructions.map((step, i) => (
                <li key={i}>
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
