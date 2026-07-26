"use client";

// Button-driven counterpart to Pagination — for lists already held in client
// state (e.g. a CSV preview result) rather than lists fetched per-page via a
// URL, where a plain <Link>-based pager wouldn't have anything to navigate to.
export function ClientPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-border px-3 py-1.5 text-fg transition-colors hover:border-accent disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-muted-fg">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-border px-3 py-1.5 text-fg transition-colors hover:border-accent disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
