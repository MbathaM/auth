import type { Context, Next } from 'hono';
import { getConnInfo } from "@hono/node-server/conninfo";
import { valkey } from '@/lib/valkey';

export function rateLimitMiddleware(limit: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    // const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
    const info = getConnInfo(c);
    const ip = info.remote.address || c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
    const key = `ratelimit:${ip}`;

    try {
      // Increment and get current count
      const count = await valkey.incr(key);

      // If this is the first request, set expiration
      if (count === 1) {
        await valkey.pExpire(key, windowMs); // expire in ms
      }

      const ttl = await valkey.pTTL(key); // time to live in ms

      // Check limitb 
      if (count > limit) {
        return c.json(
          {
            error: 'Too many requests',
            message: 'Please try again later',
          },
          429
        );
      }

      // Set rate limit headers
      c.header('X-RateLimit-Limit', String(limit));
      c.header('X-RateLimit-Remaining', String(Math.max(0, limit - count)));
      c.header('X-RateLimit-Reset', String(Date.now() + Number(ttl)));

      await next();
    } catch (error) {
      console.error('Rate limiter valkey error:', error);
      return c.json(
        {
          error: 'Internal server error',
          message: 'Could not apply rate limiting',
        },
        500
      );
    }
  };
}
