import { createDb } from "./db";
import { env } from "./env";
import { createApp } from "./app";
import { createGraph } from "./graph";
import { serve } from "@hono/node-server";

async function main() {
  const { db, pool } = await createDb(env);
  const { graph, close } = await createGraph();
  const app = createApp(db, graph);

  const server = serve({ fetch: app.fetch, port: env.PORT });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      await close();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`[auth] listening on ${env.PORT}`);
}

main().catch((err) => {
  console.error("[auth] fatal", err);
  process.exit(1);
});