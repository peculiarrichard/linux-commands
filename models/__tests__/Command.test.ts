import { describe, expect, it } from "vitest";
import type mongoose from "mongoose";
import CommandModel from "../Command";

async function validationErrors(data: Record<string, unknown>) {
  try {
    await new CommandModel(data).validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("Command schema", () => {
  it("accepts a minimal valid document", async () => {
    const errors = await validationErrors({
      slug: "grep",
      name: "grep",
      description: "Searches for a pattern in a file.",
      submittedVia: "content-pr",
    });
    expect(errors).toBeUndefined();
  });

  it("requires slug, name, description, and submittedVia", async () => {
    const errors = await validationErrors({});
    expect(errors?.errors.slug).toBeDefined();
    expect(errors?.errors.name).toBeDefined();
    expect(errors?.errors.description).toBeDefined();
    expect(errors?.errors.submittedVia).toBeDefined();
  });

  it("rejects an invalid difficulty value", async () => {
    const errors = await validationErrors({
      slug: "grep",
      name: "grep",
      description: "Searches for a pattern in a file.",
      submittedVia: "content-pr",
      difficulty: "expert",
    });
    expect(errors?.errors.difficulty).toBeDefined();
  });

  it("rejects an invalid platform in platformNotes", async () => {
    const errors = await validationErrors({
      slug: "sed",
      name: "sed",
      description: "Stream editor.",
      submittedVia: "admin",
      platformNotes: [{ platform: "windows", notes: "n/a" }],
    });
    expect(errors?.errors["platformNotes.0.platform"]).toBeDefined();
  });

  it("requires flag and description on each option", async () => {
    const errors = await validationErrors({
      slug: "ls",
      name: "ls",
      description: "Lists directory contents.",
      submittedVia: "admin",
      options: [{ flag: "-l" }],
    });
    expect(errors?.errors["options.0.description"]).toBeDefined();
  });
});
