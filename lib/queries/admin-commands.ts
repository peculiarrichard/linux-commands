import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import CommandModel from "@/models/Command";
import type { CommandOption, CommandExample, PlatformNote } from "@/lib/queries/commands";
import {
  DEFAULT_PAGE_SIZE,
  resolvePage,
  totalPagesFor,
  type PaginatedResult,
} from "@/lib/pagination";

export type AdminCommandListItem = {
  id: string;
  slug: string;
  name: string;
  status: "published" | "draft";
  categoryName: string | null;
  updatedAt: string;
};

export type RevisionEntry = {
  changedBy: string;
  changedAt: string;
  diffSummary: string;
};

export type CommandFormValues = {
  slug: string;
  name: string;
  aliases: string;
  description: string;
  rationaleText: string;
  rationaleSources: string;
  categoryId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft";
  options: CommandOption[];
  examples: CommandExample[];
  platformNotes: PlatformNote[];
};

export const emptyCommandFormValues: CommandFormValues = {
  slug: "",
  name: "",
  aliases: "",
  description: "",
  rationaleText: "",
  rationaleSources: "",
  categoryId: "",
  difficulty: "beginner",
  status: "draft",
  options: [],
  examples: [],
  platformNotes: [],
};

export async function listAllCommandsForAdmin(
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<AdminCommandListItem>> {
  await connectToDatabase();

  const totalCount = await CommandModel.countDocuments();
  const page = resolvePage(options.page);
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const docs = await CommandModel.find()
    .sort({ updatedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("category")
    .lean();

  const items = docs.map((doc) => {
    const category = doc.category as { name?: string } | null;
    return {
      id: (doc._id as Types.ObjectId).toString(),
      slug: doc.slug,
      name: doc.name,
      status: doc.status as "published" | "draft",
      categoryName: category && typeof category === "object" ? (category.name ?? null) : null,
      updatedAt: (doc.updatedAt as Date).toISOString(),
    };
  });

  return { items, page, pageSize, totalCount, totalPages: totalPagesFor(totalCount, pageSize) };
}

export async function getCommandForEdit(
  slug: string,
): Promise<{ values: CommandFormValues; revisionHistory: RevisionEntry[] } | null> {
  await connectToDatabase();
  const doc = await CommandModel.findOne({ slug }).lean();
  if (!doc) return null;

  const categoryId = doc.category ? (doc.category as Types.ObjectId).toString() : "";

  return {
    values: {
      slug: doc.slug,
      name: doc.name,
      aliases: (doc.aliases ?? []).join(", "),
      description: doc.description,
      rationaleText: doc.rationale?.text ?? "",
      rationaleSources: (doc.rationale?.sources ?? []).join("\n"),
      categoryId,
      difficulty: doc.difficulty as CommandFormValues["difficulty"],
      status: doc.status as CommandFormValues["status"],
      options: doc.options ?? [],
      examples: doc.examples ?? [],
      platformNotes: (doc.platformNotes ?? []) as PlatformNote[],
    },
    revisionHistory: (doc.revisionHistory ?? [])
      .map((entry: { changedBy: string; changedAt: Date; diffSummary: string }) => ({
        changedBy: entry.changedBy,
        changedAt: entry.changedAt.toISOString(),
        diffSummary: entry.diffSummary,
      }))
      .reverse(),
  };
}
