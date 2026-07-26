"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitSuggestion, type SuggestionActionState } from "@/lib/actions/suggestions";

const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:border-accent focus:outline-none";
const labelClass = "text-sm font-medium text-fg";

export function SuggestForm() {
  const [state, formAction] = useActionState<SuggestionActionState, FormData>(submitSuggestion, {});
  const [renderedAt] = useState(() => Date.now());

  if (state.success) {
    return (
      <p className="rounded-lg border border-border bg-muted p-4 text-sm text-fg">
        Thanks — a maintainer will take a look. Suggestions aren&apos;t published automatically; see{" "}
        <a
          href="https://github.com/peculiarrichard/linux-commands/blob/main/CONTRIBUTING.md"
          className="text-accent hover:underline"
        >
          CONTRIBUTING.md
        </a>{" "}
        for the review process.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="formRenderedAt" value={renderedAt} />

      {/* Honeypot — hidden from sighted users and screen readers, real bots often fill every field they find. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="name">
          Command name
        </label>
        <input id="name" name="name" required className={`${inputClass} font-mono`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="description">
          What does it do?
        </label>
        <textarea id="description" name="description" required rows={2} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="rationaleText">
          Know why it&apos;s called that? (optional)
        </label>
        <textarea id="rationaleText" name="rationaleText" rows={2} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="submittedByName">
            Your name (optional)
          </label>
          <input id="submittedByName" name="submittedByName" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="submittedByContact">
            GitHub handle or email (optional)
          </label>
          <input id="submittedByContact" name="submittedByContact" className={inputClass} />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg border border-border bg-fg px-5 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Sending…" : "Suggest command"}
    </button>
  );
}
