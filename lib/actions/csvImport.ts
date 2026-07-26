"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { parseCsvRow, parseCsvText, type ParsedCsvCommand } from "@/lib/csv/commandCsv";
import CategoryModel from "@/models/Category";
import CommandModel from "@/models/Command";
import ImportBatchModel from "@/models/ImportBatch";

type Entry = { rowNumber: number; data: ParsedCsvCommand } | { rowNumber: number; error: string };

async function extractEntries(
  formData: FormData,
): Promise<{ fileName: string; entries: Entry[] } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file first." };
  }

  const text = await file.text();
  const parsed = parseCsvText(text);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const seenSlugs = new Set<string>();
  const entries: Entry[] = parsed.rows.map((row, index) => {
    const rowNumber = index + 2; // account for the header row
    const result = parseCsvRow(row);
    if ("error" in result) {
      return { rowNumber, error: result.error };
    }
    if (seenSlugs.has(result.data.slug)) {
      return { rowNumber, error: `Duplicate slug "${result.data.slug}" within this file` };
    }
    seenSlugs.add(result.data.slug);
    return { rowNumber, data: result.data };
  });

  return { fileName: file.name, entries };
}

function diffAgainstExisting(
  existing: Record<string, unknown>,
  data: ParsedCsvCommand,
  categoryId: string | undefined,
): string[] {
  const changed: string[] = [];
  const rationale = existing.rationale as { text?: string; sources?: string[] } | undefined;

  if (existing.name !== data.name) changed.push("name");
  if (existing.description !== data.description) changed.push("description");
  if (JSON.stringify(existing.aliases ?? []) !== JSON.stringify(data.aliases))
    changed.push("aliases");
  if ((rationale?.text ?? "") !== data.rationaleText) changed.push("rationale.text");
  if (JSON.stringify(rationale?.sources ?? []) !== JSON.stringify(data.rationaleSources)) {
    changed.push("rationale.sources");
  }
  if (String(existing.category ?? "") !== (categoryId ?? "")) changed.push("category");
  if (existing.difficulty !== data.difficulty) changed.push("difficulty");
  if (existing.status !== data.status) changed.push("status");
  if (JSON.stringify(existing.options ?? []) !== JSON.stringify(data.options))
    changed.push("options");
  if (JSON.stringify(existing.examples ?? []) !== JSON.stringify(data.examples))
    changed.push("examples");
  if (JSON.stringify(existing.platformNotes ?? []) !== JSON.stringify(data.platformNotes)) {
    changed.push("platformNotes");
  }
  return changed;
}

export type PreviewRow = {
  rowNumber: number;
  slug: string;
  name: string;
  status: "new" | "update" | "unchanged" | "error";
  message?: string;
};

export type PreviewState = {
  error?: string;
  fileName?: string;
  rows?: PreviewRow[];
  summary?: { new: number; update: number; unchanged: number; error: number };
};

export async function previewImport(
  _prevState: PreviewState,
  formData: FormData,
): Promise<PreviewState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const extracted = await extractEntries(formData);
  if ("error" in extracted) return { error: extracted.error };

  await connectToDatabase();
  const categories = await CategoryModel.find().lean();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c._id.toString()]));

  const rows: PreviewRow[] = [];
  const summary = { new: 0, update: 0, unchanged: 0, error: 0 };

  for (const entry of extracted.entries) {
    if ("error" in entry) {
      rows.push({
        rowNumber: entry.rowNumber,
        slug: "—",
        name: "—",
        status: "error",
        message: entry.error,
      });
      summary.error++;
      continue;
    }

    const { data } = entry;
    if (data.categorySlug && !categoryIdBySlug.has(data.categorySlug)) {
      rows.push({
        rowNumber: entry.rowNumber,
        slug: data.slug,
        name: data.name,
        status: "error",
        message: `Unknown category "${data.categorySlug}"`,
      });
      summary.error++;
      continue;
    }

    const existing = await CommandModel.findOne({ slug: data.slug }).lean();
    if (!existing) {
      rows.push({ rowNumber: entry.rowNumber, slug: data.slug, name: data.name, status: "new" });
      summary.new++;
      continue;
    }

    const categoryId = data.categorySlug ? categoryIdBySlug.get(data.categorySlug) : undefined;
    const changed = diffAgainstExisting(existing as Record<string, unknown>, data, categoryId);
    if (changed.length === 0) {
      rows.push({
        rowNumber: entry.rowNumber,
        slug: data.slug,
        name: data.name,
        status: "unchanged",
      });
      summary.unchanged++;
    } else {
      rows.push({
        rowNumber: entry.rowNumber,
        slug: data.slug,
        name: data.name,
        status: "update",
        message: `Changes: ${changed.join(", ")}`,
      });
      summary.update++;
    }
  }

  return { fileName: extracted.fileName, rows, summary };
}

