import { createRecipe } from "@/lib/actions/recipes";
import { emptyRecipeFormValues } from "@/lib/queries/admin-recipes";
import { RecipeForm } from "@/app/admin/recipes/RecipeForm";

export const dynamic = "force-dynamic";

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-fg">Add a recipe</h1>
      <RecipeForm mode="create" initialValues={emptyRecipeFormValues} action={createRecipe} />
    </div>
  );
}
