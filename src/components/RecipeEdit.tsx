'use client';

import { Prisma } from '@prisma/client';

type RecipeWithUser = Prisma.RecipeGetPayload<{ include: { user: true } }>;

export default function RecipeEdit({ recipe }: { recipe: RecipeWithUser }) {
  return (
    <div>
      <h1>Edit Recipe: {recipe.title}</h1>
      <p>Created by: {recipe.user.username}</p>
    </div>
  );
}
