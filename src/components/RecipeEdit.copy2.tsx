// 'use client';
// import { useState } from 'react';
// import { Prisma } from '@prisma/client';
// import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';

// type RecipeWithUser = Prisma.RecipeGetPayload<{ include: { user: true } }>;

// export default function RecipeEdit({ recipe }: { recipe: RecipeWithUser }) {
//   const [title, setTitle] = useState(recipe.title || '');
//   const [description, setDescription] = useState(recipe.description || '');
//   const [ingredients, setIngredients] = useState(recipe.ingredients || []);
//   const [instructions, setInstructions] = useState(recipe.instructions || []);
//   const [pdfSize, setPdfSize] = useState(recipe.pdfSize || '3x5');
//   const [showAuthor, setShowAuthor] = useState(true);
//   const [showDescription, setShowDescription] = useState(true);
//   const [hidden, setHidden] = useState(recipe.hidden || false);
//   const [font, setFont] = useState('Roboto');
//   const [tab, setTab] = useState<'editor' | 'decor'>('editor');
//   const [loading, setLoading] = useState(false);

//   const addIngredient = () => setIngredients([...ingredients, { quantity: '', unit: '', item: '' }]);

//   const removeIngredient = (index: number) => {
//     const newList = [...ingredients];
//     newList.splice(index, 1);
//     setIngredients(newList);
//   };

//   const moveIngredient = (index: number, direction: 'up' | 'down') => {
//     const newList = [...ingredients];
//     const newIndex = direction === 'up' ? index - 1 : index + 1;
//     if (newIndex < 0 || newIndex >= newList.length) return;
//     [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
//     setIngredients(newList);
//   };

//   const updateField = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, value: T) => {
//     setter((prev) => {
//       const newList = [...prev];
//       newList[index] = value;
//       return newList;
//     });
//   };

//   const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, '']);

//   const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => {
//     const newList = [...list];
//     newList.splice(index, 1);
//     setter(newList);
//   };

//   const moveField = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, direction: 'up' | 'down') => {
//     const newList = [...list];
//     const newIndex = direction === 'up' ? index - 1 : index + 1;

//     if (newIndex < 0 || newIndex >= list.length) return;

//     [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
//     setter(newList);
//   };
//   return (
//     <div className="h-dvh">
//       <div className="flex h-dvh p-4">
//         {/* Left Panel */}
//         <section className=" bg-slate-200 border-slate-800 flex-2/5 rounded-lg border-2 w-full flex flex-col h-max p-4 drop-shadow-md">
//           <div className="">
//             {/* Tabs at top */}
//             <div className="flex px-4 mb-6 border-b">
//               <button className={`px-4 py-2 border-b-2 text-md ${tab === 'editor' ? 'border-secondary font-semibold' : 'border-transparent'}`} onClick={() => setTab('editor')}>
//                 Edit Recipe
//               </button>
//               <button className={`px-4 py-2 border-b-2 ${tab === 'decor' ? 'border-secondary font-semibold' : 'border-transparent'}`} onClick={() => setTab('decor')}>
//                 Style
//               </button>
//             </div>

//             {/* Tab content */}
//             {tab === 'editor' && (
//               <div className="space-y-2 ">
//                 <h1 className="text-2xl font-bold">Create Recipe Card</h1>
//                 <div className="flex items-center space-x-2">
//                   <label htmlFor="pdf-size" className="font-semibold">
//                     Card Size:
//                   </label>
//                   <select id="pdf-size" value={recipe.pdfSize} onChange={(e) => setPdfSize(e.target.value as '3x5' | 'letter')} className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 p-2 rounded-md placeholder:text-slate-300 border ">
//                     <option value="3x5">3 x 5</option>
//                     <option value="letter">Letter</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label htmlFor="title" className="sr-only">
//                     Recipe Title
//                   </label>
//                   <input name="title" id="title" placeholder="Recipe Title" className="w-full border p-2 rounded-md bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block " value={title} onChange={(e) => setTitle(e.target.value)} />
//                 </div>

//                 <div>
//                   <SignedIn>
//                     <div>
//                       <input type="checkbox" id="show-author" checked={showAuthor} onChange={(e) => setShowAuthor(e.target.checked)} />
//                       <label htmlFor="show-author" className="text-sm font-medium ml-2">
//                         Show Author: {recipe.user?.username}
//                       </label>
//                     </div>
//                   </SignedIn>
//                 </div>

