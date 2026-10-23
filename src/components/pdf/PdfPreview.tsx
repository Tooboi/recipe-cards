"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { pdfFileName, renderRecipePdf, saveBlob } from "@/lib/pdf/generate";
import type { RecipePdfData, RecipePdfOptions } from "@/lib/pdf/options";

type State = {
  url: string | null;
  blob: Blob | null;
  pages: number;
  key: string;
  loading: boolean;
  error: string | null;
};

const ASPECT: Record<RecipePdfOptions["size"], string> = {
  letter: "8.5 / 11",
  "4x6": "6 / 4",
  "3x5": "5 / 3",
};

/**
 * Live preview of the real PDF (the exact file that downloads), plus the
 * download / open buttons. Phones can't show PDFs inline, so on small screens
 * the preview opens in a new tab instead.
 */
export default function PdfPreview({
  recipe,
  options,
  className = "",
}: {
  recipe: RecipePdfData;
  options: RecipePdfOptions;
  className?: string;
}) {
  const key = JSON.stringify({ recipe, options });
  const [state, setState] = useState<State>({
    url: null,
    blob: null,
    pages: 0,
    key: "",
    loading: true,
    error: null,
  });
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const { blob, pages } = await renderRecipePdf(recipe, options);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setState({ url, blob, pages, key, loading: false, error: null });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: "Couldn't build the PDF preview." }));
        }
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `key` captures every input that affects the PDF.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Reuse the preview if it's up to date, otherwise build a fresh one.
      const blob =
        state.blob && state.key === key ? state.blob : (await renderRecipePdf(recipe, options)).blob;
      saveBlob(blob, pdfFileName(recipe.title, options.size));
    } catch (err) {
      console.error(err);
      toast.error("Sorry, the PDF couldn't be created.");
    } finally {
      setDownloading(false);
    }
  };

  const isCard = options.size !== "letter";
  const unit = isCard ? "card" : "page";
  const status = state.loading
    ? "Updating preview…"
    : state.error
      ? state.error
      : isCard
        ? state.pages <= 1
          ? "Fits on one card"
          : `Continues onto ${state.pages} cards — print front & back, or try the 4 × 6 size`
        : `${state.pages} ${unit}${state.pages === 1 ? "" : "s"}`;

  return (
    <div className={className}>
      {/* Inline preview (tablet/desktop) */}
      <div className="hidden rounded-lg border border-line bg-[#e9e3d9] dark:bg-[#3d352f] p-3 md:block">
        <div
          className="relative mx-auto w-full overflow-hidden rounded-sm bg-white shadow-md"
          style={{ aspectRatio: ASPECT[options.size], maxHeight: "75vh" }}
        >
          {state.url && (
            <iframe
              key={state.url}
              title="Recipe PDF preview"
              src={`${state.url}#toolbar=0&navpanes=0&view=Fit`}
              className="absolute inset-0 h-full w-full"
            />
          )}
          {state.loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-ink-soft">
              Updating preview…
            </div>
          )}
        </div>
      </div>

      {/* Phone: a mini card silhouette instead of an inline PDF */}
      <div className="flex items-center gap-4 rounded-lg border border-line bg-[#e9e3d9] dark:bg-[#3d352f] p-4 md:hidden">
        <div
          className="w-16 shrink-0 rounded-[3px] border border-line bg-white shadow"
          style={{ aspectRatio: ASPECT[options.size] }}
          aria-hidden
        />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-ink">
            {options.size === "letter" ? "Full page" : `${options.size.replace("x", " × ")} card`}
          </p>
          <p className="text-ink-soft">{status}</p>
        </div>
      </div>

      <p className="mt-2 hidden text-center text-sm text-ink-soft md:block" aria-live="polite">
        {status}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="btn-brand w-full py-3 text-base"
          onClick={handleDownload}
          disabled={downloading}
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
        <a
          href={state.url ?? undefined}
          target="_blank"
          rel="noopener"
          aria-disabled={!state.url}
          className={`btn-outline w-full py-3 text-base ${state.url ? "" : "pointer-events-none opacity-60"}`}
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          <span className="md:hidden">Preview</span>
          <span className="hidden md:inline">Open to print</span>
        </a>
      </div>
    </div>
  );
}
