import { NextResponse } from "next/server";
import { DatabaseNotConfiguredError } from "@/lib/db";
import { getCommandBySlug } from "@/lib/queries/commands";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (isRateLimited(getClientIp(request.headers))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { slug } = await params;

  try {
    const command = await getCommandBySlug(slug);
    if (!command) {
      return NextResponse.json({ error: "Command not found." }, { status: 404 });
    }
    return NextResponse.json(
      { data: command },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: "Database not configured." }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
