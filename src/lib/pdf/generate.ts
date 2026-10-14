"use client";

// Client-side helpers that turn a recipe into a real (vector, selectable-text) PDF.
// @react-pdf/renderer is loaded lazily so it never ships in the initial page bundle.

import { createElement } from "react";
import { cloudinaryUrl } from "@/lib/recipe-format";
import type { RecipePdfData, RecipePdfOptions } from "./options";

let fontsRegistered = false;

async function loadRenderer() {
  const [renderer, doc] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./RecipePdfDocument"),
  ]);

  if (!fontsRegistered) {
    const base = `${window.location.origin}/fonts`;
    renderer.Font.register({
      family: "Rubik",
      fonts: [
        { src: `${base}/rubik-latin-400-normal.woff` },
        { src: `${base}/rubik-latin-400-italic.woff`, fontStyle: "italic" },
        { src: `${base}/rubik-latin-700-normal.woff`, fontWeight: 700 },
        { src: `${base}/rubik-latin-700-italic.woff`, fontWeight: 700, fontStyle: "italic" },
      ],
    });
    renderer.Font.register({
      family: "Nunito",
      fonts: [
        { src: `${base}/nunito-latin-400-normal.woff` },
        { src: `${base}/nunito-latin-400-italic.woff`, fontStyle: "italic" },
        { src: `${base}/nunito-latin-700-normal.woff`, fontWeight: 700 },
        { src: `${base}/nunito-latin-700-italic.woff`, fontWeight: 700, fontStyle: "italic" },
      ],
    });
    // Don't hyphenate words mid-line; recipes read better whole.
    renderer.Font.registerHyphenationCallback((word) => [word]);
    fontsRegistered = true;
  }

  return { pdf: renderer.pdf, RecipePdfDocument: doc.default };
}

// Cache images as data URLs so live previews don't refetch on every keystroke.
const imageCache = new Map<string, Promise<string | null>>();

function loadImage(imageId: string | null | undefined, size: number): Promise<string | null> {
  const url = imageId ? cloudinaryUrl(imageId, { width: size, height: size }) : null;
  if (!url) return Promise.resolve(null);
  if (!imageCache.has(url)) {
    imageCache.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        )
        .catch((err) => {
          console.warn("Recipe image could not be loaded for PDF", err);
          imageCache.delete(url);
          return null;
        })
    );
  }
  return imageCache.get(url)!;
}

export type RenderedPdf = { blob: Blob; pages: number; scale: number };

// Text sizes tried, largest first, when squeezing a recipe onto a single index card.
const CARD_SCALES = [1, 0.94, 0.88, 0.82, 0.77];

async function countPages(blob: Blob) {
  const text = await blob.text();
  return (text.match(/\/Type\s*\/Page(?!s)/g) || []).length || 1;
}

export async function renderRecipePdf(
  recipe: RecipePdfData,
  options: RecipePdfOptions
): Promise<RenderedPdf> {
  const [{ pdf, RecipePdfDocument }, imageSrc] = await Promise.all([
    loadRenderer(),
    options.showImage ? loadImage(recipe.imageId, options.size === "letter" ? 600 : 300) : null,
  ]);

  const render = async (scale: number) => {
    const element = createElement(RecipePdfDocument, { recipe, options, imageSrc, scale });
    // pdf() is typed for <Document> elements; our component renders one.
    const blob = await pdf(element as Parameters<typeof pdf>[0]).toBlob();
    return { blob, scale, pages: await countPages(blob) };
  };

  // Full pages flow naturally. Index cards shrink the text a little at a time
  // so the recipe fits on one card; if it still can't, it continues onto more cards.
  const scales = options.size === "letter" ? [1] : CARD_SCALES;
  let result = await render(scales[0]);
  for (const scale of scales.slice(1)) {
    if (result.pages <= 1) break;
    const next = await render(scale);
    result = next;
  }
  if (result.pages > 1 && scales.length > 1) {
    // Didn't fit even at the smallest size: go back to readable text across several cards.
    result = await render(0.92);
  }
  return result;
}

export function pdfFileName(title: string, size: RecipePdfOptions["size"]) {
  const slug =
    (title || "recipe")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe";
  return `${slug}${size === "letter" ? "" : `-${size}-card`}.pdf`;
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function downloadRecipePdf(recipe: RecipePdfData, options: RecipePdfOptions) {
  const { blob } = await renderRecipePdf(recipe, options);
  saveBlob(blob, pdfFileName(recipe.title, options.size));
}
