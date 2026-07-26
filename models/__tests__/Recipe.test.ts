import { describe, expect, it } from "vitest";
import type mongoose from "mongoose";
import RecipeModel from "../Recipe";

async function validationErrors(data: Record<string, unknown>) {
  try {
    await new RecipeModel(data).validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("Recipe schema", () => {
  it("accepts a valid document", async () => {
    const errors = await validationErrors({
      slug: "delete-old-files",
      title: "Delete files older than a week",
      description: "Finds and removes stale files in the current directory.",
      shellSnippet: "find . -mtime +7 -delete",
      commandsUsed: ["find"],
    });
    expect(errors).toBeUndefined();
  });

  it("requires slug, title, description, and shellSnippet", async () => {
    const errors = await validationErrors({});
    expect(errors?.errors.slug).toBeDefined();
    expect(errors?.errors.title).toBeDefined();
    expect(errors?.errors.description).toBeDefined();
    expect(errors?.errors.shellSnippet).toBeDefined();
  });

  it("rejects an invalid difficulty value", async () => {
    const errors = await validationErrors({
      slug: "delete-old-files",
      title: "Delete files older than a week",
      description: "Finds and removes stale files in the current directory.",
      shellSnippet: "find . -mtime +7 -delete",
      difficulty: "wizard",
    });
    expect(errors?.errors.difficulty).toBeDefined();
  });
});
