'use client';

import { useState, useEffect } from 'react';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { toggleBookmark } from '@/components/wrappers/BookmarkAction';
import { getBookmarks } from '@/components/wrappers/GetBookmarks';

interface BookmarkButtonProps {
  recipeId: string;
  /** "pill" shows a labelled Save button; "icon" is a compact square. */
  variant?: 'icon' | 'pill';
}

export default function BookmarkButton({ recipeId, variant = 'icon' }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch initial bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const bookmarkedIds = await getBookmarks();
        setBookmarked(bookmarkedIds.includes(recipeId));
      } catch {
        // Not signed in: leave as not bookmarked.
      }
    }
    fetchBookmarks();
  }, [recipeId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Optimistic UI
    const next = !bookmarked;
    setBookmarked(next);

    try {
      await toggleBookmark(recipeId);
      toast.success(next ? 'Saved to your vault' : 'Removed from saved recipes');
    } catch {
      // Rollback on error
      setBookmarked(!next);
      toast.error('Sign in to save recipes');
    }
  };

  const Icon = bookmarked ? BookmarkSolidIcon : BookmarkOutlineIcon;

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        aria-pressed={bookmarked}
        className={bookmarked ? 'btn border border-brand bg-brand-soft text-brand-dark' : 'btn-outline'}
      >
        <Icon className="h-4 w-4" />
        {bookmarked ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove from saved recipes' : 'Save recipe'}
      className={`rounded-md border p-1.5 transition-all active:scale-95 ${
        bookmarked
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line bg-paper text-ink-soft hover:border-brand hover:text-brand'
      }`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
