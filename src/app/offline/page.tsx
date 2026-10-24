import type { Metadata } from "next";
import OfflineRecipes from "@/components/app/OfflineRecipes";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

/** Shown by the installed app when a page hasn't been saved for offline use. */
export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="eyebrow mb-1">No connection</p>
      <h1 className="font-serif text-3xl font-bold text-ink">You&apos;re offline</h1>
      <p className="mt-2 text-ink-soft">
        That page isn&apos;t saved on this phone yet. These recipes are ready to open without a connection:
      </p>
      <OfflineRecipes />
    </div>
  );
}
