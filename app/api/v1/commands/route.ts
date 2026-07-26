import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { listPublishedCommands } from "@/lib/queries/commands";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

// A positive integer from a query param, or undefined if absent/invalid —
// invalid input degrades to "no pagination" rather than a 400, since this is
// a public, cache-friendly read endpoint.
function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(request: Request) {
  if (isRateLimited(getClientIp(request.headers))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  // page/pageSize are opt-in: omit both and every published command comes
  // back in one response, unpaginated — the CommandPalette relies on this
  // for its client-side fuzzy search. Pass `page` to get a real page instead.
  const page = parsePositiveInt(searchParams.get("page"));
  const pageSize = parsePositiveInt(searchParams.get("pageSize"));

  try {
    const result = await listPublishedCommands({
      categorySlug: category,
      query: q,
      page,
      pageSize,
    });
    return NextResponse.json(
      {
        data: result.items,
        count: result.items.length,
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
