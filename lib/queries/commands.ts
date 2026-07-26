import { Types } from "mongoose";
import { connectToDatabase, DatabaseNotConfiguredError } from "@/lib/db";
import CommandModel from "@/models/Command";
import CategoryModel from "@/models/Category";
import {
  DEFAULT_PAGE_SIZE,
  resolvePage,
  totalPagesFor,
  type PaginatedResult,
} from "@/lib/pagination";

export { DatabaseNotConfiguredError };

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type CommandOption = { flag: string; description: string };
export type CommandExample = { command: string; explanation: string };
export type PlatformNote = {
  platform: "gnu" | "bsd" | "macos" | "busybox";
  notes: string;
};

export type CommandListItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  aliases: string[];
  category: CategorySummary | null;
};

export type CommandDetail = CommandListItem & {
  aliases: string[];
  rationale: { text: string; sources: string[] };
  options: CommandOption[];
  examples: CommandExample[];
  platformNotes: PlatformNote[];
  relatedCommands: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

function toCategorySummary(category: unknown): CategorySummary | null {
  if (!category || typeof category !== "object" || category instanceof Types.ObjectId) {
    return null;
  }
  const c = category as { _id: Types.ObjectId; name: string; slug: string };
  return { id: c._id.toString(), name: c.name, slug: c.slug };
}

// Mongoose's .lean() return type doesn't line up cleanly with InferSchemaType once
// populate() is involved, so results are mapped into the plain types above at the
// query boundary rather than threading Mongoose document types into the UI layer.
function toCommandListItem(doc: Record<string, unknown>): CommandListItem {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    slug: doc.slug as string,
    name: doc.name as string,
    description: doc.description as string,
    aliases: (doc.aliases as string[]) ?? [],
    category: toCategorySummary(doc.category),
  };
}

function toCommandDetail(doc: Record<string, unknown>): CommandDetail {
  return {
    ...toCommandListItem(doc),
    rationale: (doc.rationale as CommandDetail["rationale"]) ?? { text: "", sources: [] },
    options: (doc.options as CommandOption[]) ?? [],
    examples: (doc.examples as CommandExample[]) ?? [],
    platformNotes: (doc.platformNotes as PlatformNote[]) ?? [],
    relatedCommands: (doc.relatedCommands as string[]) ?? [],
    difficulty: (doc.difficulty as CommandDetail["difficulty"]) ?? "beginner",
  };
}

// `page` is opt-in: when omitted, every published command is returned
// unpaginated in a single "page" (used by the CommandPalette, which needs
// the full catalog client-side for fuzzy search). Pass `page` to get real
// skip/limit pagination — used by the homepage and the public API when a
// caller explicitly asks for it.
export async function listPublishedCommands(
  options: { categorySlug?: string; query?: string; page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<CommandListItem>> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { status: "published" };

  if (options.categorySlug) {
    const category = await CategoryModel.findOne({ slug: options.categorySlug }).lean();
    filter.category = category?._id ?? null;
  }

  if (options.query) {
    filter.$text = { $search: options.query };
  }

  const totalCount = await CommandModel.countDocuments(filter);
  let query = CommandModel.find(filter).sort({ name: 1 }).populate("category");

  const paginate = options.page !== undefined;
  const page = paginate ? resolvePage(options.page) : 1;
  const pageSize = paginate ? (options.pageSize ?? DEFAULT_PAGE_SIZE) : totalCount || 1;

  if (paginate) {
    query = query.skip((page - 1) * pageSize).limit(pageSize);
  }

  const docs = await query.lean();

  return {
    items: docs.map((doc) => toCommandListItem(doc as Record<string, unknown>)),
    page,
    pageSize,
    totalCount,
    totalPages: paginate ? totalPagesFor(totalCount, pageSize) : 1,
  };
}

export async function getCommandBySlug(slug: string): Promise<CommandDetail | null> {
  await connectToDatabase();
  const doc = await CommandModel.findOne({ slug, status: "published" }).populate("category").lean();
  return doc ? toCommandDetail(doc as Record<string, unknown>) : null;
}

export async function listCategories(): Promise<CategorySummary[]> {
  await connectToDatabase();
  const docs = await CategoryModel.find().sort({ name: 1 }).lean();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
  }));
}
