import { Hono } from "hono";
import { session } from "./get-session";
import { register } from "./register";
import { login } from "./login";
import { verify } from "./verify";
import { forgotPassword } from "./forgot-password";
import { resetPassword } from "./reset-password";
import { rateLimitMiddleware } from "@/middleware/ratelimit";
import { signup } from "./signup";

export const authRoutes = new Hono().basePath("/auth")
.use('/api/auth/*', rateLimitMiddleware(100, 60 * 1000))
.route("/", session)
.route("/", register)
.route("/", signup)
.route("/", login)
.route("/", verify)
.route("/", forgotPassword)
.route("/", resetPassword)