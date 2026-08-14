import { Hono } from "hono";
import {
  createGlobalRoleSchema,
  assignGlobalRoleSchema,
  revokeGlobalRoleSchema,
} from "@tumbagoif/auth-shared";
import { createGlobalRole, listGlobalRoles, deleteGlobalRole, getGlobalRole } from "./create";
import { assignGlobalRole, revokeGlobalRole, listGlobalRolesForUser } from "./assign";
import type { DepsEnv } from "../../http";
import { parseBody } from "../../http";

const app = new Hono<DepsEnv>();

app.get("/", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listGlobalRoles(db));
});

app.post("/", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, createGlobalRoleSchema);
  return c.json(await createGlobalRole(db, input), 201);
});

app.get("/:id", async (c) => {
  const { db } = c.var.deps;
  return c.json(await getGlobalRole(db, c.req.param("id")));
});

app.delete("/:id", async (c) => {
  const { db } = c.var.deps;
  await deleteGlobalRole(db, c.req.param("id"));
  return c.body(null, 204);
});

app.get("/users/:userOid/assignments", async (c) => {
  const { db } = c.var.deps;
  return c.json(await listGlobalRolesForUser(db, c.req.param("userOid")));
});

app.post("/assign", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, assignGlobalRoleSchema);
  return c.json(
    await assignGlobalRole(db, { ...input, grantedBy: c.get("callerOid") ?? undefined }),
    201,
  );
});

app.delete("/assign", async (c) => {
  const { db } = c.var.deps;
  const input = await parseBody(c, revokeGlobalRoleSchema);
  await revokeGlobalRole(db, input.userOid, input.roleId);
  return c.body(null, 204);
});

export default app;