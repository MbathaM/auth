import { Hono } from "hono";
import { session } from "./get-session";
import { register } from "./register";
import { login } from "./login";
import { verify } from "./verify";
import { forgotPassword } from "./forgot-password";
import { resetPassword } from "./reset-password";
export const authRoutes = new Hono().basePath("/auth")
    .route("/", session)
    .route("/", register)
    .route("/", login)
    .route("/", verify)
    .route("/", forgotPassword)
    .route("/", resetPassword);
