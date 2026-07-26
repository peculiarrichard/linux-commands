import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeDetailView } from "@/components/RecipeDetailView";
import { DatabaseSetupNotice } from "@/components/EmptyState";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { getRecipeBySlug } from "@/lib/queries/recipes";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let recipe;
  try {
    recipe = await getRecipeBySlug(slug);
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <DatabaseSetupNotice />
        </main>
      );
    }
    throw err;
  }

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/recipes" className="text-sm text-muted-fg hover:text-accent">
        ← Back to recipes
      </Link>

      <RecipeDetailView recipe={recipe} />

      {recipe.commandsUsed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-fg">Uses:</span>
          {recipe.commandsUsed.map((commandSlug) => (
            <Link
              key={commandSlug}
              href={`/commands/${commandSlug}`}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-fg hover:border-accent"
            >
              {commandSlug}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
