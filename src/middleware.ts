import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_MAX_TOKENS = 100;
const RATE_LIMIT_REFILL_RATE = 100;
const RATE_LIMIT_REFILL_INTERVAL_MS = 60 * 1000;

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;
  const staleThreshold = now - 2 * RATE_LIMIT_REFILL_INTERVAL_MS;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.lastRefill < staleThreshold) {
      buckets.delete(key);
    }
  }
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function refillBucket(bucket: TokenBucket, now: number): void {
  const elapsed = now - bucket.lastRefill;

  if (elapsed >= RATE_LIMIT_REFILL_INTERVAL_MS) {
    const intervals = Math.floor(elapsed / RATE_LIMIT_REFILL_INTERVAL_MS);
    const tokensToAdd = intervals * RATE_LIMIT_REFILL_RATE;
    bucket.tokens = Math.min(RATE_LIMIT_MAX_TOKENS, bucket.tokens + tokensToAdd);
    bucket.lastRefill = bucket.lastRefill + intervals * RATE_LIMIT_REFILL_INTERVAL_MS;
  }
}

function consumeToken(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  cleanupStaleBuckets(now);

  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = {
      tokens: RATE_LIMIT_MAX_TOKENS - 1,
      lastRefill: now,
    };
    buckets.set(ip, bucket);
    return { allowed: true, remaining: bucket.tokens };
  }

  refillBucket(bucket, now);

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true, remaining: bucket.tokens };
  }

  return { allowed: false, remaining: 0 };
}

export function middleware(request: NextRequest): NextResponse {
  const ip = getClientIp(request);
  const { allowed, remaining } = consumeToken(ip);

  if (!allowed) {
    const retryAfterSeconds = Math.ceil(RATE_LIMIT_REFILL_INTERVAL_MS / 1000);

    return NextResponse.json(
      {
        error: "Too Many Requests",
        details: {
          message: "Rate limit exceeded. Please try again later.",
          retryAfterSeconds,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_TOKENS),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_TOKENS));
  response.headers.set("X-RateLimit-Remaining", String(remaining));

  return response;
}

export const config = {
  matcher: "/api/:path*",
};