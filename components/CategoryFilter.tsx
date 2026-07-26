import Link from "next/link";
import type { CategorySummary } from "@/lib/queries/commands";

function buildHref(categorySlug: string | undefined, query: string | undefined) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function CategoryFilter({
  categories,
  activeCategorySlug,
  query,
}: {
  categories: CategorySummary[];
  activeCategorySlug?: string;
  query?: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Filter by category">
      <Link
        href={buildHref(undefined, query)}
        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
          !activeCategorySlug
            ? "border-accent bg-accent text-accent-fg"
            : "border-border text-muted-fg hover:border-accent"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildHref(category.slug, query)}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            activeCategorySlug === category.slug
              ? "border-accent bg-accent text-accent-fg"
              : "border-border text-muted-fg hover:border-accent"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
