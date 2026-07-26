import Link from "next/link";
import { notFound } from "next/navigation";
import { CommandDetailView } from "@/components/CommandDetailView";
import { RecipeCard } from "@/components/RecipeCard";
import { DatabaseSetupNotice } from "@/components/EmptyState";
import { DatabaseNotConfiguredError, getCommandBySlug } from "@/lib/queries/commands";
import { listRecipesUsingCommand } from "@/lib/queries/recipes";

export const dynamic = "force-dynamic";

export default async function CommandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let command;
  let recipes;
  try {
    command = await getCommandBySlug(slug);
    recipes = command ? await listRecipesUsingCommand(command.slug) : [];
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

  if (!command) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div>
        <Link
          href={command.category ? `/?category=${command.category.slug}` : "/"}
          className="text-sm text-muted-fg hover:text-accent"
        >
          ← Back to all commands
        </Link>
      </div>
      <CommandDetailView command={command} />

      {recipes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-fg">Used in these recipes</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
