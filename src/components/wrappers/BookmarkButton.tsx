'use client';

import { useState, useEffect } from 'react';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { toggleBookmark } from '@/components/wrappers/BookmarkAction';
import { getBookmarks } from '@/components/wrappers/GetBookmarks';

interface BookmarkButtonProps {
  recipeId: string;
}

export default function BookmarkButton({ recipeId }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  // Fetch initial bookmarks
  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const bookmarkedIds = await getBookmarks();
        setBookmarked(bookmarkedIds.includes(recipeId));
      } catch (err) {
        console.error('Failed to fetch bookmarks', err);
      }
    }
    fetchBookmarks();
  }, [recipeId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Optimistic UI
    setBookmarked(prev => !prev);

    try {
      await toggleBookmark(recipeId);
    } catch {
      // Rollback on error
      setBookmarked(prev => !prev);
    }
  };

  return (
    <button onClick={handleClick} className="transition-colors ">
      {bookmarked ? (
        <BookmarkSolidIcon className="w-9 h-10 text-amber-600 hover:text-amber-500 bg-amber-400 hover:bg-amber-300  border-2 border-amber-600 hover:stroke-2 hover:stroke-amber-600 hover:border-amber-300 rounded-sm p-1 transition-all active:scale-95 " />
      ) : (
        <BookmarkSolidIcon className="w-9 h-10 text-slate-700 bg-slate-400 hover:text-amber-900 hover:stroke-2 hover:stroke-amber-600 hover:infill-amber-500 rounded-sm p-1 transition-all active:scale-95" />
      )}
    </button>
  );
}
