import { connectToDatabase } from "@/lib/db";
import CommandSuggestionModel from "@/models/CommandSuggestion";
import {
  DEFAULT_PAGE_SIZE,
  resolvePage,
  totalPagesFor,
  type PaginatedResult,
} from "@/lib/pagination";

export type AdminSuggestion = {
  id: string;
  name: string;
  description: string;
  rationaleText: string;
  submittedByName: string;
  submittedByContact: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string;
  reviewedAt: string | null;
  createdAt: string;
};

export async function listSuggestionsForAdmin(
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<AdminSuggestion>> {
  await connectToDatabase();

  const totalCount = await CommandSuggestionModel.countDocuments();
  const page = resolvePage(options.page);
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  const docs = await CommandSuggestionModel.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
    rationaleText: doc.rationaleText ?? "",
    submittedByName: doc.submittedByName ?? "",
    submittedByContact: doc.submittedByContact ?? "",
    status: doc.status as AdminSuggestion["status"],
    reviewedBy: doc.reviewedBy ?? "",
    reviewedAt: doc.reviewedAt ? (doc.reviewedAt as Date).toISOString() : null,
    createdAt: (doc.createdAt as Date).toISOString(),
  }));

  return { items, page, pageSize, totalCount, totalPages: totalPagesFor(totalCount, pageSize) };
}
