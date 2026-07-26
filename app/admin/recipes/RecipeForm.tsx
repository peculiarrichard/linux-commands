"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { RecipeDetailView } from "@/components/RecipeDetailView";
import { slugify } from "@/lib/slugify";
import type { RecipeActionState } from "@/lib/actions/recipes";
import type { RecipeFormValues } from "@/lib/queries/admin-recipes";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:border-accent focus:outline-none";
const labelClass = "text-sm font-medium text-fg";

export function RecipeForm({
  mode,
  initialValues,
  action,
}: {
  mode: "create" | "edit";
  initialValues: RecipeFormValues;
  action: (prevState: RecipeActionState, formData: FormData) => Promise<RecipeActionState>;
}) {
  const [state, formAction] = useActionState(action, {});

  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(initialValues.description);
  const [shellSnippet, setShellSnippet] = useState(initialValues.shellSnippet);
  const [commandsUsed, setCommandsUsed] = useState(initialValues.commandsUsed);
  const [useCaseTags, setUseCaseTags] = useState(initialValues.useCaseTags);
  const [difficulty, setDifficulty] = useState(initialValues.difficulty);
  const [status, setStatus] = useState(initialValues.status);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={`${inputClass} font-mono`}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="shellSnippet">
            Shell snippet
          </label>
          <textarea
            id="shellSnippet"
            name="shellSnippet"
            value={shellSnippet}
            onChange={(e) => setShellSnippet(e.target.value)}
            rows={2}
            className={`${inputClass} font-mono`}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="commandsUsed">
            Commands used (comma-separated slugs)
          </label>
          <input
            id="commandsUsed"
            name="commandsUsed"
            value={commandsUsed}
            onChange={(e) => setCommandsUsed(e.target.value)}
            placeholder="find, grep"
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="useCaseTags">
            Tags (comma-separated)
          </label>
          <input
            id="useCaseTags"
            name="useCaseTags"
            value={useCaseTags}
            onChange={(e) => setUseCaseTags(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="difficulty">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className={inputClass}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {state.error}
          </p>
        )}

        <SubmitButton mode={mode} />
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="mb-3 text-sm font-medium text-muted-fg">Live preview</h2>
        <div className="rounded-lg border border-border p-6">
          <RecipeDetailView
            recipe={{
              title,
              description,
              shellSnippet,
              useCaseTags: useCaseTags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              difficulty,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg border border-border bg-fg px-5 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Saving…" : mode === "create" ? "Create recipe" : "Save changes"}
    </button>
  );
}
