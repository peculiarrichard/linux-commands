import { Schema, model, models, type InferSchemaType } from "mongoose";

const optionSchema = new Schema(
  {
    flag: { type: String, required: true, trim: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const exampleSchema = new Schema(
  {
    command: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

const platformNoteSchema = new Schema(
  {
    platform: { type: String, enum: ["gnu", "bsd", "macos", "busybox"], required: true },
    notes: { type: String, required: true },
  },
  { _id: false },
);

const revisionSchema = new Schema(
  {
    changedBy: { type: String, required: true },
    changedAt: { type: Date, required: true, default: Date.now },
    diffSummary: { type: String, required: true },
  },
  { _id: false },
);

const commandSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    aliases: { type: [String], default: [] },
    description: { type: String, required: true },
    rationale: {
      text: { type: String, default: "" },
      sources: { type: [String], default: [] },
    },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    options: { type: [optionSchema], default: [] },
    examples: { type: [exampleSchema], default: [] },
    platformNotes: { type: [platformNoteSchema], default: [] },
    relatedCommands: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
    submittedVia: { type: String, enum: ["admin", "content-pr"], required: true },
    revisionHistory: { type: [revisionSchema], default: [] },
  },
  { timestamps: true },
);

commandSchema.index({ name: "text", description: "text", aliases: "text" });

export type Command = InferSchemaType<typeof commandSchema>;

export default models.Command ?? model("Command", commandSchema);
