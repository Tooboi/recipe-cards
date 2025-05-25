'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[]; // stored as "quantity_unit_item"
  instructions: string[];
  font: string;
  pdfSize: string;
  hidden: boolean;
  user: { username: string };
};

export default function EditRecipeForm({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<{ quantity: string; unit: string; item: string }[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  const [font, setFont] = useState<string>('Rubik');
  const [pdfSize, setPdfSize] = useState<'3x5' | 'letter'>('3x5');
  const [loading, setLoading] = useState(false);

  // Fetch recipe on mount
  useEffect(() => {
    const fetchRecipe = async () => {
      const res = await fetch(`/api/recipes/${id}`);
      if (res.ok) {
        const data: Recipe = await res.json();
        setRecipe(data);
        setTitle(data.title);
        setDescription(data.description);
        setHidden(data.hidden);
        setFont(data.font);
        setPdfSize(data.pdfSize as '3x5' | 'letter');
        setIngredients(
          data.ingredients.map((str) => {
            const [quantity = '', unit = '', item = ''] = str.split('_');
            return { quantity, unit, item };
          }),
        );
        setInstructions(data.instructions);
      } else {
        toast.error('Failed to load recipe.');
      }
    };

    fetchRecipe();
  }, [id]);

  const handleUpdateRecipe = async () => {
    setLoading(true);
    const res = await fetch(`/api/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        hidden,
        font,
        pdfSize,
        ingredients: ingredients.map((ing) => `${ing.quantity}_${ing.unit}_${ing.item}`),
        instructions,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error('Failed to update recipe');
    } else {
      toast.success('Recipe updated!');
    }
  };

  if (!recipe) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white border rounded">
      <h2>Edit Recipe</h2>

      <label>
        Title:
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter recipe title"
        />
      </label>

      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a short description"
        />
      </label>

      <h3>Ingredients</h3>
      {ingredients.map((ing, idx) => (
        <div key={idx} className="mb-2">
          <label>
            Qty:
            <input
              value={ing.quantity}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                newIngredients[idx].quantity = e.target.value;
                setIngredients(newIngredients);
              }}
              placeholder="e.g. 1"
            />
          </label>
          <label>
            Unit:
            <input
              value={ing.unit}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                newIngredients[idx].unit = e.target.value;
                setIngredients(newIngredients);
              }}
              placeholder="e.g. cup"
            />
          </label>
          <label>
            Item:
            <input
              value={ing.item}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                newIngredients[idx].item = e.target.value;
                setIngredients(newIngredients);
              }}
              placeholder="e.g. flour"
            />
          </label>
        </div>
      ))}

      <h3>Instructions</h3>
      {instructions.map((step, idx) => (
        <label key={idx} className="block mb-2">
          Step {idx + 1}:
          <textarea
            value={step}
            onChange={(e) => {
              const newInstructions = [...instructions];
              newInstructions[idx] = e.target.value;
              setInstructions(newInstructions);
            }}
            placeholder="Describe the step..."
          />
        </label>
      ))}

      <label>
        Private:
        <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
      </label>

      <button onClick={handleUpdateRecipe} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Recipe Preview */}
      <fieldset className="mt-6">
        <div
          id="recipe-preview"
          style={{ fontFamily: `'${font}', sans-serif` }}
        >
          <h2>{title || 'Recipe Title'}</h2>
          <p>{description || 'Short description...'}</p>
          <h3>Ingredients</h3>
          <ul>
            {ingredients.filter((ing) => ing.item || ing.quantity).map((ing, i) => (
              <li key={i}>{ing.quantity} {ing.unit} {ing.item}</li>
            ))}
          </ul>
          <h3>Instructions</h3>
          <ol>
            {instructions.filter(Boolean).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </fieldset>
    </div>
  );
}
