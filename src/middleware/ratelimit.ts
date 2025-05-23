import type { Context, Next } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';
import { redis } from '@/lib/redis';
import { verifyJWT } from '@/utils/jwt';

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

/**
 * 🧹 Periodically cleans up expired entries from the in-memory rate limit store.
 * This helps prevent memory leaks in environments where Redis is unavailable.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 60_000); // Every 60 seconds

/**
 * Rate limiting middleware for Hono.
 * 
 * Applies request throttling based on user ID (via JWT) or IP address.
 * Supports Redis as the primary backend and falls back to in-memory store.
 * 
 * @param {number} limit - Maximum number of allowed requests per window.
 * @param {number} windowMs - Duration of the rate limit window in milliseconds.
 * @returns {Function} Middleware function to be used in Hono routes.
 */
export function rateLimitMiddleware(limit: number, windowMs: number) {
  /**
   * @param {Context} c - Hono request context.
   * @param {Next} next - Function to proceed to the next middleware or handler.
   */
  return async (c: Context, next: Next) => {
    const now = Date.now();

    // Extract IP address using connection info or headers
    const info = getConnInfo(c);
    const rawIp =
      info.remote?.address ||
      c.req.header('x-forwarded-for') ||
      c.req.header('cf-connecting-ip') ||
      'unknown';
    const ip = rawIp.split(',')[0].trim();

    // Try to extract user ID from JWT token, if provided
    let userId: string | null = null;
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      try {
        const payload = await verifyJWT(token);
        if (payload && typeof payload.userId === 'string') {
          userId = payload.userId;
          c.set('userId', userId); // Optional: share userId downstream
        }
      } catch {
        // Invalid token — fall back to IP-based limiting
      }
    }

    // Create a unique key for the requester based on route + user or IP
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    const routeKey = c.req.path;
    const redisKey = `ratelimit:${identifier}:${routeKey}`;

    try {
      let count = 0;
      let ttl = windowMs;

      if (redis.isReady) {
        // Primary store: Redis
        count = await redis.incr(redisKey);
        if (count === 1) await redis.pExpire(redisKey, windowMs);
        ttl = await redis.pTTL(redisKey);
      } else {
        // Fallback: In-memory store
        const entry = memoryStore.get(redisKey);
        if (entry && entry.expiresAt > now) {
          count = ++entry.count;
        } else {
          count = 1;
          memoryStore.set(redisKey, { count: 1, expiresAt: now + windowMs });
        }
        ttl = memoryStore.get(redisKey)?.expiresAt! - now;
      }

      if (count > limit) {
        return c.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
          },
          429
        );
      }

      // Optional: Provide rate limit info in headers
      c.header('X-RateLimit-Limit', String(limit));
      c.header('X-RateLimit-Remaining', String(Math.max(0, limit - count)));
      c.header('X-RateLimit-Reset', String(Math.floor((now + ttl) / 1000))); // UTC seconds

      await next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  };
}