//                 <div>
//                   <div>
//                     <input type="checkbox" id="show-description" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
//                     <label htmlFor="show-description" className="text-sm font-medium ml-2">
//                       Show Description
//                     </label>
//                   </div>
//                   <label htmlFor="recipe-description" className="sr-only">
//                     Short Description
//                   </label>
//                   <textarea id="recipe-description" placeholder="Short Description" className="w-full border p-2 rounded-md bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block " value={description} onChange={(e) => setDescription(e.target.value)} />
//                 </div>
//                 <div>
//                   <h2 className="font-semibold py-2">Ingredients</h2>
//                   {recipe.ingredients.map((ingredient, i) => (
//                     <div key={i} className="flex gap-2 mb-2 items-center">
//                       {/* Quantity */}
//                       <input
//                         type="text"
//                         placeholder="Quantity"
//                         value={ingredient.quantity}
//                         onChange={(e) => updateField(setIngredients, i, { ...ingredient, quantity: e.target.value })}
//                         className="w-20 bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded-md"
//                       />

//                       {/* Unit */}
//                       <label htmlFor={`unit-select-${i}`} className="sr-only">
//                         Ingredient unit
//                       </label>
//                       <select
//                         id={`unit-select-${i}`}
//                         value={ingredient.unit}
//                         onChange={(e) => updateField(setIngredients, i, { ...ingredient, unit: e.target.value })}
//                         className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded placeholder:text-slate-300 border w-full"
//                       >
//                         <option value="">Unit</option>
//                         <option value="tsp">tsp</option>
//                         <option value="tbsp">tbsp</option>
//                         <option value="cup">cup</option>
//                         <option value="oz">oz</option>
//                         <option value="lb">lb</option>
//                         <option value="pint">pint</option>
//                         <option value="liter">liter</option>
//                         <option value="g">g</option>
//                         <option value="kg">kg</option>
//                         <option value="ml">ml</option>
//                         <option value="pcs">pcs</option>
//                         <option value="pinch">pinch</option>
//                         <option value="dash">dash</option>
//                         <option value="knob">knob</option>
//                         <option value="finger">finger</option>
//                       </select>

//                       {/* Name */}
//                       <input
//                         type="text"
//                         placeholder="Ingredient"
//                         value={ingredient.item}
//                         onChange={(e) => updateField(setIngredients, i, { ...ingredient, item: e.target.value })}
//                         className="flex-grow bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block p-2 rounded"
//                       />

//                       {/* Reorder and Remove */}
//                       <button className="text-slate-700" onClick={() => moveIngredient(i, 'up')} disabled={i === 0} title="Move up">
//                         ↑
//                       </button>
//                       <button className="text-slate-700" onClick={() => moveIngredient(i, 'down')} disabled={i === ingredients.length - 1} title="Move down">
//                         ↓
//                       </button>
//                       <button onClick={() => removeIngredient(i)} className="text-rose-600" title="Remove">
//                         ✕
//                       </button>
//                     </div>
//                   ))}

//                   <button className="text-slate-700" onClick={addIngredient}>
//                     + Add Ingredient
//                   </button>
//                 </div>

//                 <div>
//                   <h2 className="font-semibold py-2">Instructions</h2>
//                   {recipe.instructions.map((step, i) => (
//                     <div key={i} className="flex gap-2 mb-2 items-center">
//                       <label htmlFor={`step-${i}`} className="sr-only">
//                         Step {i + 1}
//                       </label>
//                       <input
//                         id={`step-${i}`}
//                         name={`step-${i}`}
//                         placeholder={`Step ${i + 1}`}
//                         className="flex-grow bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 block border p-2 rounded-md"
//                         value={step}
//                         onChange={(e) => updateField(setInstructions, i, e.target.value)}
//                       />
//                       <button className="text-slate-700" onClick={() => moveField(setInstructions, recipe.instructions, i, 'up')} disabled={i === 0} title="Move up">
//                         ↑
//                       </button>
//                       <button className="text-slate-700" onClick={() => moveField(setInstructions, recipe.instructions, i, 'down')} disabled={i === instructions.length - 1} title="Move down">
//                         ↓
//                       </button>
//                       <button onClick={() => removeField(setInstructions, recipe.instructions, i)} className="text-rose-600" title="Remove">
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                   <button className="text-slate-700" onClick={() => addField(setInstructions, instructions)}>
//                     + Add Step
//                   </button>
//                 </div>
//                 <div>
//                   <input type="checkbox" id="hidden" checked={recipe.hidden} onChange={(e) => setHidden(e.target.checked)} />
//                   <label htmlFor="hidden" className="text-sm font-medium ml-2">
//                     Private
//                   </label>
//                 </div>
//                 <div className="gap-2 flex">
//                   <button
//                     className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600"
//                     onClick={handlePDFExport}
//                   >
//                     Export as PDF
//                   </button>
//                   <SignedIn>
//                     <button
//                       className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600"
//                       disabled={loading}
//                       onClick={handleCreateRecipe}
//                     >
//                       {loading ? 'Saving...' : 'Save Recipe'}
//                     </button>
//                   </SignedIn>
//                   <SignedOut>
//                     <SignInButton>
//                       <button className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-400 text-lg font-medium text-slate-900 transition-all hover:border-2 hover:border-slate-500 hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 active:border-slate-600">
//                         Sign In to Save
//                       </button>
//                     </SignInButton>
//                   </SignedOut>
//                 </div>
//               </div>
//             )}

