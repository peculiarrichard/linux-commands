import { describe, expect, it } from "vitest";
import type mongoose from "mongoose";
import ImportBatchModel from "../ImportBatch";

async function validationErrors(data: Record<string, unknown>) {
  try {
    await new ImportBatchModel(data).validate();
    return undefined;
  } catch (err) {
    return err as mongoose.Error.ValidationError;
  }
}

describe("ImportBatch schema", () => {
  it("accepts a valid document", async () => {
    const errors = await validationErrors({
      fileName: "commands-batch-1.csv",
      uploadedBy: "octocat",
      rowsTotal: 10,
      rowsCreated: 8,
      rowsUpdated: 1,
      rowsFailed: 1,
      rowErrors: [{ row: 4, message: "Missing required field: description" }],
    });
    expect(errors).toBeUndefined();
  });

  it("requires fileName, uploadedBy, and row counts", async () => {
    const errors = await validationErrors({});
    expect(errors?.errors.fileName).toBeDefined();
    expect(errors?.errors.uploadedBy).toBeDefined();
    expect(errors?.errors.rowsTotal).toBeDefined();
    expect(errors?.errors.rowsCreated).toBeDefined();
    expect(errors?.errors.rowsUpdated).toBeDefined();
    expect(errors?.errors.rowsFailed).toBeDefined();
  });
});
