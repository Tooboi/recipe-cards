/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import { createRecipe } from "@/app/actions";
import PdfOptionsPanel from "@/components/pdf/PdfOptionsPanel";
import PdfPreview from "@/components/pdf/PdfPreview";
import RowControls from "@/components/pdf/RowControls";
import { downloadRecipePdf } from "@/lib/pdf/generate";
import { defaultPdfOptions, type RecipePdfOptions } from "@/lib/pdf/options";
import type { Ingredient } from "@/lib/recipe-format";
import { useMediaQuery } from "@/lib/use-media-query";
import CategoryTagsFields from "@/components/forms/CategoryTagsFields";

function formatBytes(fileSize: number): string {
  const sizes = ["B", "KB", "MB"];
  if (fileSize === 0) return "0 B";
  const i = Math.floor(Math.log(fileSize) / Math.log(1024));
  const formatted = (fileSize / Math.pow(1024, i)).toFixed(1);
  return `${formatted.endsWith(".0") ? formatted.split(".")[0] : formatted} ${sizes[i]}`;
}

function move<T>(list: T[], index: number, direction: "up" | "down") {
  const next = [...list];
  const swap = direction === "up" ? index - 1 : index + 1;
  if (swap < 0 || swap >= next.length) return list;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}

const emptyIngredient = (): Ingredient => ({ quantity: "", unit: "", item: "" });
const maxFileSize = 41943040; // 40MB

