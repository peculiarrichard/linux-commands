import Link from "next/link";
import type { RecipeListItem } from "@/lib/queries/recipes";

export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col gap-1.5 rounded-lg border border-border bg-bg p-4 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-fg">{recipe.title}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-fg">
          {recipe.difficulty}
        </span>
      </div>
      <p className="text-sm text-muted-fg">{recipe.description}</p>
      {recipe.commandsUsed.length > 0 && (
        <p className="font-mono text-xs text-muted-fg">{recipe.commandsUsed.join(" · ")}</p>
      )}
    </Link>
  );
}
