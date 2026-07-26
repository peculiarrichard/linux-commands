import Link from "next/link";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice, EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { reviewSuggestion } from "@/lib/actions/suggestions";
import { listSuggestionsForAdmin } from "@/lib/queries/admin-suggestions";
import { DEFAULT_PAGE_SIZE, resolvePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-fg",
  approved: "bg-accent text-accent-fg",
  rejected: "bg-red-500/10 text-red-500",
};

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = resolvePage(pageParam ? Number(pageParam) : undefined);

  let result;
  try {
    result = await listSuggestionsForAdmin({ page, pageSize: DEFAULT_PAGE_SIZE });
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  const suggestions = result.items;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Suggestions</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Submitted via the public{" "}
          <Link href="/suggest" className="text-accent hover:underline">
            /suggest
          </Link>{" "}
          form. Approving here doesn&apos;t publish anything — it just marks the suggestion
          reviewed; use &quot;Draft command&quot; to turn it into a real entry.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <EmptyState title="No suggestions yet" description="None have come in via /suggest." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {suggestions.map((suggestion) => {
              const approveAction = reviewSuggestion.bind(null, suggestion.id, "approved");
              const rejectAction = reviewSuggestion.bind(null, suggestion.id, "rejected");
              const draftHref = `/admin/commands/new?${new URLSearchParams({
                name: suggestion.name,
                description: suggestion.description,
                rationaleText: suggestion.rationaleText,
              }).toString()}`;

              return (
                <div key={suggestion.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-base font-semibold text-fg">
                        {suggestion.name}
                      </code>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[suggestion.status]}`}
                      >
                        {suggestion.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-fg">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-fg">{suggestion.description}</p>
                  {suggestion.rationaleText && (
                    <p className="mt-1 text-sm text-muted-fg">{suggestion.rationaleText}</p>
                  )}
                  {(suggestion.submittedByName || suggestion.submittedByContact) && (
                    <p className="mt-2 text-xs text-muted-fg">
                      From:{" "}
                      {[suggestion.submittedByName, suggestion.submittedByContact]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {suggestion.reviewedBy && (
                    <p className="mt-1 text-xs text-muted-fg">
                      Reviewed by {suggestion.reviewedBy} on{" "}
                      {suggestion.reviewedAt &&
                        new Date(suggestion.reviewedAt).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={draftHref}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-fg hover:border-accent"
                    >
                      Draft command from this
                    </Link>
                    {suggestion.status !== "approved" && (
                      <form action={approveAction}>
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-fg hover:border-accent"
                        >
                          Approve
                        </button>
                      </form>
                    )}
                    {suggestion.status !== "rejected" && (
                      <form action={rejectAction}>
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-fg hover:border-accent"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(p) => (p > 1 ? `/admin/suggestions?page=${p}` : "/admin/suggestions")}
          />
        </>
      )}
    </div>
  );
}
