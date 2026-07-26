import { describe, expect, it } from "vitest";
import type mongoose from "mongoose";
import CommandSuggestionModel from "../CommandSuggestion";

async function validationErrors(data: Record<string, unknown>) {
  try {
    await new CommandSuggestionModel(data).validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("CommandSuggestion schema", () => {
  it("accepts a minimal valid document", async () => {
    const errors = await validationErrors({
      name: "bat",
      description: "A cat clone with syntax highlighting.",
    });
    expect(errors).toBeUndefined();
  });

  it("requires name and description", async () => {
    const errors = await validationErrors({});
    expect(errors?.errors.name).toBeDefined();
    expect(errors?.errors.description).toBeDefined();
  });

  it("defaults status to pending", async () => {
    const doc = new CommandSuggestionModel({
      name: "bat",
      description: "A cat clone with syntax highlighting.",
    });
    expect(doc.status).toBe("pending");
  });

  it("rejects an invalid status", async () => {
    const errors = await validationErrors({
      name: "bat",
      description: "A cat clone with syntax highlighting.",
      status: "spam",
    });
    expect(errors?.errors.status).toBeDefined();
  });
});
