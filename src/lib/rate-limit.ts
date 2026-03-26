import { NextRequest, NextResponse } from "next/server";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 100,
  refillRate: 100,
  refillIntervalMs: 60 * 1000,
};

const buckets = new Map<string, TokenBucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;
  const staleThreshold = now - 2 * DEFAULT_CONFIG.refillIntervalMs;

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

function refillBucket(
  bucket: TokenBucket,
  now: number,
  config: RateLimitConfig
): void {
  const elapsed = now - bucket.lastRefill;

  if (elapsed >= config.refillIntervalMs) {
    const intervals = Math.floor(elapsed / config.refillIntervalMs);
    const tokensToAdd = intervals * config.refillRate;
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = bucket.lastRefill + intervals * config.refillIntervalMs;
  }
}

function consumeToken(ip: string, config: RateLimitConfig): boolean {
  const now = Date.now();

  cleanupStaleBuckets(now);

  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = {
      tokens: config.maxTokens - 1,
      lastRefill: now,
    };
    buckets.set(ip, bucket);
    return true;
  }

  refillBucket(bucket, now, config);

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

export function getRemainingTokens(ip: string, config?: Partial<RateLimitConfig>): number {
  const mergedConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };
  const bucket = buckets.get(ip);

  if (!bucket) {
    return mergedConfig.maxTokens;
  }

  const now = Date.now();
  const elapsed = now - bucket.lastRefill;

  if (elapsed >= mergedConfig.refillIntervalMs) {
    const intervals = Math.floor(elapsed / mergedConfig.refillIntervalMs);
    const tokensToAdd = intervals * mergedConfig.refillRate;
    return Math.min(mergedConfig.maxTokens, bucket.tokens + tokensToAdd);
  }

  return bucket.tokens;
}

export function rateLimitMiddleware(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): NextResponse | null {
  const mergedConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };
  const ip = getClientIp(request);
  const allowed = consumeToken(ip, mergedConfig);

  if (!allowed) {
    const retryAfterSeconds = Math.ceil(mergedConfig.refillIntervalMs / 1000);

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
          "X-RateLimit-Limit": String(mergedConfig.maxTokens),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

export function resetRateLimits(): void {
  buckets.clear();
}