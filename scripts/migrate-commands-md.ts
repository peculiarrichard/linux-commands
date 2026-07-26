import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { connectToDatabase } from "../lib/db";
import CommandModel from "../models/Command";
import CategoryModel from "../models/Category";

type ParsedCommand = {
  slug: string;
  name: string;
  rationale: string;
  description: string;
  options: { flag: string; description: string }[];
};

const CATEGORY_BY_SLUG: Record<string, { name: string; slug: string }> = {
  ls: { name: "Navigation & Files", slug: "navigation-files" },
  cd: { name: "Navigation & Files", slug: "navigation-files" },
  pwd: { name: "Navigation & Files", slug: "navigation-files" },
  mkdir: { name: "Navigation & Files", slug: "navigation-files" },
  rmdir: { name: "Navigation & Files", slug: "navigation-files" },
  rm: { name: "Navigation & Files", slug: "navigation-files" },
  touch: { name: "Navigation & Files", slug: "navigation-files" },
  cp: { name: "Navigation & Files", slug: "navigation-files" },
  mv: { name: "Navigation & Files", slug: "navigation-files" },
  cat: { name: "Navigation & Files", slug: "navigation-files" },
  head: { name: "Navigation & Files", slug: "navigation-files" },
  tail: { name: "Navigation & Files", slug: "navigation-files" },
  find: { name: "Navigation & Files", slug: "navigation-files" },
  echo: { name: "Text & Search", slug: "text-search" },
  grep: { name: "Text & Search", slug: "text-search" },
  chmod: { name: "Permissions & Ownership", slug: "permissions-ownership" },
  chown: { name: "Permissions & Ownership", slug: "permissions-ownership" },
  whoami: { name: "Permissions & Ownership", slug: "permissions-ownership" },
  id: { name: "Permissions & Ownership", slug: "permissions-ownership" },
  ps: { name: "Process Management", slug: "process-management" },
  top: { name: "Process Management", slug: "process-management" },
  kill: { name: "Process Management", slug: "process-management" },
  wget: { name: "Networking", slug: "networking" },
  curl: { name: "Networking", slug: "networking" },
  scp: { name: "Networking", slug: "networking" },
  nc: { name: "Networking", slug: "networking" },
  traceroute: { name: "Networking", slug: "networking" },
  tar: { name: "Archives & Compression", slug: "archives-compression" },
  zip: { name: "Archives & Compression", slug: "archives-compression" },
  unzip: { name: "Archives & Compression", slug: "archives-compression" },
  df: { name: "System Info", slug: "system-info" },
  du: { name: "System Info", slug: "system-info" },
  uname: { name: "System Info", slug: "system-info" },
  uptime: { name: "System Info", slug: "system-info" },
  history: { name: "Shell & Session", slug: "shell-session" },
  man: { name: "Shell & Session", slug: "shell-session" },
  alias: { name: "Shell & Session", slug: "shell-session" },
  unalias: { name: "Shell & Session", slug: "shell-session" },
  clear: { name: "Shell & Session", slug: "shell-session" },
};

const HEADING_RE = /^#{2,3}\s+\d+\.\s*`?([A-Za-z0-9_-]+)`?\s*$/;
const FIELD_RE = /^-?\s*\*\*([A-Za-z]+):?\*\*:?\s*(.*)$/;
const OPTION_RE = /^-\s*`([^`]+)`\s*:\s*(.*)$/;

export function parseCommandsMd(content: string): ParsedCommand[] {
  const lines = content.split(/\r?\n/);
  const entries: ParsedCommand[] = [];
  let current: ParsedCommand | null = null;
  let inOptions = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    const headingMatch = trimmed.match(HEADING_RE);

    if (headingMatch) {
      if (current) entries.push(current);
      const name = headingMatch[1];
      current = { slug: name.toLowerCase(), name, rationale: "", description: "", options: [] };
      inOptions = false;
      continue;
    }

    if (!current) continue;

    if (inOptions) {
      const optionMatch = trimmed.match(OPTION_RE);
      if (optionMatch) {
        current.options.push({ flag: optionMatch[1].trim(), description: optionMatch[2].trim() });
        continue;
      }
      if (trimmed === "") {
        inOptions = false;
        continue;
      }
      inOptions = false;
    }

    const fieldMatch = trimmed.match(FIELD_RE);
    if (fieldMatch) {
      const field = fieldMatch[1].toLowerCase();
      const value = fieldMatch[2].trim();
      if (field === "rationale") current.rationale = value;
      else if (field === "description") current.description = value;
      else if (field === "options") inOptions = true;
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const filePath = join(process.cwd(), "commands.md");
  const content = readFileSync(filePath, "utf-8");
  const parsed = parseCommandsMd(content);

  const seen = new Set<string>();
  const unique: ParsedCommand[] = [];
  let duplicates = 0;

  for (const entry of parsed) {
    if (seen.has(entry.slug)) {
      console.warn(
        `Skipping duplicate slug "${entry.slug}" (${entry.name}) — commands.md lists it more than once.`,
      );
      duplicates++;
      continue;
    }
    seen.add(entry.slug);
    unique.push(entry);
    if (!CATEGORY_BY_SLUG[entry.slug]) {
      console.warn(`No category mapping for "${entry.slug}" — will import uncategorized.`);
    }
  }

  console.log(
    `Parsed ${parsed.length} entries from commands.md: ${unique.length} unique, ${duplicates} duplicate.`,
  );

  if (dryRun) {
    console.log(JSON.stringify(unique, null, 2));
    return;
  }

  await connectToDatabase();

  let created = 0;
  let updated = 0;

  for (const entry of unique) {
    const categoryInfo = CATEGORY_BY_SLUG[entry.slug];
    let categoryId;

    if (categoryInfo) {
      const category = await CategoryModel.findOneAndUpdate(
        { slug: categoryInfo.slug },
        { $setOnInsert: { name: categoryInfo.name, slug: categoryInfo.slug, description: "" } },
        { upsert: true, new: true },
      );
      categoryId = category._id;
    }

    const result = await CommandModel.findOneAndUpdate(
      { slug: entry.slug },
      {
        $set: {
          name: entry.name,
          description: entry.description,
          "rationale.text": entry.rationale,
          options: entry.options,
          category: categoryId,
          status: "published",
          submittedVia: "content-pr",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true },
    );

    if (result.lastErrorObject?.updatedExisting) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(`Migration complete: ${created} created, ${updated} updated.`);
  process.exit(0);
}

const isMainModule = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
