import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import type { Ratelimit as RatelimitType } from "@upstash/ratelimit";

// Shared Redis client (singleton)
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * LLM rate limiter: 10 requests per minute per IP.
 * Applied to: /api/sessions/[id]/answers and /api/sessions (POST) endpoints.
 * This directly protects the NVIDIA API key from being burned.
 */
export const llmRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ia:llm",
});

/**
 * Auth rate limiter: 5 requests per minute per IP.
 * Applied to: /api/auth/register and NextAuth signIn endpoint.
 * Prevents brute-force and credential stuffing attacks.
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ia:auth",
});

/**
 * Helper to apply rate limiting in a route handler.
 * Returns a 429 NextResponse if the limit is exceeded, or null if allowed.
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: RatelimitType
): Promise<NextResponse | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const { success, limit, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before trying again.",
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  return null; // Allowed — proceed with handler
}