//             {tab === 'decor' && (
//               <div className="space-y-6">
//                 <h2 className="text-2xl font-bold">Customize Card</h2>

//                 <div className="flex items-center space-x-2">
//                   <label htmlFor="font-select" className="font-semibold">
//                     Font:
//                   </label>
//                   <select id="font-select" className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus:ring-slate-500 focus:border-slate-500 p-2 rounded-md placeholder:text-slate-300 border" value={font} onChange={(e) => setFont(e.target.value)} title="Font style">
//                     {googleFonts.map((f) => (
//                       <option key={f.value} value={f.value}>
//                         {f.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* <div className="hidden">
//                   <h3 className="font-semibold mb-2">Text Color</h3>
//                   <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Text color" />
//                 </div> */}

//                 {/* <div className="hidden">
//                   <h3 className="font-semibold mb-2">Background Color</h3>
//                   <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Background color" />
//                 </div> */}

//                 {/* <div className="hidden">
//                   <h3 className="font-semibold mb-2">Border Color</h3>
//                   <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Border color" />
//                 </div> */}
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Live Preview */}
//         <fieldset className="ml-4 h-max flex fieldset justify-center border-2 bg-slate-200 rounded-lg border-slate-800 items-center flex-3/5 drop-shadow-md">
//           <div className="w-full h-full max-h-full flex justify-center items-center overflow-auto">
//             <div
//               id="recipe-preview"
//               className="relative m-6 w-full max-w-full h-auto export-recipe"
//               style={{
//                 fontFamily: `'${recipe.font}', sans-serif`,
//                 // backgroundColor,
//                 // color: textColor,
//                 // border: `2px solid ${borderColor}`,
//                 // borderRadius: '0.5rem',
//                 aspectRatio: recipe.pdfSize === '3x5' ? '5 / 3' : '8.5 / 11',
//               }}
//             >
//               <div className={`text-[clamp(0.5rem,1.5vw,1rem)] leading-snug p-4 box-border w-full h-full ${recipe.pdfSize === '3x5' ? 'flex flex-row gap-4 ' : ''}`}>
//                 <div className={`${recipe.pdfSize === '3x5' ? 'h-[3in] w-[5in] overflow-hidden' : 'w-full'}`}>
//                   <h2 className="text-[clamp(1rem,3vw,1.5rem)] font-bold">{recipe.title || 'Recipe Title'}</h2>
//                   {showAuthor && <p className="italic text-sm mb-2">By {recipe.user?.username || ''}</p>}
//                   {showDescription && <p className="">{recipe.description || 'Short description...'}</p>}

//                   <h3 className="font-semibold mb-1 mt-4">Ingredients</h3>
//                   <ul className="list-none text-sm mb-4">
//                     {recipe.ingredients
//                       .filter((ing) => ing.item || ing.quantity)
//                       .map((ing, i) => (
//                         <li key={i}>
//                           <span className="bullet">&bull;</span> {ing.quantity} {ing.unit} {ing.item}
//                         </li>
//                       ))}
//                   </ul>
//                 </div>

//                 <div className={`${recipe.pdfSize === '3x5' ? 'w-3/4' : 'w-full'}`}>
//                   <h3 className="font-semibold mb-1">Instructions</h3>
//                   <ol className="list-none test-sm">
//                     {recipe.instructions.filter(Boolean).map((step, i) => (
//                       <li className="mb-0 text-sm" key={i}>
//                         <span className="bullet">{i + 1}.&nbsp;</span>
//                         {step}
//                       </li>
//                     ))}
//                   </ol>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </fieldset>
//       </div>
//     </div>
//   );
// }
