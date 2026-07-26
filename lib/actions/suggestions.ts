"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";
import CommandSuggestionModel from "@/models/CommandSuggestion";

export type SuggestionActionState = { error?: string; success?: boolean };

// Basic, honest spam mitigation — no external CAPTCHA service (that needs its
// own account/keys, out of scope here). Two cheap signals: a honeypot field
// real users never see or fill, and a minimum time-on-page before a
// submission is even plausible from a human. Neither stops a determined bot;
// both stop the low-effort ones, which are the overwhelming majority.
const MIN_SUBMIT_TIME_MS = 2000;

export async function submitSuggestion(
  _prevState: SuggestionActionState,
  formData: FormData,
): Promise<SuggestionActionState> {
  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);

  if (isRateLimited(`suggest:${clientIp}`, { windowMs: 10 * 60_000, maxRequests: 5 })) {
    return { error: "Too many suggestions from this network — try again later." };
  }

  // Honeypot: a field named to look legitimate to a bot, hidden from real users via CSS.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { success: true };
  }

  const renderedAt = Number(formData.get("formRenderedAt") ?? 0);
  if (!renderedAt || Date.now() - renderedAt < MIN_SUBMIT_TIME_MS) {
    return { success: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Command name is required." };
  if (!description) return { error: "Description is required." };

  await connectToDatabase();

  await CommandSuggestionModel.create({
    name,
    description,
    rationaleText: String(formData.get("rationaleText") ?? "").trim(),
    submittedByName: String(formData.get("submittedByName") ?? "").trim(),
    submittedByContact: String(formData.get("submittedByContact") ?? "").trim(),
    status: "pending",
  });

  return { success: true };
}

export async function reviewSuggestion(id: string, status: "approved" | "rejected"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await connectToDatabase();

  await CommandSuggestionModel.updateOne(
    { _id: id },
    {
      $set: {
        status,
        reviewedBy: session.user.login ?? session.user.name ?? "unknown",
        reviewedAt: new Date(),
      },
    },
  );
}
