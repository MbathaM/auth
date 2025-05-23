// src/routes/auth/index.ts
import { Hono } from 'hono';
import { session } from './get-session';
import { login } from './login';
import { verify } from './verify';
import { forgotPassword } from './forgot-password';
import { resetPassword } from './reset-password';
import { rateLimitMiddleware } from '@/middleware/ratelimit';
import { signup } from './signup';

export const authRoutes = new Hono().basePath('/auth');

// Route-specific rate limiting
authRoutes.use('/forgot-password', rateLimitMiddleware(5, 10 * 60 * 1000)); // 5 per 10 min
authRoutes.use('/reset-password', rateLimitMiddleware(10, 5 * 60 * 1000)); // 10 per 5 min
authRoutes.use('/signup', rateLimitMiddleware(10, 10 * 60 * 1000)); // prevent spam signups
authRoutes.use('/login', rateLimitMiddleware(30, 60 * 1000)); // prevent brute force
authRoutes.use('*', rateLimitMiddleware(100, 60 * 1000)); // fallback for all others

authRoutes
  .route('/', session)
  .route('/', signup)
  .route('/', login)
  .route('/', verify)
  .route('/', forgotPassword)
  .route('/', resetPassword);
