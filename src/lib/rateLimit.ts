import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting bucket store per IP/Identifier
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired buckets periodically
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpired() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Checks if a request exceeds rate limits.
 * Default: 30 requests per minute per IP for sensitive payment actions.
 */
export function checkRateLimit(
  request: NextRequest,
  options: {
    limit?: number;
    windowSeconds?: number;
    identifier?: string;
  } = {}
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  purgeExpired();

  const limit = options.limit || 30;
  const windowMs = (options.windowSeconds || 60) * 1000;

  // Extract client IP or identifier
  const ip =
    options.identifier ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);

  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds,
  };
}

/**
 * Helper to generate 429 Too Many Requests response with RateLimit headers.
 */
export function rateLimitResponse(resetInSeconds: number): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again shortly.",
      retryAfterSeconds: resetInSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(resetInSeconds),
      },
    }
  );
}
