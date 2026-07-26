"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import RecipeModel from "@/models/Recipe";

export type RecipeActionState = { error?: string };

type ParsedRecipeForm = {
  slug: string;
  title: string;
  description: string;
  shellSnippet: string;
  commandsUsed: string[];
  useCaseTags: string[];
  difficulty: string;
  status: string;
};

function parseForm(formData: FormData): ParsedRecipeForm | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const shellSnippet = String(formData.get("shellSnippet") ?? "").trim();

  if (!title) return { error: "Title is required." };
  if (!description) return { error: "Description is required." };
  if (!shellSnippet) return { error: "Shell snippet is required." };

  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || title);
  if (!slug) return { error: "Could not derive a valid slug from the title." };

  const commandsUsed = String(formData.get("commandsUsed") ?? "")
    .split(",")
    .map((s) => slugify(s.trim()))
    .filter(Boolean);

  const useCaseTags = String(formData.get("useCaseTags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    slug,
    title,
    description,
    shellSnippet,
    commandsUsed,
    useCaseTags,
    difficulty: String(formData.get("difficulty") ?? "beginner"),
    status: String(formData.get("status") ?? "draft"),
  };
}

export async function createRecipe(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  await connectToDatabase();

  const existing = await RecipeModel.findOne({ slug: parsed.slug }).lean();
  if (existing) {
    return { error: `A recipe with slug "${parsed.slug}" already exists.` };
  }

  await RecipeModel.create(parsed);

  redirect(`/admin/recipes/${parsed.slug}/edit?created=1`);
}

export async function updateRecipe(
  slug: string,
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return parsed;

  await connectToDatabase();

  const existing = await RecipeModel.findOne({ slug }).lean();
  if (!existing) {
    return { error: "Recipe not found." };
  }

  if (parsed.slug !== slug) {
    const slugTaken = await RecipeModel.findOne({ slug: parsed.slug }).lean();
    if (slugTaken) {
      return { error: `A recipe with slug "${parsed.slug}" already exists.` };
    }
  }

  await RecipeModel.updateOne({ slug }, { $set: parsed });

  redirect(`/admin/recipes/${parsed.slug}/edit?saved=1`);
}
