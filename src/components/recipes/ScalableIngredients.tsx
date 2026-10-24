"use client";

import { useState } from "react";
import IngredientChecklist from "@/components/recipes/IngredientChecklist";
import ScaleControl from "@/components/recipes/ScaleControl";
import { formatAmount, scaleIngredient, scaleServing, withScale } from "@/lib/scale";

type Ingredient = { quantity: string; unit: string; item: string };

/** Ingredient list with buttons to halve, double, triple or fine-tune the recipe. */
export default function ScalableIngredients({
  ingredients,
  serving,
  initialFactor = 1,
}: {
  ingredients: Ingredient[];
  serving?: string | null;
  initialFactor?: number;
}) {
  const [factor, setFactor] = useState(initialFactor);

  // Keep ?scale= in the address bar so the PDF links (and a shared link) use the same size.
  const changeFactor = (next: number) => {
    setFactor(next);
    window.history.replaceState(null, "", withScale(window.location.pathname, next));
  };

  const lines = ingredients.map((ing) => {
    const s = scaleIngredient(ing, factor);
    return {
      amount: [s.quantity, s.unit].filter((x) => x?.trim()).join(" "),
      item: ing.item.trim(),
    };
  });
  const scaled = factor !== 1;
  const scaledServing = serving ? scaleServing(serving, factor) : "";

  return (
    <div>
      <div className="mt-3 rounded-lg border border-line bg-paper p-3 print:hidden">
        <ScaleControl factor={factor} onChange={changeFactor} serving={serving} />
      </div>

      {/* Printed copies say how the recipe was scaled */}
      {scaled && (
        <p className="mt-2 hidden text-sm print:block">
          Scaled {formatAmount(factor)}× {serving ? `— makes ${scaledServing}` : ""}
        </p>
      )}

      <IngredientChecklist items={lines} highlightAmounts={scaled} />

      {scaled && (
        <p className="mt-2 text-xs text-ink-soft italic">
          Amounts mentioned in the directions are for the original recipe. Cooking times may change too.
        </p>
      )}
    </div>
  );
}
