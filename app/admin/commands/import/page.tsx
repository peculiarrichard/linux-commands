import { CsvImportForm } from "./CsvImportForm";

export const dynamic = "force-dynamic";

export default function ImportCsvPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Bulk import via CSV</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Download the template, fill it in, then upload it here. Nothing is written to the database
          until you click Confirm import — the preview only re-validates the file against the
          current data.
        </p>
      </div>

      <a
        href="/admin/commands/import/template"
        className="self-start rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-accent"
      >
        Download CSV template
      </a>

      <CsvImportForm />
    </div>
  );
}
