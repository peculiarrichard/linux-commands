export function SearchForm({
  defaultValue,
  activeCategorySlug,
}: {
  defaultValue?: string;
  activeCategorySlug?: string;
}) {
  return (
    <form action="/" method="get" role="search" className="flex gap-2">
      {activeCategorySlug && <input type="hidden" name="category" value={activeCategorySlug} />}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search commands…"
        aria-label="Search commands"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-accent"
      >
        Search
      </button>
    </form>
  );
}