export default function RecipeForm() {
  const { data: session } = useSession();
  const user = session?.user;
  const isSignedIn = !!session?.user;
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [tab, setTab] = useState<"editor" | "design">("editor");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageId, setImageId] = useState("");
  const [authorName, setAuthorName] = useState(user?.name || "");
  const [yieldAmount, setYieldAmount] = useState("1");
  const [yieldUnit, setYieldUnit] = useState("Serving");
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [hidden, setHidden] = useState(true);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfOptions, setPdfOptions] = useState<RecipePdfOptions>(() =>
    defaultPdfOptions({ showImage: false })
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.name && !authorName) setAuthorName(user.name);
  }, [user?.name, authorName]);

  const serving = yieldAmount && yieldUnit ? `${yieldAmount} ${yieldUnit}` : "";
  const pdfRecipe = {
    title: title || "Recipe Title",
    description,
    author: authorName,
    serving,
    ingredients: ingredients.filter((i) => i.item || i.quantity),
    instructions,
    imageId,
  };

  const handleCreateRecipe = async () => {
    setLoading(true);
    try {
      await createRecipe({
        title,
        description,
        ingredients: ingredients.map((ing) => `${ing.quantity}_${ing.unit}_${ing.item}`),
        instructions,
        pdfSize: pdfOptions.size,
        font: pdfOptions.font,
        hidden,
        id: user?.id || "",
        imageId,
        author: pdfOptions.showAuthor ? authorName : "",
        serving,
        category,
        tags,
      });

      setTitle("");
      setDescription("");
      setInstructions([""]);
      setIngredients([emptyIngredient()]);
      setHidden(true);
      setCategory("");
      setTags([]);
      setImageId("");
      setYieldAmount("1");
      setYieldUnit("Serving");
      setPdfOptions(defaultPdfOptions({ showImage: false }));

      toast.success("Recipe saved!");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast.error(error.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  const handlePDFExport = async () => {
    setExporting(true);
    try {
      await downloadRecipePdf(pdfRecipe, pdfOptions);
    } catch (err) {
      console.error(err);
      toast.error("Sorry, the PDF couldn't be created.");
    } finally {
      setExporting(false);
    }
  };

  const tabClass = (active: boolean) =>
    `flex-1 border-b-2 px-4 py-3 text-sm font-semibold tracking-wide uppercase transition-colors sm:flex-none ${
      active ? "border-brand text-brand" : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <header className="mb-6">
        <p className="eyebrow mb-1">New recipe</p>
        <h1 className="font-serif text-3xl font-bold text-ink md:text-4xl">Write it down</h1>
        <p className="mt-1 text-ink-soft">
          Fill in your recipe, choose how the card looks, then save it or download a PDF.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        <section className="panel overflow-hidden">
          <div className="flex border-b border-line">
            <button className={tabClass(tab === "editor")} onClick={() => setTab("editor")}>
              Recipe
            </button>
            <button className={tabClass(tab === "design")} onClick={() => setTab("design")}>
              Card design
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {tab === "editor" && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="field-label">Title</label>
                  <input
                    id="title"
                    className="field text-base"
                    placeholder="e.g. Grandma's Buttermilk Biscuits"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {isSignedIn && (
                    <div>
                      <label htmlFor="author" className="field-label">From the kitchen of</label>
                      <input
                        id="author"
                        className="field"
                        placeholder="Author name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <span className="field-label">Yield</span>
                    <div className="grid grid-cols-[5rem_1fr] gap-2">
                      <input
                        className="field"
                        placeholder="Amount"
                        aria-label="Yield amount"
                        value={yieldAmount}
                        onChange={(e) => setYieldAmount(e.target.value)}
                      />
                      <input
                        className="field"
                        placeholder="Servings, cookies…"
                        aria-label="Yield unit"
                        value={yieldUnit}
                        onChange={(e) => setYieldUnit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="recipe-description" className="field-label">Description</label>
                  <textarea
                    id="recipe-description"
                    rows={3}
                    className="field"
                    placeholder="A line or two about this dish"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <CategoryTagsFields
                  category={category}
                  onCategoryChange={setCategory}
                  tags={tags}
                  onTagsChange={setTags}
                />

                <div>
                  <span className="field-label">Photo</span>
                  {imageId ? (
                    <div className="flex items-center gap-4">
                      <CldImage
                        alt="Recipe photo"
                        src={imageId}
                        width="160"
                        height="160"
                        crop="fill"
                        className="h-24 w-24 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setImageId("");
                          setPdfOptions((o) => ({ ...o, showImage: false }));
                        }}
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
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
                        setPdfOptions((o) => ({ ...o, showImage: true }));
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            open();
                          }}
                          className="flex w-full items-center gap-3 rounded-md border-2 border-dashed border-line bg-cream px-4 py-4 text-left text-ink-soft transition-colors hover:border-brand hover:text-brand"
                        >
                          <PhotoIcon className="h-8 w-8 shrink-0" />
                          <span className="text-sm">
                            <span className="block font-semibold">Add a photo</span>
                            Optional · max {formatBytes(maxFileSize)}
                          </span>
                        </button>
                      )}
                    </CldUploadWidget>
                  )}
                </div>

                <div>
                  <h2 className="field-label">Ingredients</h2>
                  <ul className="space-y-3 sm:space-y-2">
                    {ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex flex-wrap items-center gap-2 border-b border-line pb-3 sm:flex-nowrap sm:border-0 sm:pb-0"
                      >
                        <div className="grid w-full grid-cols-[4.5rem_5.5rem_minmax(0,1fr)] gap-2 sm:flex-1">
                          <input
                            className="field"
                            placeholder="Qty"
                            aria-label={`Ingredient ${i + 1} quantity`}
                            value={ing.quantity}
                            onChange={(e) =>
                              setIngredients((p) => p.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))
                            }
                          />
                          <input
                            className="field"
                            placeholder="Unit"
                            aria-label={`Ingredient ${i + 1} unit`}
                            value={ing.unit}
                            onChange={(e) =>
                              setIngredients((p) => p.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))
                            }
                          />
                          <input
                            className="field"
                            placeholder="Ingredient"
                            aria-label={`Ingredient ${i + 1}`}
                            value={ing.item}
                            onChange={(e) =>
                              setIngredients((p) => p.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))
                            }
                          />
                        </div>
                        <div className="ml-auto">
                          <RowControls
                            index={i}
                            count={ingredients.length}
                            onMove={(d) => setIngredients((p) => move(p, i, d))}
                            onRemove={() => setIngredients((p) => p.filter((_, j) => j !== i))}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn-ghost mt-2 px-2"
                    onClick={() => setIngredients((p) => [...p, emptyIngredient()])}
                  >
                    <PlusIcon className="h-4 w-4" /> Add ingredient
                  </button>
                </div>

                <div>
                  <h2 className="field-label">Directions</h2>
                  <ol className="space-y-3">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                        <span className="mt-2 w-6 shrink-0 text-right font-serif font-bold text-brand">
                          {i + 1}.
                        </span>
                        <textarea
                          rows={2}
                          className="field min-w-0 flex-1"
                          placeholder={`Step ${i + 1}`}
                          aria-label={`Step ${i + 1}`}
                          value={step}
                          onChange={(e) =>
                            setInstructions((p) => p.map((s, j) => (j === i ? e.target.value : s)))
                          }
                        />
                        <div className="ml-auto">
                          <RowControls
                            index={i}
                            count={instructions.length}
                            onMove={(d) => setInstructions((p) => move(p, i, d))}
                            onRemove={() => setInstructions((p) => p.filter((_, j) => j !== i))}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    className="btn-ghost mt-2 px-2"
                    onClick={() => setInstructions((p) => [...p, ""])}
                  >
                    <PlusIcon className="h-4 w-4" /> Add step
                  </button>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                  />
                  Keep this recipe private
                </label>
              </div>
            )}

            {tab === "design" && (
              <div className="space-y-6">
                <PdfOptionsPanel
                  options={pdfOptions}
                  onChange={setPdfOptions}
                  hasImage={!!imageId}
                  hasDescription={!!description.trim()}
                  hasAuthor={!!authorName.trim()}
                />
                {!isDesktop && <PdfPreview recipe={pdfRecipe} options={pdfOptions} />}
              </div>
            )}
          </div>

          <div className="grid gap-2 border-t border-line bg-cream/60 p-4 sm:grid-cols-2 sm:p-6">
            <button
              type="button"
              className="btn-outline w-full py-3 text-base"
              onClick={handlePDFExport}
              disabled={exporting}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              {exporting ? "Preparing…" : "Download PDF"}
            </button>
            {isSignedIn ? (
              <button
                type="button"
                className="btn-brand w-full py-3 text-base"
                disabled={loading || !title.trim()}
                onClick={handleCreateRecipe}
              >
                {loading ? "Saving…" : "Save Recipe"}
              </button>
            ) : (
              <Link href="/signin" className="btn-brand w-full py-3 text-base">
                Sign in to save
              </Link>
            )}
          </div>
        </section>

        {isDesktop && (
          <aside>
            <div className="sticky top-24">
              <p className="eyebrow mb-2">Live preview</p>
              <PdfPreview recipe={pdfRecipe} options={pdfOptions} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
