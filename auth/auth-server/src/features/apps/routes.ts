import { Hono } from "hono";
import { createApp, listApps, getApp, updateApp, deleteApp } from "./create";
import { createApiKey, listApiKeys, revokeApiKey } from "./api-keys";
import { createAppSchema, updateAppSchema, createApiKeySchema } from "@tumbagoif/auth-shared";
import type { DepsEnv } from "../../http";
import { parseBody } from "../../http";

const app = new Hono<DepsEnv>();

app.get("/", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listApps(db));
});

app.post("/", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, createAppSchema);
  return c.json(await createApp(db, input), 201);
});

app.get("/:id", async (c) => {
  const { db } = c.var.deps;
  return c.json(await getApp(db, c.req.param("id")));
});

app.patch("/:id", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, updateAppSchema);
  return c.json(await updateApp(db, c.req.param("id"), input));
});

app.delete("/:id", async (c) => {
  const { db } = c.var.deps;
  await deleteApp(db, c.req.param("id"));
  return c.body(null, 204);
});

app.get("/:id/api-keys", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listApiKeys(db, c.req.param("id")));
});

app.post("/:id/api-keys", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, createApiKeySchema);
  return c.json(await createApiKey(db, { appId: c.req.param("id"), configId: input.configId }), 201);
});

app.delete("/:id/api-keys/:keyId", async (c) => {
  const { db } = c.var.deps;
  await revokeApiKey(db, c.req.param("id"), c.req.param("keyId"));
  return c.body(null, 204);
});

export default app;