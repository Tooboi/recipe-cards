"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  CATEGORIES,
  MAX_TAGS,
  SUGGESTED_TAGS,
  normalizeTag,
  tagKey,
  tagLabel,
} from "@/lib/taxonomy";
import { getExistingTags, type TagCount } from "@/lib/actions/tag.actions";

const SHOWN_EXISTING = 16;

/**
 * Category picker + tags. Shows the tags already used in the vault (with counts),
 * suggests them while typing, and reuses an existing tag when you type a
 * near-duplicate ("Cookies" → "cookie", "gluten free" → "gluten-free").
 */
export default function CategoryTagsFields({
  category,
  onCategoryChange,
  tags,
  onTagsChange,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [existing, setExisting] = useState<TagCount[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getExistingTags()
      .then(setExisting)
      .catch(() => setExisting([]));
  }, []);

  // key → the spelling already used in the vault
  const byKey = useMemo(() => {
    const m = new Map<string, TagCount>();
    for (const t of existing ?? []) if (!m.has(tagKey(t.tag))) m.set(tagKey(t.tag), t);
    return m;
  }, [existing]);
  const countOf = (t: string) => byKey.get(tagKey(t))?.count ?? 0;
  const selectedKeys = new Set(tags.map(tagKey));

  const add = (raw: string) => {
    const typed = normalizeTag(raw);
    if (!typed) return;
    const key = tagKey(typed);
    if (selectedKeys.has(key)) {
      setNote(`“${tagLabel(typed)}” is already added.`);
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setNote(`You can add up to ${MAX_TAGS} tags.`);
      return;
    }
    const match = byKey.get(key)?.tag;
    const finalTag = match ?? typed;
    setNote(match && match !== typed ? `Used the existing tag “${tagLabel(match)}”.` : "");
    selectedKeys.add(key);
    onTagsChange([...tags, finalTag]);
  };
  const remove = (t: string) => onTagsChange(tags.filter((x) => x !== t));

  // Autocomplete options for the current draft
  const q = normalizeTag(draft);
  const matches = useMemo(() => {
    if (!q) return [];
    const k = tagKey(q);
    return (existing ?? [])
      .filter((t) => !selectedKeys.has(tagKey(t.tag)))
      .filter((t) => t.tag.includes(q) || tagKey(t.tag).startsWith(k))
      .sort((a, b) => Number(b.tag.startsWith(q)) - Number(a.tag.startsWith(q)) || b.count - a.count)
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, existing, tags]);
  const isNew = !!q && !byKey.has(tagKey(q)) && !selectedKeys.has(tagKey(q));
  const options: { tag: string; count: number; isNew?: boolean }[] = [
    ...matches,
    ...(isNew ? [{ tag: q, count: 0, isNew: true }] : []),
  ];

  const commit = (value?: string) => {
    if (value !== undefined) add(value);
    else draft.split(",").forEach(add);
    setDraft("");
    setOpen(false);
    setHighlight(0);
  };

  // Chips under the box: tags already in the vault, else starter suggestions
  const pool: TagCount[] =
    existing && existing.length > 0
      ? existing
      : SUGGESTED_TAGS.map((tag) => ({ tag, count: 0 }));
  const available = pool.filter((t) => !selectedKeys.has(tagKey(t.tag)));
  const visible = showAll ? available : available.slice(0, SHOWN_EXISTING);
  const fromVault = !!existing && existing.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="category" className="field-label">
          Category
        </label>
        <select
          id="category"
          className="field"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Choose a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tag-input" className="field-label">
          Tags{" "}
          <span className="font-normal text-ink-soft">
            ({tags.length}/{MAX_TAGS})
          </span>
        </label>

        <div className="relative">
          <div
            className="field flex flex-wrap items-center gap-1.5 py-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
            onClick={() => inputRef.current?.focus()}
          >
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-0.5 pr-1 pl-2.5 text-xs font-semibold text-brand-dark"
              >
                {tagLabel(t)}
                {countOf(t) === 0 && (
                  <span className="rounded-sm bg-paper/70 px-1 text-[10px] font-bold text-brand uppercase">new</span>
                )}
                <button
                  type="button"
                  onClick={() => remove(t)}
                  aria-label={`Remove ${t}`}
                  className="rounded-full p-0.5 hover:bg-brand/15"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              id="tag-input"
              role="combobox"
              aria-expanded={open && options.length > 0}
              aria-controls="tag-options"
              aria-autocomplete="list"
              autoComplete="off"
              className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-sm outline-none"
              placeholder={tags.length ? "Add another…" : "Start typing to find a tag…"}
              value={draft}
              disabled={tags.length >= MAX_TAGS}
              onChange={(e) => {
                const v = e.target.value;
                if (v.includes(",")) {
                  v.split(",").slice(0, -1).forEach(add);
                  setDraft(v.split(",").pop() ?? "");
                } else setDraft(v);
                setOpen(true);
                setHighlight(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => Math.min(h + 1, options.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => Math.max(h - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  commit(options[highlight]?.tag ?? draft);
                } else if (e.key === "Escape") {
                  setOpen(false);
                } else if (e.key === "Backspace" && !draft && tags.length) {
                  remove(tags[tags.length - 1]);
                }
              }}
              onBlur={() => {
                // let a click on an option land first
                setTimeout(() => {
                  setOpen(false);
                  if (draft.trim()) commit();
                }, 120);
              }}
            />
          </div>

          {open && options.length > 0 && (
            <ul
              id="tag-options"
              role="listbox"
              className="absolute right-0 left-0 z-30 mt-1 overflow-hidden rounded-lg border border-line bg-paper p-1 shadow-lg shadow-ink/10"
            >
              {options.map((o, i) => (
                <li
                  key={o.tag + (o.isNew ? "-new" : "")}
                  role="option"
                  aria-selected={i === highlight}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(o.tag)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm ${
                    i === highlight ? "bg-brand-soft text-brand-dark" : "text-ink"
                  }`}
                >
                  {o.isNew ? (
                    <span>
                      Create new tag <span className="font-semibold">“{tagLabel(o.tag)}”</span>
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold">{tagLabel(o.tag)}</span>
                      <span className="text-xs text-ink-soft">
                        {o.count} recipe{o.count === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-1 h-4 text-xs text-sage" aria-live="polite">
          {note}
        </p>

        {tags.length < MAX_TAGS && available.length > 0 && (
          <div className="mt-1">
            <p className="mb-1.5 text-xs font-semibold text-ink-soft">
              {fromVault ? "Tags already in use — tap to add:" : "Suggestions — tap to add:"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((t) => (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => add(t.tag)}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  {tagLabel(t.tag)}
                  {t.count > 0 && <span className="text-ink-soft">{t.count}</span>}
                </button>
              ))}
              {available.length > SHOWN_EXISTING && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="px-1.5 py-1 text-xs font-semibold text-brand hover:underline"
                >
                  {showAll ? "Show fewer" : `Show all ${available.length}`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
