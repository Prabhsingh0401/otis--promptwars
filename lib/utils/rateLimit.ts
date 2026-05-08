// lib/utils/rateLimit.ts
// In-memory rate limiter for API routes
// For production scale, replace with Upstash Redis

interface RateLimitRecord {
  count:   number;
  resetAt: number;
}

// Module-level map persists across requests in the same server process
const requests = new Map<string, RateLimitRecord>();

/**
 * Check if an IP is within rate limits.
 * @param ip       - Client IP address
 * @param limit    - Max requests per window (default: 10)
 * @param windowMs - Time window in ms (default: 60s)
 * @returns true if request is allowed, false if rate-limited
 */
export function rateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const record = requests.get(ip);

  // New IP or expired window — reset
  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  // Over limit
  if (record.count >= limit) return false;

  record.count++;
  return true;
}

/**
 * Get remaining requests for an IP.
 */
export function getRemainingRequests(
  ip: string,
  limit = 10,
): { remaining: number; resetAt: number } {
  const record = requests.get(ip);
  if (!record || Date.now() > record.resetAt) {
    return { remaining: limit, resetAt: Date.now() + 60_000 };
  }
  return { remaining: Math.max(0, limit - record.count), resetAt: record.resetAt };
}
