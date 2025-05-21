import { Hono } from "hono";
import { hello } from "./hello";
export const publicRoutes = new Hono()
    .route("/", hello);
