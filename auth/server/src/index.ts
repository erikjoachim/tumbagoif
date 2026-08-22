import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./auth";
import { env } from "./env";

const app = new Hono();

app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = 3000;
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Tumba Identity auth server running at ${env.BETTER_AUTH_URL} (port ${info.port})`);
  },
);
