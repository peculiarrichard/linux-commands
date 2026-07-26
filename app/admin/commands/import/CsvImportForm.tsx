"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ClientPagination } from "@/components/ClientPagination";
import {
  commitImport,
  previewImport,
  type CommitState,
  type PreviewRow,
  type PreviewState,
} from "@/lib/actions/csvImport";

const STATUS_STYLES: Record<PreviewRow["status"], string> = {
  new: "bg-accent text-accent-fg",
  update: "bg-muted text-fg",
  unchanged: "bg-muted text-muted-fg",
  error: "bg-red-500/10 text-red-500",
};

const ROWS_PER_PAGE = 20;

export function CsvImportForm() {
  const [previewState, previewAction] = useActionState<PreviewState, FormData>(previewImport, {});
  const [commitState, commitAction] = useActionState<CommitState, FormData>(commitImport, {});
  const [previewPage, setPreviewPage] = useState(1);
  const [errorPage, setErrorPage] = useState(1);

  const previewTotalPages = previewState.rows
    ? Math.max(1, Math.ceil(previewState.rows.length / ROWS_PER_PAGE))
    : 1;
  const errorTotalPages = commitState.batch
    ? Math.max(1, Math.ceil(commitState.batch.rowErrors.length / ROWS_PER_PAGE))
    : 1;

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium text-fg">
          CSV file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="text-sm text-fg"
        />
      </div>

      <div className="flex gap-2">
        <SubmitButton
          formAction={previewAction}
          label="Preview import"
          pendingLabel="Checking…"
          onClick={() => setPreviewPage(1)}
        />
        {previewState.rows && (
          <SubmitButton
            formAction={commitAction}
            label="Confirm import"
            pendingLabel="Importing…"
            onClick={() => setErrorPage(1)}
          />
        )}
      </div>

      {previewState.error && <ErrorBanner message={previewState.error} />}

      {previewState.rows && previewState.summary && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-fg">
            {previewState.fileName}: {previewState.summary.new} new, {previewState.summary.update}{" "}
            to update, {previewState.summary.unchanged} unchanged, {previewState.summary.error}{" "}
            error{previewState.summary.error === 1 ? "" : "s"}
            {previewState.summary.error > 0 && " (these rows will be skipped on import)"}.
          </p>
          <PreviewTable
            rows={previewState.rows.slice(
              (previewPage - 1) * ROWS_PER_PAGE,
              previewPage * ROWS_PER_PAGE,
            )}
          />
          <ClientPagination
            page={previewPage}
            totalPages={previewTotalPages}
            onChange={setPreviewPage}
          />
        </div>
      )}

      {commitState.error && <ErrorBanner message={commitState.error} />}

      {commitState.batch && (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-sm text-fg">
            Imported: {commitState.batch.rowsCreated} created, {commitState.batch.rowsUpdated}{" "}
            updated, {commitState.batch.rowsFailed} failed (of {commitState.batch.rowsTotal} rows).
          </p>
          {commitState.batch.rowErrors.length > 0 && (
            <>
              <ul className="flex flex-col gap-1 text-xs text-muted-fg">
                {commitState.batch.rowErrors
                  .slice((errorPage - 1) * ROWS_PER_PAGE, errorPage * ROWS_PER_PAGE)
                  .map((rowError) => (
                    <li key={rowError.row}>
                      Row {rowError.row}: {rowError.message}
                    </li>
                  ))}
              </ul>
              <ClientPagination
                page={errorPage}
                totalPages={errorTotalPages}
                onChange={setErrorPage}
              />
            </>
          )}
        </div>
      )}
    </form>
  );
}

function PreviewTable({ rows }: { rows: PreviewRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-fg">
            <th className="px-4 py-2 font-medium">Row</th>
            <th className="px-4 py-2 font-medium">Slug</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowNumber} className="border-b border-border last:border-0">
              <td className="px-4 py-2 text-muted-fg">{row.rowNumber}</td>
              <td className="px-4 py-2 font-mono text-fg">{row.slug}</td>
              <td className="px-4 py-2 text-fg">{row.name}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-2 text-muted-fg">{row.message ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
      {message}
    </p>
  );
}

function SubmitButton({
  formAction,
  label,
  pendingLabel,
  onClick,
}: {
  formAction: (formData: FormData) => void;
  label: string;
  pendingLabel: string;
  onClick?: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={onClick}
      disabled={pending}
      className="rounded-lg border border-border bg-fg px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
