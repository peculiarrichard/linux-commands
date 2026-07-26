import { notFound } from "next/navigation";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { updateCommand } from "@/lib/actions/commands";
import { getCommandForEdit } from "@/lib/queries/admin-commands";
import { listCategories } from "@/lib/queries/commands";
import { resolvePage } from "@/lib/pagination";
import { CommandForm } from "@/app/admin/commands/CommandForm";

export const dynamic = "force-dynamic";

const REVISIONS_PER_PAGE = 10;

export default async function EditCommandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; created?: string; revPage?: string }>;
}) {
  const { slug } = await params;
  const { saved, created, revPage: revPageParam } = await searchParams;
  const revPage = resolvePage(revPageParam ? Number(revPageParam) : undefined);

  let result;
  let categories;
  try {
    [result, categories] = await Promise.all([getCommandForEdit(slug), listCategories()]);
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  if (!result) {
    notFound();
  }

  const { values, revisionHistory } = result;
  const boundUpdateCommand = updateCommand.bind(null, slug);
  const revTotalPages = Math.max(1, Math.ceil(revisionHistory.length / REVISIONS_PER_PAGE));
  const pagedRevisions = revisionHistory.slice(
    (revPage - 1) * REVISIONS_PER_PAGE,
    revPage * REVISIONS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Edit {values.name}</h1>
        {(saved || created) && (
          <p className="mt-1 text-sm text-accent">
            {created ? "Command created." : "Changes saved."}
          </p>
        )}
      </div>

      <CommandForm
        mode="edit"
        initialValues={values}
        categories={categories}
        action={boundUpdateCommand}
      />

      {revisionHistory.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-fg">Revision history</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {pagedRevisions.map((entry, index) => (
              <li
                key={index}
                className="flex flex-wrap gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-fg">
                  {new Date(entry.changedAt).toLocaleString()}
                </span>
                <span className="text-fg">{entry.changedBy}</span>
                <span className="text-muted-fg">— {entry.diffSummary}</span>
              </li>
            ))}
          </ul>
          <Pagination
            page={revPage}
            totalPages={revTotalPages}
            buildHref={(p) =>
              p > 1 ? `/admin/commands/${slug}/edit?revPage=${p}` : `/admin/commands/${slug}/edit`
            }
          />
        </section>
      )}
    </div>
  );
}
