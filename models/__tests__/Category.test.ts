import { describe, expect, it } from "vitest";
import type mongoose from "mongoose";
import CategoryModel from "../Category";

async function validationErrors(data: Record<string, unknown>) {
  try {
    await new CategoryModel(data).validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("Category schema", () => {
  it("accepts a valid document", async () => {
    const errors = await validationErrors({
      name: "Networking",
      slug: "networking",
    });
    expect(errors).toBeUndefined();
  });

  it("requires name and slug", async () => {
    const errors = await validationErrors({});
    expect(errors?.errors.name).toBeDefined();
    expect(errors?.errors.slug).toBeDefined();
  });
});
