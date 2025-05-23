import { Hono } from "hono";
import { home } from "./home";

export const publicRoutes = new Hono()
.route("/", home)
