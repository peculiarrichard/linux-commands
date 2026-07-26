import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { listCategories } from "@/lib/queries/commands";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export async function GET(request: Request) {
  if (isRateLimited(getClientIp(request.headers))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const categories = await listCategories();
    return NextResponse.json(
      { data: categories, count: categories.length },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
