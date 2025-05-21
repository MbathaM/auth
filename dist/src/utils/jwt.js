// src/utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export const createJwt = async (payload, expiresIn = "1h") => await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
export const verifyJWT = async (token) => {
    const { payload } = await jwtVerify(token, secret);
    return payload;
};
