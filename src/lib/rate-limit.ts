/**
 * Tiny in-memory fixed-window rate limiter for API routes. Per serverless
 * instance (good enough to blunt abuse / runaway clients). For multi-instance
 * hard limits use a shared store (Upstash/Redis) later.
 */
const buckets = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/** Best-effort client key from proxy headers. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anon").slice(0, 64);
}
