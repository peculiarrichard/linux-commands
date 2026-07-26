import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice, EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { RecipeCard } from "@/components/RecipeCard";
import { listPublishedRecipes } from "@/lib/queries/recipes";
import { DEFAULT_PAGE_SIZE, resolvePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = resolvePage(pageParam ? Number(pageParam) : undefined);

  let result;
  try {
    result = await listPublishedRecipes({ page, pageSize: DEFAULT_PAGE_SIZE });
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return (
        <main className="mx-auto max-w-4xl px-6 py-16">
          <DatabaseSetupNotice />
        </main>
      );
    }
    throw err;
  }

  const recipes = result.items;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg text-balance">Recipes</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Real one-liners that chain multiple commands together, for actual tasks rather than
          single-flag lookups.
        </p>
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          title="No recipes yet"
          description="Recipes are added by maintainers via the admin panel."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(p) => (p > 1 ? `/recipes?page=${p}` : "/recipes")}
          />
        </>
      )}
    </main>
  );
}
