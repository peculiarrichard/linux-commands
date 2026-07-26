import { connectToDatabase } from "@/lib/db";
import RecipeModel from "@/models/Recipe";
import {
  DEFAULT_PAGE_SIZE,
  resolvePage,
  totalPagesFor,
  type PaginatedResult,
} from "@/lib/pagination";

export type RecipeListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  commandsUsed: string[];
};

export type RecipeDetail = RecipeListItem & {
  shellSnippet: string;
  useCaseTags: string[];
};

function toRecipeListItem(doc: Record<string, unknown>): RecipeListItem {
  return {
    id: String(doc._id),
    slug: doc.slug as string,
    title: doc.title as string,
    description: doc.description as string,
    difficulty: doc.difficulty as RecipeListItem["difficulty"],
    commandsUsed: (doc.commandsUsed as string[]) ?? [],
  };
}

export async function listPublishedRecipes(
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<RecipeListItem>> {
  await connectToDatabase();

  const filter = { status: "published" };
  const totalCount = await RecipeModel.countDocuments(filter);
  const page = resolvePage(options.page);
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const docs = await RecipeModel.find(filter)
    .sort({ title: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    items: docs.map((doc) => toRecipeListItem(doc as Record<string, unknown>)),
    page,
    pageSize,
    totalCount,
    totalPages: totalPagesFor(totalCount, pageSize),
  };
}

export async function getRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  await connectToDatabase();
  const doc = await RecipeModel.findOne({ slug, status: "published" }).lean();
  if (!doc) return null;
  return {
    ...toRecipeListItem(doc as Record<string, unknown>),
    shellSnippet: doc.shellSnippet,
    useCaseTags: doc.useCaseTags ?? [],
  };
}

export async function listRecipesUsingCommand(commandSlug: string): Promise<RecipeListItem[]> {
  await connectToDatabase();
  const docs = await RecipeModel.find({ status: "published", commandsUsed: commandSlug })
    .sort({ title: 1 })
    .lean();
  return docs.map((doc) => toRecipeListItem(doc as Record<string, unknown>));
}
