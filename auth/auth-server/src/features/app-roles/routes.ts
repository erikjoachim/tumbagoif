import { Hono } from "hono";
import {
  createAppRoleSchema,
  assignAppRoleSchema,
  revokeAppRoleSchema,
} from "@tumbagoif/auth-shared";
import { createAppRole, listAppRoles, deleteAppRole, getAppRole } from "./create";
import { assignAppRole, revokeAppRole, listAppRolesForUser } from "./assign";
import type { DepsEnv } from "../../http";
import { parseBody } from "../../http";

const app = new Hono<DepsEnv>();

app.get("/apps/:appId/roles", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listAppRoles(db, c.req.param("appId")));
});

app.post("/apps/:appId/roles", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, createAppRoleSchema);
  return c.json(await createAppRole(db, input), 201);
});

app.get("/roles/:roleId", async (c) => {
  const { db } = c.var.deps;
  return c.json(await getAppRole(db, c.req.param("roleId")));
});

app.delete("/roles/:roleId", async (c) => {
  const { db } = c.var.deps;
  await deleteAppRole(db, c.req.param("roleId"));
  return c.body(null, 204);
});

app.get("/users/:userOid/app-roles", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listAppRolesForUser(db, c.req.param("userOid")));
});

app.post("/assign", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, assignAppRoleSchema);
  return c.json(
    await assignAppRole(db, { ...input, grantedBy: c.get("callerOid") ?? undefined }),
    201,
  );
});

app.delete("/assign", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, revokeAppRoleSchema);
  await revokeAppRole(db, input.userOid, input.roleId);
  return c.body(null, 204);
});

export default app;