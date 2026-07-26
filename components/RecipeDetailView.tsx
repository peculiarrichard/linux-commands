export type RecipeDetailViewData = {
  title: string;
  description: string;
  shellSnippet: string;
  useCaseTags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

export function RecipeDetailView({ recipe }: { recipe: RecipeDetailViewData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{recipe.title || "—"}</h1>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-fg">
            {recipe.difficulty}
          </span>
        </div>
        <p className="text-base text-fg">{recipe.description}</p>
      </div>

      {recipe.shellSnippet && (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4">
          <code className="font-mono text-sm text-fg">{recipe.shellSnippet}</code>
        </pre>
      )}

      {recipe.useCaseTags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {recipe.useCaseTags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-fg">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
