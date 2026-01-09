"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import BookmarkButton from "@/components/wrappers/BookmarkButton";

export default function RecipeDetailsClient({
  recipe,
}: {
  recipe: { id: string; userId: string; [key: string]: unknown };
}) {
  const { data: session } = useSession();
  const internalUserId = session?.user?.id ?? null;

  const isOwner = internalUserId === recipe.userId;

  return (
    <div className="sm:m-4 m-2">
      {/* Example usage */}
      <BookmarkButton recipeId={recipe.id} />

      {isOwner && (
        <Link href={`/recipes/edit/${recipe.id}`}>
          EDIT
        </Link>
      )}

      <Link href={`/recipes/download/${recipe.id}`}>
        DOWNLOAD
      </Link>

      {/* rest of your UI here */}
    </div>
  );
}
