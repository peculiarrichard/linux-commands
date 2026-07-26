import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-fg transition-colors hover:border-accent"
        >
          ← Previous
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <span className="text-muted-fg">
        Page {page} of {totalPages}
      </span>
      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-fg transition-colors hover:border-accent"
        >
          Next →
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
