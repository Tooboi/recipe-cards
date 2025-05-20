'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import '@fontsource/rubik';
import '@fontsource/nunito';

export default function NewCard() {
  type Ingredient = {
    quantity: string;
    unit: string;
    item: string;
  };
  const googleFonts = [
    { label: 'Rubik', value: 'Rubik' },
    { label: 'Nunito', value: 'Nunito' },
  ];
  const [tab, setTab] = useState<'editor' | 'decor'>('editor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(['']);
  const [pdfSize, setPdfSize] = useState<'3x5' | 'letter'>('3x5');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ quantity: '', unit: '', item: '' }]);

  const [font, setFont] = useState<string>('Rubik');

  const [textColor, setTextColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [borderColor, setBorderColor] = useState<string>('#ffffff');

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

  const handlePDFExport = async () => {
    const card = document.getElementById('recipe-preview');
    if (!card) return;

    const scale = pdfSize === '3x5' ? 2 : 3;
    const canvas = await html2canvas(card, {
      scale,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // Define page size in inches
    const pageSize = pdfSize === '3x5' ? [3, 5] : [8.5, 11];

    const pdf = new jsPDF({
      orientation: 'portrait',
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
    <div className="grid grid-cols-5 p-4 gap-4">
      {/* Left Panel */}
      <fieldset className="fieldset bg-base-200 border-primary col-span-2 rounded-lg border-2 w-full flex flex-col  p-4">
        <div className="">
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
                <label htmlFor="pdf-size" className="mr-2 font-semibold">
                  PDF Size:
                </label>
                <select id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(e.target.value as '3x5' | 'letter')} className="select select-bordered">
                  <option value="3x5">3x5 Card</option>
                  <option value="letter">Letter (8.5x11 in)</option>
                </select>
              </div>

              <div>
                <label htmlFor="recipe-title" className="sr-only">
                  Recipe Title
                </label>
                <input id="recipe-title" placeholder="Recipe Title" className="w-full input input-primary border p-2 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <label htmlFor="recipe-description" className="sr-only">
                  Short Description
                </label>
                <textarea id="recipe-description" placeholder="Short Description" className="w-full textarea textarea-primary border p-2 rounded-md" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <h2 className="font-semibold">Ingredients</h2>
                {ingredients.map((ingredient, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    {/* Quantity */}
                    <input type="text" placeholder="Quantity" value={ingredient.quantity} onChange={(e) => updateField(setIngredients, i, { ...ingredient, quantity: e.target.value }, ingredients)} className="w-20 input input-primary p-2 rounded-md" />

                    {/* Unit */}
                    <label htmlFor={`unit-select-${i}`} className="sr-only">
                      Ingredient unit
                    </label>
                    <select id={`unit-select-${i}`} value={ingredient.unit} onChange={(e) => updateField(setIngredients, i, { ...ingredient, unit: e.target.value }, ingredients)} className="select select-primary p-2 rounded">
                      <option value="">Unit</option>
                      <option value="tsp">tsp</option>
                      <option value="tbsp">tbsp</option>
                      <option value="cup">cup</option>
                      <option value="oz">oz</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="pinch">pinch</option>
                      <option value="dash">dash</option>
                    </select>

                    {/* Name */}
                    <input type="text" placeholder="Ingredient" value={ingredient.item} onChange={(e) => updateField(setIngredients, i, { ...ingredient, item: e.target.value }, ingredients)} className="flex-grow input input-primary p-2 rounded" />

                    {/* Reorder and Remove */}
                    <button className="text-primary btn btn-xs" onClick={() => moveIngredient(i, 'up')} disabled={i === 0} title="Move up">
                      ↑
                    </button>
                    <button className="text-primary btn btn-xs" onClick={() => moveIngredient(i, 'down')} disabled={i === ingredients.length - 1} title="Move down">
                      ↓
                    </button>
                    <button onClick={() => removeIngredient(i)} className="text-warning" title="Remove">
                      ✕
                    </button>
                  </div>
                ))}

                <button className="text-info" onClick={addIngredient}>
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
                <h3 className="font-semibold mb-2">Font</h3>
                <select className="select select-bordered" value={font} onChange={(e) => setFont(e.target.value)} title="Font style">
                  {googleFonts.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Text Color</h3>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Text color" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Background Color</h3>
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Background color" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Border Color</h3>
                <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Border color" />
              </div>
            </div>
          )}
        </div>
      </fieldset>


      {/* Live Preview */}
      <fieldset className="p-4 flex fieldset justify-center border-2 rounded-lg border-primary items-center col-span-3 flex-grow">
        <div className="border border-black rounded-lg">
          <div
            id="recipe-preview"
            className={`relative w-full max-w-[min(100%,${pdfSize === '3x5' ? '15rem' : '44rem'})] aspect-[${pdfSize === '3x5' ? '5/3' : '11/8.5'}] p-4 scale-container`}
            style={{
              fontFamily: `'${font}', sans-serif`,
              backgroundColor,
              color: textColor,
              border: `2px solid ${borderColor}`,
            }}
          >
            <div className="text-[clamp(0.5rem,1.5vw,1rem)] leading-snug">
              <h2 className="text-[clamp(1rem,3vw,1.5rem)] font-bold mb-2">{title || 'Recipe Title'}</h2>
              <p className="mb-4">{description || 'Short description...'}</p>

              <h3 className="font-semibold mb-1">Ingredients</h3>
              <ul className="list-disc list-inside mb-4">
                {ingredients
                  .filter((ing) => ing.item || ing.quantity)
                  .map((ing, i) => (
                    <li key={i}>
                      {ing.quantity} {ing.unit} {ing.item}
                    </li>
                  ))}
              </ul>

              <h3 className="font-semibold mb-1">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1">
                {instructions.filter(Boolean).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
