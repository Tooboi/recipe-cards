'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function NewCard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);

  const handlePDFExport = async () => {
    const card = document.getElementById('recipe-preview');
    const canvas = await html2canvas(card);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title || 'recipe'}.pdf`);
  };

  const updateField = (setter, index, value, list) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const addField = (setter, list) => setter([...list, '']);
  const removeField = (setter, list, index) => {
    const newList = [...list];
    newList.splice(index, 1);
    setter(newList);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* Recipe Form */}
      <div className="w-full md:w-1/2 space-y-4">
        <h1 className="text-2xl font-bold">Create Recipe Card</h1>
        <input
          className="w-full border p-2 rounded"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <h2 className="font-semibold">Ingredients</h2>
          {ingredients.map((ingredient, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-grow border p-2 rounded"
                value={ingredient}
                onChange={(e) =>
                  updateField(setIngredients, i, e.target.value, ingredients)
                }
              />
              <button
                onClick={() => removeField(setIngredients, ingredients, i)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="text-blue-500"
            onClick={() => addField(setIngredients, ingredients)}
          >
            + Add Ingredient
          </button>
        </div>

        <div>
          <h2 className="font-semibold">Instructions</h2>
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="flex-grow border p-2 rounded"
                value={step}
                onChange={(e) =>
                  updateField(setInstructions, i, e.target.value, instructions)
                }
              />
              <button
                onClick={() => removeField(setInstructions, instructions, i)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="text-blue-500"
            onClick={() => addField(setInstructions, instructions)}
          >
            + Add Step
          </button>
        </div>

        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          onClick={handlePDFExport}
        >
          Export as PDF
        </button>
      </div>

      {/* Live Preview */}
      <div
        id="recipe-preview"
        className="w-full md:w-1/2 border rounded-lg p-6 shadow-md bg-white"
      >
        <h2 className="text-2xl font-bold mb-2">{title || 'Recipe Title'}</h2>
        <p className="mb-4 text-gray-600">{description || 'Short description...'}</p>

        <h3 className="font-semibold">Ingredients</h3>
        <ul className="list-disc list-inside mb-4">
          {ingredients.filter(Boolean).map((ing, i) => (
            <li key={i}>{ing}</li>
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