export type CommitState = {
  error?: string;
  batch?: {
    rowsTotal: number;
    rowsCreated: number;
    rowsUpdated: number;
    rowsFailed: number;
    rowErrors: { row: number; message: string }[];
  };
};

export async function commitImport(
  _prevState: CommitState,
  formData: FormData,
): Promise<CommitState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const extracted = await extractEntries(formData);
  if ("error" in extracted) return { error: extracted.error };

  await connectToDatabase();
  const categories = await CategoryModel.find().lean();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c._id.toString()]));

  const changedBy = session.user.login ?? session.user.name ?? "unknown";
  let rowsCreated = 0;
  let rowsUpdated = 0;
  let rowsFailed = 0;
  const rowErrors: { row: number; message: string }[] = [];

  for (const entry of extracted.entries) {
    if ("error" in entry) {
      rowsFailed++;
      rowErrors.push({ row: entry.rowNumber, message: entry.error });
      continue;
    }

    const { data } = entry;

    if (data.categorySlug && !categoryIdBySlug.has(data.categorySlug)) {
      rowsFailed++;
      rowErrors.push({ row: entry.rowNumber, message: `Unknown category "${data.categorySlug}"` });
      continue;
    }

    const categoryId = data.categorySlug ? categoryIdBySlug.get(data.categorySlug) : undefined;

    try {
      const existing = await CommandModel.findOne({ slug: data.slug });
      if (existing) {
        existing.set({
          name: data.name,
          description: data.description,
          aliases: data.aliases,
          "rationale.text": data.rationaleText,
          "rationale.sources": data.rationaleSources,
          category: categoryId,
          difficulty: data.difficulty,
          status: data.status,
          options: data.options,
          examples: data.examples,
          platformNotes: data.platformNotes,
        });
        existing.revisionHistory.push({
          changedBy,
          changedAt: new Date(),
          diffSummary: `Updated via CSV import (${extracted.fileName})`,
        });
        await existing.save();
        rowsUpdated++;
      } else {
        await CommandModel.create({
          slug: data.slug,
          name: data.name,
          description: data.description,
          aliases: data.aliases,
          rationale: { text: data.rationaleText, sources: data.rationaleSources },
          category: categoryId,
          difficulty: data.difficulty,
          status: data.status,
          options: data.options,
          examples: data.examples,
          platformNotes: data.platformNotes,
          submittedVia: "admin",
          revisionHistory: [
            {
              changedBy,
              changedAt: new Date(),
              diffSummary: `Created via CSV import (${extracted.fileName})`,
            },
          ],
        });
        rowsCreated++;
      }
    } catch (err) {
      rowsFailed++;
      rowErrors.push({
        row: entry.rowNumber,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const batch = {
    rowsTotal: extracted.entries.length,
    rowsCreated,
    rowsUpdated,
    rowsFailed,
    rowErrors,
  };

  await ImportBatchModel.create({
    fileName: extracted.fileName,
    uploadedBy: changedBy,
    ...batch,
  });

  return { batch };
}
