'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function NewCard() {
  type Ingredient = {
    quantity: string;
    unit: string;
    item: string;
  };

  const [tab, setTab] = useState<'editor' | 'decor'>('editor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ quantity: '', unit: '', item: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const [theme, setTheme] = useState<'classic' | 'modern' | 'fancy'>('classic');
  

const handlePDFExport = async () => {
  const card = document.getElementById('recipe-preview');
  if (!card) return;

  // Force a larger canvas size (scaling)
  const scale = 2;
  const canvas = await html2canvas(card, {
    scale: scale,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');

  // Define A4 size in points (1 pt = 1/72 inch)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  // Center vertically if image is shorter than page
  const y = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;

  pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
  pdf.save(`${title || 'recipe'}.pdf`);
};
 

  const updateField = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, value: T, list: T[]) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, '']);

  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setter(newList);
  };

  const moveField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= list.length) return;

    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setter(newList);
  };

  return (
    <div className="flex gap-8 p-6">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col">
        {/* Tabs at top */}
        <div className="flex gap-4 mb-6 border-b">
          <button className={`px-4 py-2 border-b-2 ${tab === 'editor' ? 'border-info font-semibold' : 'border-transparent'}`} onClick={() => setTab('editor')}>
            Edit Recipe
          </button>
          <button className={`px-4 py-2 border-b-2 ${tab === 'decor' ? 'border-info font-semibold' : 'border-transparent'}`} onClick={() => setTab('decor')}>
            Style
          </button>
        </div>

        {/* Tab content */}
        {tab === 'editor' && (
          <div className="space-y-4 overflow-auto">
            <h1 className="text-2xl font-bold">Create Recipe Card</h1>

            <div>
              <label htmlFor="recipe-title" className="sr-only">
                Recipe Title
              </label>
              <input id="recipe-title" placeholder="Recipe Title" className="w-full border p-2 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label htmlFor="recipe-description" className="sr-only">
                Short Description
              </label>
              <textarea id="recipe-description" placeholder="Short Description" className="w-full border p-2 rounded-md" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <h2 className="font-semibold">Ingredients</h2>
              {ingredients.map((ingredient, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  {/* Quantity */}
                  <input type="text" placeholder="Quantity" value={ingredient.quantity} onChange={(e) => updateField(setIngredients, i, { ...ingredient, quantity: e.target.value }, ingredients)} className="w-20 input p-2 rounded-md" />

                  {/* Unit */}
                  <select value={ingredient.unit} onChange={(e) => updateField(setIngredients, i, { ...ingredient, unit: e.target.value }, ingredients)} className="select p-2 rounded">
                    <option value="">Unit</option>
                    <option value="tsp">tsp</option>
                    <option value="tbsp">tbsp</option>
                    <option value="cup">cup</option>
                    <option value="oz">oz</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="pinch">pinch</option>
                    <option value="dash">dash</option>
                  </select>

                  {/* Name */}
                  <input type="text" placeholder="Ingredient name" value={ingredient.item} onChange={(e) => updateField(setIngredients, i, { ...ingredient, item: e.target.value }, ingredients)} className="flex-grow input p-2 rounded" />

                  {/* Reorder and Remove */}
                  <button className="text-gray-500" onClick={() => moveField(setIngredients, ingredients, i, 'up')} disabled={i === 0} title="Move up">
                    ↑
                  </button>
                  <button className="text-gray-500" onClick={() => moveField(setIngredients, ingredients, i, 'down')} disabled={i === ingredients.length - 1} title="Move down">
                    ↓
                  </button>
                  <button onClick={() => removeField(setIngredients, ingredients, i)} className="text-warning" title="Remove">
                    ✕
                  </button>
                </div>
              ))}

              <button className="text-info" onClick={() => addField(setIngredients, ingredients)}>
                + Add Ingredient
              </button>
            </div>

            <div>
              <h2 className="font-semibold">Instructions</h2>
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <label htmlFor={`step-${i}`} className="sr-only">
                    Step {i + 1}
                  </label>
                  <input id={`step-${i}`} name={`step-${i}`} placeholder={`Step ${i + 1}`} className="flex-grow border p-2 rounded-md" value={step} onChange={(e) => updateField(setInstructions, i, e.target.value, instructions)} />
                  <button className="text-gray-500" onClick={() => moveField(setInstructions, instructions, i, 'up')} disabled={i === 0} title="Move up">
                    ↑
                  </button>
                  <button className="text-gray-500" onClick={() => moveField(setInstructions, instructions, i, 'down')} disabled={i === instructions.length - 1} title="Move down">
                    ↓
                  </button>
                  <button onClick={() => removeField(setInstructions, instructions, i)} className="text-warning" title="Remove">
                    ✕
                  </button>
                </div>
              ))}
              <button className="text-info" onClick={() => addField(setInstructions, instructions)}>
                + Add Step
              </button>
            </div>

            <button className="mt-4 btn btn-primary rounded-md" onClick={handlePDFExport}>
              Export as PDF
            </button>
          </div>
        )}

        {tab === 'decor' && (
          <div className="space-y-6 overflow-auto">
            <h2 className="text-2xl font-bold">Customize Your Card</h2>
            <div>
              <h3 className="font-semibold mb-2">Select a Theme</h3>
              <div className="flex gap-4">
                {['classic', 'modern', 'fancy'].map((style) => (
                  <button key={style} className={`px-4 py-2 border rounded-md ${theme === style ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setTheme(style)}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div id="recipe-preview" className={`w-full md:w-1/2 border rounded-md-lg p-6 shadow-md  ${theme}-theme`}>
        <h2 className="text-2xl font-bold mb-2">{title || 'Recipe Title'}</h2>
        <p className="mb-4">{description || 'Short description...'}</p>

        <h3 className="font-semibold ">Ingredients</h3>
        <ul className="list-disc list-inside mb-4">
          {ingredients
            .filter((ing) => ing.item || ing.quantity)
            .map((ing, i) => (
              <li key={i}>
                {ing.quantity} {ing.unit} {ing.item}
              </li>
            ))}
        </ul>

        <h3 className="font-semibold">Instructions</h3>
        <ol className="list-decimal list-inside space-y-1">
          {instructions.filter(Boolean).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
