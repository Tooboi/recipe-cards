"use client";

import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

type Saved = { href: string; title: string };

function titleFrom(html: string) {
  // Let the browser read the <title> so entities like &amp; are decoded exactly once.
  const title = new DOMParser().parseFromString(html, "text/html").title;
  return title.replace(/\s*\|\s*Recipe Card Vault\s*$/, "").trim() || "Untitled recipe";
}

/** Lists the recipe pages saved by the app's offline helper. Plain <a> links on purpose:
 *  a full page load is what lets the saved copy answer while offline. */
export default function OfflineRecipes() {
  const [items, setItems] = useState<Saved[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!("caches" in window)) return setItems([]);
      const cache = await caches.open("rcv-pages");
      const found: Saved[] = [];
      for (const req of await cache.keys()) {
        const url = new URL(req.url);
        if (!/^\/recipes\/[a-f0-9]{24}$/i.test(url.pathname)) continue;
        const res = await cache.match(req);
        if (!res) continue;
        found.push({ href: url.pathname, title: titleFrom(await res.text()) });
      }
      const unique = [...new Map(found.map((f) => [f.href, f])).values()];
      setItems(unique.sort((a, b) => a.title.localeCompare(b.title)));
    })().catch(() => setItems([]));
  }, []);

  if (items === null) return <p className="mt-6 text-sm text-ink-soft">Looking for saved recipes…</p>;

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <a href="/me" className="btn-outline">My Recipes</a>
        <a href="/me?tab=saved" className="btn-outline">Saved</a>
      </div>
      {items.length === 0 ? (
        <p className="panel p-6 text-center text-ink-soft">
          No recipes saved yet. Open the app once while connected and your recipes will download automatically.
        </p>
      ) : (
        <ul className="panel divide-y divide-line">
          {items.map((r) => (
            <li key={r.href}>
              <a href={r.href} className="flex items-center justify-between gap-3 px-4 py-3 font-semibold text-ink hover:text-brand">
                <span className="min-w-0 truncate">{r.title}</span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
