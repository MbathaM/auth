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