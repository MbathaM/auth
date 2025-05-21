
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import 'dotenv/config';

// Import routes
import auth from './routes/auth';
import oauth from './routes/oauth';
import tokens from './routes/tokens';

// Import utilities
import { verifyJwt, getTokenFromRequest } from './utils';
import { siteConfig } from './config/site';
import { authMiddleware, rateLimitMiddleware } from './middleware';

// Protected route example

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors(corsConfig));

// Apply rate limiting to auth routes
app.use('/auth/*', rateLimitMiddleware(100, 60 * 1000)); // 100 requests per minute

// Health check route
app.get('/', (c) => c.json({ 
  name: siteConfig.name,
  version: '1.0.0',
  status: 'ok',
  message: 'Auth server is running' 
}));

// Mount routes
app.route('/auth', auth);
app.route('/auth', oauth);
app.route('/auth/tokens', tokens);

// Protected route example

app.get('/protected', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({ message: 'This is a protected route', user });
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 8787;

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Auth server is running on http://localhost:${info.port}`);
});