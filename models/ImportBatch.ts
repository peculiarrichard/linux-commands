import { Schema, model, models, type InferSchemaType } from "mongoose";

const importErrorSchema = new Schema(
  {
    row: { type: Number, required: true },
    message: { type: String, required: true },
  },
  { _id: false },
);

const importBatchSchema = new Schema(
  {
    fileName: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: Date.now },
    rowsTotal: { type: Number, required: true },
    rowsCreated: { type: Number, required: true },
    rowsUpdated: { type: Number, required: true },
    rowsFailed: { type: Number, required: true },
    rowErrors: { type: [importErrorSchema], default: [] },
  },
  { timestamps: true },
);

export type ImportBatch = InferSchemaType<typeof importBatchSchema>;

export default models.ImportBatch ?? model("ImportBatch", importBatchSchema);
