import { Hono } from "hono";
import { triggerSyncSchema } from "@tumbagoif/auth-shared";
import { env } from "../../env";
import type { DepsEnv } from "../../http";
import { parseBody } from "../../http";
import { runDeltaSync, getSyncLogs, getSyncState } from "./delta-sync-run";

const app = new Hono<DepsEnv>();

app.get("/status", async (c) => {
  const { db } = c.var.deps;
  return c.json(await getSyncState(db));
});

app.get("/logs", async (c) => {
  const { db } = c.var.deps;
  return c.json(await getSyncLogs(db));
});

app.post("/trigger", async (c) => {
  const { db, graph } = c.var.deps;
  await parseBody(c, triggerSyncSchema);
  const tenantId = env.AZURE_TENANT_ID ?? "";
  await runDeltaSync(db, graph, tenantId);
  return c.json({ ok: true });
});

export default app;