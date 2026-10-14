import { redirect } from "next/navigation";

// The full recipe list lives at /explore (with search and filters).
export default function RecipesListPage() {
  redirect("/explore");
}
