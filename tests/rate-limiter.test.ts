import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitForTesting } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimitForTesting();
  });

  it('allows requests within limit threshold', () => {
    const ip = '192.168.1.100';
    const limit = 5;
    const windowMs = 5000;

    for (let i = 1; i <= limit; i++) {
      const res = checkRateLimit(ip, limit, windowMs);
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(limit - i);
    }
  });

  it('blocks requests once limit is exceeded and provides retryAfterSeconds', () => {
    const ip = '192.168.1.101';
    const limit = 3;
    const windowMs = 10000;

    // Exhaust quota
    for (let i = 0; i < limit; i++) {
      checkRateLimit(ip, limit, windowMs);
    }

    // Exceeding request
    const blockedRes = checkRateLimit(ip, limit, windowMs);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
    expect(blockedRes.retryAfterSeconds).toBeLessThanOrEqual(10);
  });
});
