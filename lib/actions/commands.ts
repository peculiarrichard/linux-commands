"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import CommandModel from "@/models/Command";

export type CommandActionState = { error?: string };

type ParsedForm = {
  name: string;
  slug: string;
  description: string;
  aliases: string[];
  rationaleText: string;
  rationaleSources: string[];
  categoryId: string;
  difficulty: string;
  status: string;
  options: { flag: string; description: string }[];
  examples: { command: string; explanation: string }[];
  platformNotes: { platform: string; notes: string }[];
};

function parseForm(formData: FormData): ParsedForm | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!description) return { error: "Description is required." };

  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Could not derive a valid slug from the name." };

  const aliases = String(formData.get("aliases") ?? "")
    .split(",")
    .map((alias) => alias.trim())
    .filter(Boolean);

  const rationaleSources = String(formData.get("rationaleSources") ?? "")
    .split("\n")
    .map((source) => source.trim())
    .filter(Boolean);

  let options: ParsedForm["options"];
  let examples: ParsedForm["examples"];
  let platformNotes: ParsedForm["platformNotes"];

  try {
    options = JSON.parse(String(formData.get("optionsJson") ?? "[]"));
    examples = JSON.parse(String(formData.get("examplesJson") ?? "[]"));
    platformNotes = JSON.parse(String(formData.get("platformNotesJson") ?? "[]"));
  } catch {
    return { error: "Malformed options/examples/platform notes data." };
  }

  return {
    name,
    slug,
    description,
    aliases,
    rationaleText: String(formData.get("rationaleText") ?? "").trim(),
    rationaleSources,
    categoryId: String(formData.get("categoryId") ?? ""),
    difficulty: String(formData.get("difficulty") ?? "beginner"),
    status: String(formData.get("status") ?? "draft"),
    options: options.filter((option) => option.flag && option.description),
    examples: examples.filter((example) => example.command && example.explanation),
    platformNotes: platformNotes.filter((note) => note.platform && note.notes),
  };
}

function diffFields(existing: Record<string, unknown>, parsed: ParsedForm): string[] {
  const changed: string[] = [];
  const rationale = existing.rationale as { text?: string; sources?: string[] } | undefined;

  if (existing.name !== parsed.name) changed.push("name");
  if (existing.slug !== parsed.slug) changed.push("slug");
  if (existing.description !== parsed.description) changed.push("description");
  if (JSON.stringify(existing.aliases ?? []) !== JSON.stringify(parsed.aliases)) {
    changed.push("aliases");
  }
  if ((rationale?.text ?? "") !== parsed.rationaleText) changed.push("rationale.text");
  if (JSON.stringify(rationale?.sources ?? []) !== JSON.stringify(parsed.rationaleSources)) {
    changed.push("rationale.sources");
  }
  if (String(existing.category ?? "") !== parsed.categoryId) changed.push("category");
  if (existing.difficulty !== parsed.difficulty) changed.push("difficulty");
  if (existing.status !== parsed.status) changed.push("status");
  if (JSON.stringify(existing.options ?? []) !== JSON.stringify(parsed.options)) {
    changed.push("options");
  }
  if (JSON.stringify(existing.examples ?? []) !== JSON.stringify(parsed.examples)) {
    changed.push("examples");
  }
  if (JSON.stringify(existing.platformNotes ?? []) !== JSON.stringify(parsed.platformNotes)) {
    changed.push("platformNotes");
  }
  return changed;
}

export async function createCommand(
  _prevState: CommandActionState,
  formData: FormData,
): Promise<CommandActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  await connectToDatabase();

  const existing = await CommandModel.findOne({ slug: parsed.slug }).lean();
  if (existing) {
    return { error: `A command with slug "${parsed.slug}" already exists.` };
  }

  await CommandModel.create({
    slug: parsed.slug,
    name: parsed.name,
    aliases: parsed.aliases,
    description: parsed.description,
    rationale: { text: parsed.rationaleText, sources: parsed.rationaleSources },
    category: parsed.categoryId || undefined,
    difficulty: parsed.difficulty,
    status: parsed.status,
    options: parsed.options,
    examples: parsed.examples,
    platformNotes: parsed.platformNotes,
    submittedVia: "admin",
    revisionHistory: [
      {
        changedBy: session.user.login ?? session.user.name ?? "unknown",
        changedAt: new Date(),
        diffSummary: "Created via admin UI",
      },
    ],
  });

  redirect(`/admin/commands/${parsed.slug}/edit?created=1`);
}

export async function updateCommand(
  slug: string,
  _prevState: CommandActionState,
  formData: FormData,
): Promise<CommandActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authorized." };
  }

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  await connectToDatabase();

  const existing = await CommandModel.findOne({ slug }).lean();
  if (!existing) {
    return { error: "Command not found." };
  }

  if (parsed.slug !== slug) {
    const slugTaken = await CommandModel.findOne({ slug: parsed.slug }).lean();
    if (slugTaken) {
      return { error: `A command with slug "${parsed.slug}" already exists.` };
    }
  }

  const changedFields = diffFields(existing as Record<string, unknown>, parsed);

  await CommandModel.updateOne(
    { slug },
    {
      $set: {
        slug: parsed.slug,
        name: parsed.name,
        aliases: parsed.aliases,
        description: parsed.description,
        "rationale.text": parsed.rationaleText,
        "rationale.sources": parsed.rationaleSources,
        category: parsed.categoryId || undefined,
        difficulty: parsed.difficulty,
        status: parsed.status,
        options: parsed.options,
        examples: parsed.examples,
        platformNotes: parsed.platformNotes,
      },
      $push: {
        revisionHistory: {
          changedBy: session.user.login ?? session.user.name ?? "unknown",
          changedAt: new Date(),
          diffSummary:
            changedFields.length > 0 ? `Updated: ${changedFields.join(", ")}` : "No field changes",
        },
      },
    },
  );

  redirect(`/admin/commands/${parsed.slug}/edit?saved=1`);
}
