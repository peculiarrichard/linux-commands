import Papa from "papaparse";
import { slugify } from "@/lib/slugify";

export const CSV_COLUMNS = [
  "slug",
  "name",
  "description",
  "aliases",
  "rationaleText",
  "rationaleSources",
  "category",
  "difficulty",
  "status",
  "options",
  "examples",
  "platformNotes",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];
export type CsvRow = Record<CsvColumn, string>;

export type ParsedCsvCommand = {
  slug: string;
  name: string;
  description: string;
  aliases: string[];
  rationaleText: string;
  rationaleSources: string[];
  categorySlug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft";
  options: { flag: string; description: string }[];
  examples: { command: string; explanation: string }[];
  platformNotes: { platform: "gnu" | "bsd" | "macos" | "busybox"; notes: string }[];
};

const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const STATUSES = new Set(["published", "draft"]);
const PLATFORMS = new Set(["gnu", "bsd", "macos", "busybox"]);

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePipeList(value: string): string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

// Every repeatable cell (options/examples/platformNotes) uses one convention:
// "|" separates entries, ":" separates the key from the value within an entry.
// e.g. options: "-l: Long listing format | -a: Show hidden files"
function parseKeyValueList(value: string): { key: string; value: string }[] {
  return parsePipeList(value).map((entry) => {
    const separatorIndex = entry.indexOf(":");
    if (separatorIndex === -1) return { key: entry.trim(), value: "" };
    return {
      key: entry.slice(0, separatorIndex).trim(),
      value: entry.slice(separatorIndex + 1).trim(),
    };
  });
}

export function parseCsvText(text: string): { rows: CsvRow[] } | { error: string } {
  const result = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });

  if (result.errors.length > 0) {
    return { error: result.errors[0].message };
  }

  const headers = result.meta.fields ?? [];
  const missing = CSV_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return { error: `Missing required column(s): ${missing.join(", ")}` };
  }

  return { rows: result.data };
}

export function parseCsvRow(row: CsvRow): { data: ParsedCsvCommand } | { error: string } {
  const name = (row.name ?? "").trim();
  const description = (row.description ?? "").trim();

  if (!name) return { error: "Missing required field: name" };
  if (!description) return { error: "Missing required field: description" };

  const slug = slugify((row.slug ?? "").trim() || name);
  if (!slug) return { error: "Could not derive a valid slug from name/slug" };

  const difficultyRaw = (row.difficulty ?? "").trim().toLowerCase() || "beginner";
  if (!DIFFICULTIES.has(difficultyRaw)) {
    return {
      error: `Invalid difficulty "${row.difficulty}" — must be beginner, intermediate, or advanced`,
    };
  }

  const statusRaw = (row.status ?? "").trim().toLowerCase() || "draft";
  if (!STATUSES.has(statusRaw)) {
    return { error: `Invalid status "${row.status}" — must be published or draft` };
  }

  const options = parseKeyValueList(row.options ?? "").map(({ key, value }) => ({
    flag: key,
    description: value,
  }));
  if (options.some((option) => !option.flag || !option.description)) {
    return { error: 'Malformed options — expected "flag: description | flag: description"' };
  }

  const examples = parseKeyValueList(row.examples ?? "").map(({ key, value }) => ({
    command: key,
    explanation: value,
  }));
  if (examples.some((example) => !example.command || !example.explanation)) {
    return {
      error: 'Malformed examples — expected "command: explanation | command: explanation"',
    };
  }

  const platformNotes: ParsedCsvCommand["platformNotes"] = [];
  for (const { key, value } of parseKeyValueList(row.platformNotes ?? "")) {
    const platform = key.toLowerCase();
    if (!PLATFORMS.has(platform)) {
      return {
        error: `Invalid platform "${key}" in platformNotes — must be gnu, bsd, macos, or busybox`,
      };
    }
    if (!value) {
      return {
        error: 'Malformed platformNotes — expected "platform: notes | platform: notes"',
      };
    }
    platformNotes.push({
      platform: platform as ParsedCsvCommand["platformNotes"][number]["platform"],
      notes: value,
    });
  }

  return {
    data: {
      slug,
      name,
      description,
      aliases: parseCommaList(row.aliases ?? ""),
      rationaleText: (row.rationaleText ?? "").trim(),
      rationaleSources: parsePipeList(row.rationaleSources ?? ""),
      categorySlug: (row.category ?? "").trim().toLowerCase(),
      difficulty: difficultyRaw as ParsedCsvCommand["difficulty"],
      status: statusRaw as ParsedCsvCommand["status"],
      options,
      examples,
      platformNotes,
    },
  };
}
