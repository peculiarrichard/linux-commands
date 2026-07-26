import Link from "next/link";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice, EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { listAllCommandsForAdmin } from "@/lib/queries/admin-commands";
import { DEFAULT_PAGE_SIZE, resolvePage } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = resolvePage(pageParam ? Number(pageParam) : undefined);

  let result;
  try {
    result = await listAllCommandsForAdmin({ page, pageSize: DEFAULT_PAGE_SIZE });
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  const commands = result.items;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-fg">Commands</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/commands/import"
            className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-accent"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/commands/new"
            className="rounded-lg border border-border bg-fg px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent"
          >
            + Add command
          </Link>
        </div>
      </div>

      {commands.length === 0 ? (
        <EmptyState
          title="No commands yet"
          description="Add one manually, or run the commands.md migration script to seed the database."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-fg">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Updated</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {commands.map((command) => (
                  <tr key={command.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-mono text-fg">{command.name}</td>
                    <td className="px-4 py-2 text-muted-fg">{command.categoryName ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          command.status === "published"
                            ? "bg-accent text-accent-fg"
                            : "bg-muted text-muted-fg"
                        }`}
                      >
                        {command.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-fg">
                      {new Date(command.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/commands/${command.slug}/edit`}
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
            buildHref={(p) => (p > 1 ? `/admin?page=${p}` : "/admin")}
          />
        </>
      )}
    </div>
  );
}
