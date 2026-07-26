import { notFound } from "next/navigation";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice } from "@/components/EmptyState";
import { updateRecipe } from "@/lib/actions/recipes";
import { getRecipeForEdit } from "@/lib/queries/admin-recipes";
import { RecipeForm } from "@/app/admin/recipes/RecipeForm";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
}) {
  const { slug } = await params;
  const { saved, created } = await searchParams;

  let values;
  try {
    values = await getRecipeForEdit(slug);
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  if (!values) {
    notFound();
  }

  const boundUpdateRecipe = updateRecipe.bind(null, slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Edit {values.title}</h1>
        {(saved || created) && (
          <p className="mt-1 text-sm text-accent">
            {created ? "Recipe created." : "Changes saved."}
          </p>
        )}
      </div>
      <RecipeForm mode="edit" initialValues={values} action={boundUpdateRecipe} />
    </div>
  );
}
