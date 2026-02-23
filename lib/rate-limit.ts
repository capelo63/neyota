/**
 * Simple in-memory rate limiter using a sliding window algorithm.
 *
 * ⚠️  Works per serverless function instance — does not share state across
 * concurrent Vercel function instances. Provides basic protection against
 * concentrated abuse from a single client hitting the same instance.
 * For production-grade rate limiting, consider Upstash + @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global Map — lives as long as the function instance is warm
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Check whether a request is within the allowed rate.
 *
 * @param identifier  IP address or other unique key
 * @param limit       Maximum requests allowed in the window
 * @param windowMs    Window duration in milliseconds
 * @returns `{ allowed: boolean; remaining: number; resetAt: number }`
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract the best-effort client IP from a Request (works on Vercel edge + Node).
 */
export function getClientIp(request: Request): string {
  const headers = request.headers as Headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? '0.0.0.0';
}
