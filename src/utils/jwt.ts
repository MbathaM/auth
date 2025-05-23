import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Creates a signed JSON Web Token (JWT) using the HS256 algorithm.
 *
 * @param {JWTPayload} payload - The payload to include in the token (e.g., user ID, roles, etc.).
 * @param {string} [expiresIn='1h'] - Optional expiration time (e.g., '1h', '30m', '7d').
 * @returns {Promise<string>} The signed JWT as a string.
 *
 * @example
 * const token = await createJwt({ userId: '123' }, '2h');
 */
export const createJwt = async (payload: JWTPayload, expiresIn = '1h'): Promise<string> =>
  await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

/**
 * Verifies a JSON Web Token (JWT) and returns its decoded payload.
 *
 * @param {string} token - The JWT string to verify.
 * @returns {Promise<JWTPayload>} The decoded payload if the token is valid.
 * @throws Will throw an error if the token is invalid or expired.
 *
 * @example
 * const payload = await verifyJWT(token);
 * console.log(payload.userId);
 */
export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const { payload } = await jwtVerify(token, secret);
  return payload;
};
