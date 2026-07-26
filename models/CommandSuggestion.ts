import { Schema, model, models, type InferSchemaType } from "mongoose";

const commandSuggestionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    rationaleText: { type: String, default: "" },
    submittedByName: { type: String, default: "" },
    submittedByContact: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: String, default: "" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

export type CommandSuggestion = InferSchemaType<typeof commandSuggestionSchema>;

export default models.CommandSuggestion ?? model("CommandSuggestion", commandSuggestionSchema);
