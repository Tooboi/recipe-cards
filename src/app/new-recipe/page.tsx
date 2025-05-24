import RecipeForm from '@/components/RecipeForm';

import { getUsers } from '@/app/actions';

export default async function NewRecipe() {
  const users = await getUsers();
  return (
    <div>
      <RecipeForm users={users} />
    </div>
  );
}
