import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'hono/cookie';
import { Context } from 'hono';
import { randomBytes, createHash } from 'crypto';
import { applications, users } from './db/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { siteConfig } from './config/site';

// Constants
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const SESSION_COOKIE_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

// Secret key for JWT signing
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Generate a random token
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash a string (for comparing tokens)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Create a JWT access token
 */
export async function createAccessToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer(siteConfig.url)
    .sign(getJwtSecretKey());
}

/**
 * Create a JWT refresh token
 */
export async function createRefreshToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer(siteConfig.url)
    .sign(getJwtSecretKey());
}

/**
 * Verify a JWT token
 */
export async function verifyJwt<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as T;
  } catch (error) {
    return null;
  }
}

/**
 * Set an HTTP-only cookie with the access token
 */
export function setAccessTokenCookie(c: Context, token: string): void {
  cookies().set(c, 'access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_EXPIRY,
  });
}

/**
 * Set an HTTP-only cookie with the refresh token
 */
export function setRefreshTokenCookie(c: Context, token: string): void {
  cookies().set(c, 'refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_EXPIRY,
  });
}

/**
 * Clear auth cookies
 */
export function clearAuthCookies(c: Context): void {
  cookies().set(c, 'access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  cookies().set(c, 'refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Validate an application by client ID and secret
 */
export async function validateApplication(clientId: string, clientSecret: string) {
  const app = await db.query.applications.findFirst({
    where: eq(applications.clientId, clientId),
  });

  if (!app || app.clientSecret !== clientSecret) {
    return null;
  }

  return app;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

/**
 * Parse Authorization header
 */
export function parseAuthHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get token from request (either from cookies or Authorization header)
 */
export function getTokenFromRequest(c: Context, tokenType: 'access' | 'refresh'): string | null {
  // First try to get from cookies
  const cookieName = tokenType === 'access' ? 'access_token' : 'refresh_token';
  const tokenFromCookie = cookies().get(c, cookieName);
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Then try Authorization header
  const authHeader = c.req.header('Authorization');
  return parseAuthHeader(authHeader);
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate a numeric OTP code
 */
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
}