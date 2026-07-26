import Link from "next/link";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice, EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { listAllRecipesForAdmin } from "@/lib/queries/admin-recipes";
import { DEFAULT_PAGE_SIZE, resolvePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AdminRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = resolvePage(pageParam ? Number(pageParam) : undefined);

  let result;
  try {
    result = await listAllRecipesForAdmin({ page, pageSize: DEFAULT_PAGE_SIZE });
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  const recipes = result.items;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-fg">Recipes</h1>
        <Link
          href="/admin/recipes/new"
          className="rounded-lg border border-border bg-fg px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          + Add recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <EmptyState title="No recipes yet" description="Add the first one." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-fg">
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Updated</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 text-fg">{recipe.title}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          recipe.status === "published"
                            ? "bg-accent text-accent-fg"
                            : "bg-muted text-muted-fg"
                        }`}
                      >
                        {recipe.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-fg">
                      {new Date(recipe.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/recipes/${recipe.slug}/edit`}
                        className="text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(p) => (p > 1 ? `/admin/recipes?page=${p}` : "/admin/recipes")}
          />
        </>
      )}
    </div>
  );
}
