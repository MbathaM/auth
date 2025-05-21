import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { authRoutes } from "./routes/auth";
import { publicRoutes } from "./routes/public";
const port = process.env.PORT || 3000;
const app = new Hono();
app.use("*", cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
}), logger(), prettyJSON(), compress(), csrf({
    origin: "*",
}));
app.route("/api", authRoutes).route("/", publicRoutes);
app.notFound((c) => {
    return c.json({ error: "Not Found" }, 404);
});
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal Server Error" }, 500);
});
serve({
    fetch: app.fetch,
    port: port,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
