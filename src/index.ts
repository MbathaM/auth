import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { authRoutes } from "@/routes/auth";
import { publicRoutes } from "@/routes/public";
import { corsConfig } from "@/config/cors";

const port = process.env.PORT || 3000;
const app = new Hono();

export const customLogger = (message: string, ...rest: string[]) => {
  console.log(message, ...rest);
};

// CSRF middleware
app.use('*', csrf());

// CORS middleware
app.use('*', cors(corsConfig));

// Logger middleware
app.use(logger());

// Compression middleware
app.use("*", compress());

// Pretty JSON middleware
app.use("*", prettyJSON());

app.route("/api", authRoutes).route("/", publicRoutes);

app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: port as number,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
