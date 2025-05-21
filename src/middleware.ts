import { Context, Next } from 'hono';
import { verifyJwt, getTokenFromRequest, getUserById } from './utils';

/**
 * Authentication middleware
 * Verifies the access token and sets the user in the context
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = getTokenFromRequest(c, 'access');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const payload = await verifyJwt<{ userId: number }>(token);
  if (!payload || !payload.userId) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Get user from database
  const user = await getUserById(payload.userId);
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Set user in context
  c.set('user', user);
  await next();
}

/**
 * Optional authentication middleware
 * Tries to verify the token but continues even if no token is provided
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token = getTokenFromRequest(c, 'access');
  if (token) {
    const payload = await verifyJwt<{ userId: number }>(token);
    if (payload && payload.userId) {
      const user = await getUserById(payload.userId);
      if (user) {
        c.set('user', user);
      }
    }
  }
  await next();
}

/**
 * Rate limiting middleware
 * Simple in-memory rate limiting
 * For production, use Redis or another distributed cache
 */
const ipRequests: Record<string, { count: number; resetTime: number }> = {};

export function rateLimitMiddleware(limit: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    // Initialize or reset if window has passed
    if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
      ipRequests[ip] = { count: 0, resetTime: now + windowMs };
    }
    
    // Increment request count
    ipRequests[ip].count++;
    
    // Check if over limit
    if (ipRequests[ip].count > limit) {
      return c.json({
        error: 'Too many requests',
        message: 'Please try again later',
      }, 429);
    }
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - ipRequests[ip].count)));
    c.header('X-RateLimit-Reset', String(ipRequests[ip].resetTime));
    
    await next();
  };
}

/**
 * CORS middleware configuration
 */
export const corsConfig = {
  origin: (origin: string) => {
    // In production, you would check against allowed origins
    // For development, allow all origins
    return origin || '*';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
};