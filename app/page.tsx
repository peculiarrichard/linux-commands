import { CategoryFilter } from "@/components/CategoryFilter";
import { CommandCard } from "@/components/CommandCard";
import { Pagination } from "@/components/Pagination";
import { SearchForm } from "@/components/SearchForm";
import { DatabaseSetupNotice, EmptyState } from "@/components/EmptyState";
import {
  DatabaseNotConfiguredError,
  listCategories,
  listPublishedCommands,
  type CategorySummary,
} from "@/lib/queries/commands";
import { DEFAULT_PAGE_SIZE, resolvePage, type PaginatedResult } from "@/lib/pagination";
import type { CommandListItem } from "@/lib/queries/commands";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string; q?: string; page?: string };

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { category, q, page: pageParam } = await searchParams;
  const page = resolvePage(pageParam ? Number(pageParam) : undefined);

  let result: PaginatedResult<CommandListItem>;
  let categories: CategorySummary[];

  try {
    [result, categories] = await Promise.all([
      listPublishedCommands({
        categorySlug: category,
        query: q,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
      listCategories(),
    ]);
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

  const commands = result.items;

  function buildPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg text-balance">
          Look up any Linux command — and why it&apos;s called that.
        </h1>
        <p className="mt-1 text-sm text-muted-fg">
          {result.totalCount} command{result.totalCount === 1 ? "" : "s"} available
        </p>
      </div>

      <SearchForm defaultValue={q} activeCategorySlug={category} />
      <CategoryFilter categories={categories} activeCategorySlug={category} query={q} />

      {commands.length === 0 ? (
        <EmptyState
          title="No commands found"
          description={q ? `Nothing matches "${q}".` : "Try a different category."}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {commands.map((command) => (
              <CommandCard key={command.id} command={command} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildPageHref} />
        </>
      )}
    </main>
  );
}
