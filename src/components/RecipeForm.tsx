/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import '@fontsource/rubik';
import '@fontsource/nunito';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createRecipe } from '@/app/actions';
import { CldImage, CldUploadWidget } from "next-cloudinary";
import html2pdf from 'html2pdf.js';
import { PhotoIcon } from "@heroicons/react/24/solid";

import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';

function formatBytes(fileSize: number): string {
  const sizes = ["B", "KB", "MB"];

  if (fileSize === 0) return "0 B";

  const i = Math.floor(Math.log(fileSize) / Math.log(1024));
  const formattedSize = (fileSize / Math.pow(1024, i)).toFixed(1);

  // Check if the decimal part is .0, and remove it in that case
  const formattedSizeWithoutDecimal = formattedSize.endsWith(".0")
    ? formattedSize.split(".")[0]
    : formattedSize;

  return `${formattedSizeWithoutDecimal} ${sizes[i]}`;
}

export default function RecipeForm() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    console.log('not signed in');
  }

  useEffect(() => {
    if (user?.username && !authorName) {
      setAuthorName(user.username);
    }
  }, [user?.username]);

  const googleFonts = [
    { label: 'Rubik', value: 'Rubik' },
    { label: 'Nunito', value: 'Nunito' },
  ];
  // const [fontScale, setFontScale] = useState(1);
  const [tab, setTab] = useState<'editor' | 'decor'>('editor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const clerkUserId = user?.id || '';

  const [imageId, setImageId] = useState('');
  const [includeImage, setIncludeImage] = useState(false);

  const defaultAuthor = user?.username || '';
  const [showAuthor, setShowAuthor] = useState(true);
  const [authorName, setAuthorName] = useState(defaultAuthor);

  const [showDescription, setShowDescription] = useState(true);
  const [pdfSize, setPdfSize] = useState<'3x5' | 'letter'>('letter');
  const [instructions, setInstructions] = useState(['']);
  const [ingredients, setIngredients] = useState([{ quantity: '', unit: '', item: '' }]);
  const [font, setFont] = useState<string>('Rubik');
  const [hidden, setHidden] = useState(true);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const transformedIngredients = ingredients.map((ing) => `${ing.quantity}_${ing.unit}_${ing.item}`);

  const handleCreateRecipe = async () => {
    console.log('Ingredients before saving:', transformedIngredients);
    console.log(clerkUserId);

    setLoading(true);
    try {
      await createRecipe({
        title,
        description,
        ingredients: transformedIngredients,
        instructions,
        pdfSize,
        font,
        hidden,
        clerkUserId,
        imageId: includeImage ? imageId : '',
        author: showAuthor ? authorName : '',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setInstructions(['']);
      setIngredients([{ quantity: '', unit: '', item: '' }]);
      setFont('Rubik');
      setHidden(true);
      setImageId('');

      toast.success('Recipe Saved!');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      toast.error(error.message || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFExport = async () => {
    // const html2pdf = await require('html2pdf.js')
    const element = document.querySelector('#recipe-preview');

    if (!element) {
      console.error("Recipe preview element not found!");
      return;
    }

    html2pdf()
      .from(element as HTMLElement)
      .set({
        filename: `${title || 'recipe'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          useCORS: true,
          scale: 2,
        },
        jsPDF: {
          unit: 'in',
          format: pdfSize === '3x5' ? [5, 3] : 'letter',
          orientation: pdfSize === '3x5' ? 'landscape' : 'portrait',
        },
      })
      .save();


    // const card = document.getElementById('recipe-preview');
    // if (!card) return;

    // const scale = 3;
    // const canvas = await html2canvas(card, {
    //   scale,
    //   useCORS: true,
    //   allowTaint: true,
    //   foreignObjectRendering: false,
    // });

    // const imgData = canvas.toDataURL('image/png');

    // // Define page size in inches
    // const pageSize = pdfSize === '3x5' ? [3, 5] : [8.5, 11];

    // const pdf = new jsPDF({
    //   orientation: pdfSize === '3x5' ? 'landscape' : 'portrait',
    //   unit: 'in',
    //   format: pageSize,
    // });

    // const pageWidth = pdf.internal.pageSize.getWidth();
    // const pageHeight = pdf.internal.pageSize.getHeight();

    // const imgProps = pdf.getImageProperties(imgData);
    // const imgWidth = pageWidth;
    // const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // const y = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;

    // pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
    // pdf.save(`${title || 'recipe'}.pdf`);
  };

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

  const updateField = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, value: T) => {
    setter((prev) => {
      const newList = [...prev];
      newList[index] = value;
      return newList;
    });
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

  const maxFileSize = 41943040; // 40MB in B
  const [buttonClassName, setButtonClassName] = useState(
    "w-full mx-auto p-2 justify-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-900 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-400/80 hover:text-gray-700 active:bg-gray-500 active:text-gray-900 active:border-gray-600"
  );

  return (
    <div className="h-dvh">
      <div className="flex h-dvh p-4">
        {/* Left Panel */}
        <section className=" bg-gray-300 border-gray-800 flex-2/5 rounded-lg border-2 w-full flex flex-col h-max p-4 drop-shadow-md">
          <div className="">
            {/* Tabs at top */}
            <div className="flex px-4 mb-6 border-b-2">
              <button className={`px-4 py-2 text-md ${tab === 'editor' ? 'border-secondary font-semibold' : 'border-transparent'}`} onClick={() => setTab('editor')}>
                Edit Recipe
              </button>
              <button className={`px-4 py-2 border-b-2 ${tab === 'decor' ? 'border-secondary font-semibold' : 'border-transparent'}`} onClick={() => setTab('decor')}>
                Style
              </button>
            </div>

            {/* Tab content */}
            {tab === 'editor' && (
              <div className="space-y-2 ">
                <h1 className="text-2xl font-bold mx-auto">Create Recipe Card</h1>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="include-image"
                    checked={includeImage}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeImage(checked);
                      if (!checked) {
                        setImageId('');
                        setButtonClassName(
                          "w-full mx-auto p-1 justify-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-900"
                        );
                      }
                    }}
                  />
                  <label htmlFor="include-image" className="text-sm font-medium">
                    Include image
                  </label>
                </div>
                {includeImage && (
                  <>
                    {imageId ? (
                      <div className="h-full w-full flex">
                        <div className="overflow-hidden lg:mx-auto">
                          <CldImage
                            alt="Thumbnail"
                            src={imageId}
                            width="200"
                            height="200"
                            crop="fill"
                            aspectRatio="1:1"
                            sizes="100vw"
                            className="mx-auto rounded-lg border-2 border-gray-700"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 w-full rounded-lg border-2 border-gray-700 bg-gray-400 mx-auto">
                        <PhotoIcon className="mx-auto w-36 text-gray-700" />
                        <p className="mt-[-1rem] select-none pb-2 text-center text-xs text-gray-700 lg:text-sm">
                          Max {formatBytes(maxFileSize)}
                        </p>
                      </div>
                    )}

                    <CldUploadWidget
                      uploadPreset="recipe"
                      options={{
                        maxImageFileSize: maxFileSize,
                        maxFiles: 1,
                        sources: ["local", "dropbox", "google_drive", "instagram", "unsplash"],
                        autoMinimize: true,
                      }}
                      onSuccess={(result: any) => {
                        setImageId(result.info.public_id);
                        setButtonClassName("hidden");
                      }}
                    >
                      {({ open }) => (
                        <button
                          className={buttonClassName}
                          onClick={(e) => {
                            e.preventDefault();
                            open();
                          }}
                        >
                          Add Image
                        </button>
                      )}
                    </CldUploadWidget>
                  </>
                )}


                <div className="flex items-center space-x-2">
                  <label htmlFor="pdf-size" className="font-semibold">
                    Card Size:
                  </label>
                  <select id="pdf-size" value={pdfSize} onChange={(e) => setPdfSize(e.target.value as '3x5' | 'letter')} className="bg-gray-50 border-gray-400 border-2 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 p-2 rounded-md placeholder:text-gray-300 ">
                    <option value="3x5">3 x 5</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="sr-only">
                    Recipe title
                  </label>
                  <input name="title" id="title" placeholder="Recipe Title" className="w-full border-2 p-2 rounded-md bg-gray-50 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block " value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div>
                  <SignedIn>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show-author"
                          checked={showAuthor}
                          onChange={(e) => setShowAuthor(e.target.checked)}
                        />
                        <label htmlFor="show-author" className="text-sm font-medium ml-2">
                          Show author
                        </label>
                      </div>

                      {showAuthor && (
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Author name"
                          className="w-full border-2 p-2 rounded-md bg-gray-50 border-gray-400 text-sm focus:ring-gray-500 focus:border-gray-500"
                        />
                      )}
                    </div>
                  </SignedIn>

                </div>

                <div>
                  <div>
                    <input type="checkbox" id="show-description" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
                    <label htmlFor="show-description" className="text-sm font-medium ml-2">
                      Show description
                    </label>
                  </div>
                  <label htmlFor="recipe-description" className="sr-only">
                    Short description
                  </label>
                  <textarea id="recipe-description" placeholder="Short Description" className="w-full border-2 p-2 rounded-md bg-gray-50 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block " value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                  <h2 className="font-semibold py-2">Ingredients</h2>
                  {ingredients.map((ingredient, i) => (
                    <div key={i} className="grid grid-flow-col grid-cols-6 gap-1 mb-2 items-center justify-between">
                      {/* Quantity */}
                      <input
                        type="text"
                        placeholder="Quantity"
                        value={ingredient.quantity}
                        onChange={(e) => updateField(setIngredients, i, { ...ingredient, quantity: e.target.value })}
                        className="col-span-1 bg-gray-50 border-2 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md"
                      />

                      {/* Unit */}
                      <label htmlFor={`unit-select-${i}`} className="sr-only">
                        Ingredient unit
                      </label>
                      <select
                        id={`unit-select-${i}`}
                        value={ingredient.unit}
                        onChange={(e) => updateField(setIngredients, i, { ...ingredient, unit: e.target.value })}
                        className="col-span-1 bg-gray-50 border-2 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md placeholder:text-gray-300 "
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

                      {/* Name */}
                      <input
                        type="text"
                        placeholder="Ingredient"
                        value={ingredient.item}
                        onChange={(e) => updateField(setIngredients, i, { ...ingredient, item: e.target.value })}
                        className="col-span-3 bg-gray-50 border-gray-400 border-2 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md"
                      />

                      {/* Reorder and Remove */}
                      <div className=' flex justify-start'>
                        <button className="text-gray-700" onClick={() => moveIngredient(i, 'up')} disabled={i === 0} title="Move up">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                          </svg>

                        </button>
                        <button className="text-gray-700" onClick={() => moveIngredient(i, 'down')} disabled={i === ingredients.length - 1} title="Move down">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                          </svg>

                        </button>
                        <button onClick={() => removeIngredient(i)} className="text-rose-600" title="Remove">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>


                        </button>
                      </div>
                    </div>
                  ))}

                  <button className="text-gray-800 flex-row flex px-1 pr-2 py-0.5 bg-gray-400 hover:bg-gray-200 active:bg-gray-400 transition-all rounded border-gray-400 border-2" onClick={addIngredient}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 mt-0.25  mr-1">
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    Add Ingredient
                  </button>
                </div>

                <div>
                  <h2 className="font-semibold py-2">Instructions</h2>
                  {instructions.map((step, i) => (
                    <div key={i} className="grid grid-flow-col grid-cols-6 gap-1 mb-2 items-center">
                      <label htmlFor={`step-${i}`} className="sr-only">
                        Step {i + 1}
                      </label>
                      <input
                        id={`step-${i}`}
                        name={`step-${i}`}
                        placeholder={`Step ${i + 1}`}
                        className="col-span-5 bg-gray-50 border-2 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 block p-2 rounded-md"
                        value={step}
                        onChange={(e) => updateField(setInstructions, i, e.target.value)}
                      />
                      <div className='flex justify-start'>
                        <button className="text-gray-700" onClick={() => moveField(setInstructions, instructions, i, 'up')} disabled={i === 0} title="Move up">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="text-gray-700" onClick={() => moveField(setInstructions, instructions, i, 'down')} disabled={i === instructions.length - 1} title="Move down">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button onClick={() => removeField(setInstructions, instructions, i)} className="text-rose-600" title="Remove">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="text-gray-800 flex-row flex px-1 pr-2 py-0.5 bg-gray-400 hover:bg-gray-200 active:bg-gray-400 transition-all rounded border-gray-400 border-2" onClick={() => addField(setInstructions, instructions)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 mt-0.25 mr-1">
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg> Add Step
                  </button>
                </div>
                <div>
                  <input type="checkbox" id="hidden" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                  <label htmlFor="hidden" className="text-sm font-medium ml-2">
                    Private
                  </label>
                </div>
                <div className="gap-2 flex">
                  <button
                    className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-900 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-400/80 hover:text-gray-700 active:bg-gray-500 active:text-gray-900 active:border-gray-600"
                    onClick={handlePDFExport}
                  >
                    Export as PDF
                  </button>
                  <SignedIn>
                    <button
                      className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-900 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-400/80 hover:text-gray-700 active:bg-gray-500 active:text-gray-900 active:border-gray-600"
                      disabled={loading}
                      onClick={handleCreateRecipe}
                    >
                      {loading ? 'Saving...' : 'Save Recipe'}
                    </button>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton>
                      <button className="w-1/2 mx-auto p-2 justify-center rounded-md border-2 border-gray-600 bg-gray-400 text-lg font-medium text-gray-900 transition-all hover:border-2 hover:border-gray-500 hover:bg-gray-400/80 hover:text-gray-700 active:bg-gray-500 active:text-gray-900 active:border-gray-600">
                        Sign In to Save
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            )}

            {tab === 'decor' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Customize Card</h2>

                <div className="flex items-center space-x-2">
                  <label htmlFor="font-select" className="font-semibold">
                    Font:
                  </label>
                  <select id="font-select" className="bg-gray-50 border-gray-400 text-gray-900 text-sm focus:ring-gray-500 focus:border-gray-500 p-2 rounded-md placeholder:text-gray-300 border" value={font} onChange={(e) => setFont(e.target.value)} title="Font style">
                    {googleFonts.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <label htmlFor="font-scale" className="font-semibold">
                    Font Scale:
                  </label>
                  <input
                    id="font-scale"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={fontScale}
                    onChange={(e) => setFontScale(parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm">{(fontScale * 100).toFixed(0)}%</span>
                </div> */}


                {/* <div className="hidden">
                  <h3 className="font-semibold mb-2">Text Color</h3>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Text color" />
                </div> */}

                {/* <div className="hidden">
                  <h3 className="font-semibold mb-2">Background Color</h3>
                  <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Background color" />
                </div> */}

                {/* <div className="hidden">
                  <h3 className="font-semibold mb-2">Border Color</h3>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="input input-bordered w-24 p-0 h-10" title="Border color" />
                </div> */}
              </div>
            )}
          </div>
        </section>

        {/* Live Preview */}
        <fieldset className="hidden lg:block ml-4 h-max flex fieldset justify-center border-2 bg-gray-200 rounded-lg border-gray-800 items-center flex-3/5 drop-shadow-md ">
          <div className="w-full h-full max-h-full flex justify-center items-center overflow-auto">
            <div
              id="recipe-preview"
              className="relative w-full max-w-full h-auto rounded-lg export-recipe"
              style={{
                fontFamily: `'${font}', sans-serif`,
                // fontSize: `${fontScale}rem`,
                // backgroundColor,
                // color: textColor,
                // border: `2px solid ${borderColor}`,
                // borderRadius: '0.5rem',
                aspectRatio: pdfSize === '3x5' ? '5 / 3' : '8.5 / 11',
              }}
            >
              <div className={`text-[clamp(0.5rem,1.5vw,1rem)] leading-snug p-4 box-border w-full h-full ${pdfSize === '3x5' ? 'flex flex-row gap-4 ' : ''}`}>
                <div className={`${pdfSize === '3x5' ? 'h-[3in] w-[5in] ' : 'w-full'}`}>
                  <div className='flex justify-between'>
                    <div>
                      <h2 className="text-[clamp(1rem,3vw,1.5rem)] font-bold">{title || 'Recipe Title'}</h2>
                      {showAuthor && authorName && (
                        <p className="italic text-[clamp(0.5rem,1.5vw,1rem)] mb-2">By {authorName}</p>
                      )}
                      {showDescription && <p className="text-[clamp(0.5rem,1.5vw,1rem)]">{description || 'Short description...'}</p>}
                    </div>
                    {includeImage && (
                      <>
                        {!imageId && <PhotoIcon className="w-24 text-gray-700 p-0" />}
                        {imageId && (
                          <CldImage
                            alt="Thumbnail"
                            src={imageId}
                            width="100"
                            height="100"
                            crop="fill"
                            aspectRatio="1:1"
                            format="jpg"
                            sizes="100vw"
                            className="w-32 h-32 block rounded-md"
                          />
                        )}
                      </>
                    )}

                  </div>


                  <h2 className="font-semibold mb-1 text-lg mt-4">Ingredients</h2>
                  <ol className="list-none text-[clamp(0.5rem,1.5vw,1rem)]">
                    {ingredients
                      .filter((ing) => ing.item || ing.quantity)
                      .map((ing, i) => (
                        <li className="mb-0 text-[clamp(0.5rem,1.5vw,1rem)]" key={i}>
                          <span className="bullet">&bull;</span>
                           {ing.quantity} {ing.unit} {ing.item}
                        </li>
                      ))}
                  </ol>
                </div>

                <div className={`${pdfSize === '3x5' ? 'w-3/4' : 'w-full'}`}>
                  <h2 className="font-semibold text-lg mb-1">Instructions</h2>
                  <ol className="list-none text-[clamp(0.5rem,1.5vw,1rem)]">
                    {instructions.filter(Boolean).map((step, i) => (
                      <li className="mb-0 text-[clamp(0.5rem,1.5vw,1rem)]" key={i}>
                        <span className="bullet">{i + 1}.&nbsp;</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
