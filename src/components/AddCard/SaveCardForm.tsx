'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SaveCardForm() {
  type Ingredient = {
    quantity: string;
    unit: string;
    item: string;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [pdfSize, setPdfSize] = useState<'3x5' | 'letter'>('3x5');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ quantity: '', unit: '', item: '' }]);

  const addIngredient = () => setIngredients([...ingredients, { quantity: '', unit: '', item: '' }]);
  const removeIngredient = (index: number) => {
    const newList = [...ingredients];
    newList.splice(index, 1);
    setIngredients(newList);
  };

  const moveIngredient = (index: number, direction: 'up' | 'down') => {
    const newList = [...ingredients];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newList.length) return;
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    setIngredients(newList);
  };

    const handleSaveRecipe = async () => {
    // const cardContent = {
    //   title,
    //   description,
    //   instructions,
    //   ingredients,
    //   font,
    //   pdfSize,
    // };

    // const card = await prisma.user.create({
    //   data: cardContent,
    // });
    // console.log(card);
    
  };

  const handlePDFExport = async () => {
    const card = document.getElementById('recipe-preview');
    if (!card) return;

    const scale = 3;
    const canvas = await html2canvas(card, {
      scale,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // Define page size in inches
    const pageSize = pdfSize === '3x5' ? [3, 5] : [8.5, 11];

    const pdf = new jsPDF({
      orientation: pdfSize === '3x5' ? 'landscape' : 'portrait',
      unit: 'in',
      format: pageSize,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

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
    <div className="space-y-2 ">
      <h1 className="text-2xl font-bold">Create Recipe Card</h1>
      <div className="flex items-center space-x-2">
        <label htmlFor="pdf-size" className="font-semibold">
          Card Size:
        </label>
        <select id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(e.target.value as '3x5' | 'letter')} className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 p-2 rounded-md placeholder:text-slate-300 border ">
          <option value="3x5">3 x 5</option>
          <option value="letter">Letter</option>
        </select>
      </div>

      <div>
        <label htmlFor="recipe-title" className="sr-only">
          Recipe Title
        </label>
        <input id="recipe-title" placeholder="Recipe Title" className="w-full border p-2 rounded-md bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block " value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="recipe-description" className="sr-only">
          Short Description
        </label>
        <textarea id="recipe-description" placeholder="Short Description" className="w-full border p-2 rounded-md bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block " value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <h2 className="font-semibold py-2">Ingredients</h2>
        {ingredients.map((ingredient, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            {/* Quantity */}
            <input
              type="text"
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(e) => updateField(setIngredients, i, { ...ingredient, quantity: e.target.value }, ingredients)}
              className="w-20 bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md"
            />

            {/* Unit */}
            <label htmlFor={`unit-select-${i}`} className="sr-only">
              Ingredient unit
            </label>
            <select
              id={`unit-select-${i}`}
              value={ingredient.unit}
              onChange={(e) => updateField(setIngredients, i, { ...ingredient, unit: e.target.value }, ingredients)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded placeholder:text-slate-300 border w-full"
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
              <option value="pinch">pinch</option>
              <option value="dash">dash</option>
              <option value="knob">knob</option>
              <option value="finger">finger</option>
            </select>

            {/* Name */}
            <input
              type="text"
              placeholder="Ingredient"
              value={ingredient.item}
              onChange={(e) => updateField(setIngredients, i, { ...ingredient, item: e.target.value }, ingredients)}
              className="flex-grow bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded"
            />

            {/* Reorder and Remove */}
            <button className="text-primary" onClick={() => moveIngredient(i, 'up')} disabled={i === 0} title="Move up">
              ↑
            </button>
            <button className="text-primary" onClick={() => moveIngredient(i, 'down')} disabled={i === ingredients.length - 1} title="Move down">
              ↓
            </button>
            <button onClick={() => removeIngredient(i)} className="text-warning" title="Remove">
              ✕
            </button>
          </div>
        ))}

        <button className="text-secondary" onClick={addIngredient}>
          + Add Ingredient
        </button>
      </div>

      <div>
        <h2 className="font-semibold py-2">Instructions</h2>
        {instructions.map((step, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <label htmlFor={`step-${i}`} className="sr-only">
              Step {i + 1}
            </label>
            <input
              id={`step-${i}`}
              name={`step-${i}`}
              placeholder={`Step ${i + 1}`}
              className="flex-grow bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block border p-2 rounded-md"
              value={step}
              onChange={(e) => updateField(setInstructions, i, e.target.value, instructions)}
            />
            <button className="text-primary" onClick={() => moveField(setInstructions, instructions, i, 'up')} disabled={i === 0} title="Move up">
              ↑
            </button>
            <button className="text-primary" onClick={() => moveField(setInstructions, instructions, i, 'down')} disabled={i === instructions.length - 1} title="Move down">
              ↓
            </button>
            <button onClick={() => removeField(setInstructions, instructions, i)} className="text-warning" title="Remove">
              ✕
            </button>
          </div>
        ))}
        <button className="text-secondary" onClick={() => addField(setInstructions, instructions)}>
          + Add Step
        </button>
      </div>
      <div className="gap-2 flex">
        <button
          className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600"
          onClick={handlePDFExport}
        >
          Export as PDF
        </button>
        {/* <SaveRecipeButton/> */}
        <button
          className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600"
          onClick={handleSaveRecipe}
        >
          Save Recipe
        </button>
      </div>
    </div>
  );
}
