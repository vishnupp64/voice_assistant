/**
 * In-memory sliding window rate limiter.
 * 
 * NOTE ON PRODUCTION DEPLOYMENTS:
 * This in-memory implementation operates on a per-instance / per-worker basis.
 * In a multi-instance serverless or cluster deployment (e.g. Vercel edge/serverless functions, Kubernetes),
 * rate limits are local to each container/process. For distributed enforcement across multiple regions or nodes,
 * swap this store with Redis (e.g. Upstash Redis, AWS ElastiCache) or an API Gateway rate limiter.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale entries periodically every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipStore.forEach((value, key) => {
      if (value.resetAt < now) {
        ipStore.delete(key);
      }
    });
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = ipStore.get(identifier);

  if (!record || record.resetAt <= now) {
    ipStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

export function resetRateLimitForTesting(): void {
  ipStore.clear();
}
