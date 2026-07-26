"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CommandDetailView } from "@/components/CommandDetailView";
import { slugify } from "@/lib/slugify";
import type { CommandActionState } from "@/lib/actions/commands";
import type { CommandFormValues } from "@/lib/queries/admin-commands";
import type { CategorySummary } from "@/lib/queries/commands";

type Option = { flag: string; description: string };
type Example = { command: string; explanation: string };
type PlatformNoteRow = { platform: (typeof PLATFORMS)[number]; notes: string };

const PLATFORMS = ["gnu", "bsd", "macos", "busybox"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:border-accent focus:outline-none";
const labelClass = "text-sm font-medium text-fg";

export function CommandForm({
  mode,
  initialValues,
  categories,
  action,
}: {
  mode: "create" | "edit";
  initialValues: CommandFormValues;
  categories: CategorySummary[];
  action: (prevState: CommandActionState, formData: FormData) => Promise<CommandActionState>;
}) {
  const [state, formAction] = useActionState(action, {});

  const [name, setName] = useState(initialValues.name);
  const [slug, setSlug] = useState(initialValues.slug || slugify(initialValues.name));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(initialValues.description);
  const [aliases, setAliases] = useState(initialValues.aliases);
  const [rationaleText, setRationaleText] = useState(initialValues.rationaleText);
  const [rationaleSources, setRationaleSources] = useState(initialValues.rationaleSources);
  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [difficulty, setDifficulty] = useState(initialValues.difficulty);
  const [status, setStatus] = useState(initialValues.status);
  const [options, setOptions] = useState<Option[]>(initialValues.options);
  const [examples, setExamples] = useState<Example[]>(initialValues.examples);
  const [platformNotes, setPlatformNotes] = useState<PlatformNoteRow[]>(
    initialValues.platformNotes as PlatformNoteRow[],
  );

  const activeCategory = categories.find((c) => c.id === categoryId) ?? null;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
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
          <label className={labelClass} htmlFor="aliases">
            Aliases (comma-separated)
          </label>
          <input
            id="aliases"
            name="aliases"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="rationaleText">
            Rationale — why it&apos;s called that
          </label>
          <textarea
            id="rationaleText"
            name="rationaleText"
            value={rationaleText}
            onChange={(e) => setRationaleText(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="rationaleSources">
            Sources (one URL per line)
          </label>
          <textarea
            id="rationaleSources"
            name="rationaleSources"
            value={rationaleSources}
            onChange={(e) => setRationaleSources(e.target.value)}
            rows={2}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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

        <RowListEditor
          title="Options"
          rows={options}
          onChange={setOptions}
          newRow={{ flag: "", description: "" }}
          renderRow={(row, update) => (
            <>
              <input
                value={row.flag}
                onChange={(e) => update({ ...row, flag: e.target.value })}
                placeholder="-l"
                className={`${inputClass} w-32 font-mono`}
              />
              <input
                value={row.description}
                onChange={(e) => update({ ...row, description: e.target.value })}
                placeholder="Long listing format"
                className={inputClass}
              />
            </>
          )}
        />

        <RowListEditor
          title="Examples"
          rows={examples}
          onChange={setExamples}
          newRow={{ command: "", explanation: "" }}
          renderRow={(row, update) => (
            <>
              <input
                value={row.command}
                onChange={(e) => update({ ...row, command: e.target.value })}
                placeholder="ls -la"
                className={`${inputClass} w-48 font-mono`}
              />
              <input
                value={row.explanation}
                onChange={(e) => update({ ...row, explanation: e.target.value })}
                placeholder="Lists all files, including hidden ones, in long format"
                className={inputClass}
              />
            </>
          )}
        />

        <RowListEditor
          title="Platform differences"
          rows={platformNotes}
          onChange={setPlatformNotes}
          newRow={{ platform: "gnu", notes: "" }}
          renderRow={(row, update) => (
            <>
              <select
                value={row.platform}
                onChange={(e) =>
                  update({ ...row, platform: e.target.value as PlatformNoteRow["platform"] })
                }
                className={`${inputClass} w-32`}
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
              <input
                value={row.notes}
                onChange={(e) => update({ ...row, notes: e.target.value })}
                placeholder="-i requires an argument on BSD/macOS"
                className={inputClass}
              />
            </>
          )}
        />

        <input type="hidden" name="optionsJson" value={JSON.stringify(options)} readOnly />
        <input type="hidden" name="examplesJson" value={JSON.stringify(examples)} readOnly />
        <input
          type="hidden"
          name="platformNotesJson"
          value={JSON.stringify(platformNotes)}
          readOnly
        />

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
          <CommandDetailView
            command={{
              name,
              aliases: aliases
                .split(",")
                .map((alias) => alias.trim())
                .filter(Boolean),
              description,
              category: activeCategory ? { name: activeCategory.name } : null,
              rationale: {
                text: rationaleText,
                sources: rationaleSources
                  .split("\n")
                  .map((source) => source.trim())
                  .filter(Boolean),
              },
              options: options.filter((option) => option.flag && option.description),
              examples: examples.filter((example) => example.command && example.explanation),
              platformNotes: platformNotes.filter((note) => note.notes),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function RowListEditor<T>({
  title,
  rows,
  onChange,
  newRow,
  renderRow,
}: {
  title: string;
  rows: T[];
  onChange: (rows: T[]) => void;
  newRow: T;
  renderRow: (row: T, update: (row: T) => void) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{title}</span>
      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          {renderRow(row, (updated) => {
            const next = [...rows];
            next[index] = updated;
            onChange(next);
          })}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            className="rounded-lg border border-border px-2 py-2 text-xs text-muted-fg hover:border-accent"
            aria-label={`Remove ${title.toLowerCase()} row ${index + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, newRow])}
        className="self-start rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-fg hover:border-accent"
      >
        + Add row
      </button>
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
      {pending ? "Saving…" : mode === "create" ? "Create command" : "Save changes"}
    </button>
  );
}
