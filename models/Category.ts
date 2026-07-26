import { Schema, model, models, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export type Category = InferSchemaType<typeof categorySchema>;

export default models.Category ?? model("Category", categorySchema);
