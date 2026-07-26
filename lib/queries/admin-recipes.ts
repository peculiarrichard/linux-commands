import { connectToDatabase } from "@/lib/db";
import RecipeModel from "@/models/Recipe";
import {
  DEFAULT_PAGE_SIZE,
  resolvePage,
  totalPagesFor,
  type PaginatedResult,
} from "@/lib/pagination";

export type AdminRecipeListItem = {
  id: string;
  slug: string;
  title: string;
  status: "published" | "draft";
  updatedAt: string;
};

export type RecipeFormValues = {
  slug: string;
  title: string;
  description: string;
  shellSnippet: string;
  commandsUsed: string;
  useCaseTags: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "published" | "draft";
};

export const emptyRecipeFormValues: RecipeFormValues = {
  slug: "",
  title: "",
  description: "",
  shellSnippet: "",
  commandsUsed: "",
  useCaseTags: "",
  difficulty: "beginner",
  status: "draft",
};

export async function listAllRecipesForAdmin(
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<AdminRecipeListItem>> {
  await connectToDatabase();

  const totalCount = await RecipeModel.countDocuments();
  const page = resolvePage(options.page);
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const docs = await RecipeModel.find()
    .sort({ updatedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    status: doc.status as "published" | "draft",
    updatedAt: (doc.updatedAt as Date).toISOString(),
  }));

  return { items, page, pageSize, totalCount, totalPages: totalPagesFor(totalCount, pageSize) };
}

export async function getRecipeForEdit(slug: string): Promise<RecipeFormValues | null> {
  await connectToDatabase();
  const doc = await RecipeModel.findOne({ slug }).lean();
  if (!doc) return null;

  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    shellSnippet: doc.shellSnippet,
    commandsUsed: (doc.commandsUsed ?? []).join(", "),
    useCaseTags: (doc.useCaseTags ?? []).join(", "),
    difficulty: doc.difficulty as RecipeFormValues["difficulty"],
    status: doc.status as RecipeFormValues["status"],
  };
}
