import { Schema, model, models, type InferSchemaType } from "mongoose";

const recipeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shellSnippet: { type: String, required: true },
    commandsUsed: { type: [String], default: [] },
    useCaseTags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
  },
  { timestamps: true },
);

export type Recipe = InferSchemaType<typeof recipeSchema>;

export default models.Recipe ?? model("Recipe", recipeSchema);
