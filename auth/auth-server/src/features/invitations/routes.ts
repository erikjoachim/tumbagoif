import { Hono } from "hono";
import { inviteUserSchema } from "@tumbagoif/auth-shared";
import type { DepsEnv } from "../../http";
import { parseBody } from "../../http";
import { inviteUser, listInvitations } from "./invite";

const app = new Hono<DepsEnv>();

app.post("/", async (c) => {
  const { db, graph } = c.var.deps;
  const input = await parseBody(c, inviteUserSchema);
  const invitedBy = c.get("callerOid") ?? "system";
  return c.json(await inviteUser(db, graph, { ...input, invitedBy }), 201);
});

app.get("/", async (c) => {
  const { db } = c.var.deps;
  const status = c.req.query("status");
  return c.json(await listInvitations(db, status));
});

export default app;