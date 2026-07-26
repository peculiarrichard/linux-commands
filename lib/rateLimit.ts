const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;

// In-memory only — resets on every cold start and isn't shared across
// serverless instances, so this is a best-effort local safeguard, not real
// protection in a multi-instance deployment. A shared store (e.g. Upstash
// Redis) is the real follow-up once this is under actual public load.
const requestTimestamps = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  options: { windowMs?: number; maxRequests?: number } = {},
): boolean {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const now = Date.now();
  const recent = (requestTimestamps.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  requestTimestamps.set(key, recent);
  return recent.length > maxRequests;
}

// Accepts anything Headers-shaped: Request.headers in a Route Handler, or the
// return value of next/headers' headers() inside a Server Action.
export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
