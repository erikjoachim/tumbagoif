import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { createTestDb } from "../test-db";
import { createApp } from "./apps/create";
import { createApiKey, verifyApiKey } from "./apps/api-keys";
import { createGlobalRole } from "./global-roles/create";
import { assignGlobalRole, listGlobalRolesForUser, revokeGlobalRole } from "./global-roles/assign";
import { createAppRole } from "./app-roles/create";
import { assignAppRole, listAppRolesForUser, revokeAppRole } from "./app-roles/assign";
import { inviteUser } from "./invitations/invite";
import { handleAcceptance } from "./invitations/accept";
import type { GraphApi } from "./sync/types";
import type { Database } from "../db";

let db: Database;

async function seedUser(oid: string, email = `${oid}@example.com`) {
  await db
    .insert(schema.users)
    .values({ oid, tid: "tenant", email, name: "Test User", type: "member" })
    .onConflictDoNothing();
}

beforeEach(async () => {
  const t = await createTestDb();
  db = t.db;
});

describe("apps", () => {
  it("creates an app with a generated client_id", async () => {
    const app = await createApp(db, {
      name: "cms",
      displayName: "Tumba CMS",
      callbackUrls: ["https://cms.tumba.se/callback"],
    });
    expect(app.name).toBe("cms");
    expect(app.clientId).toMatch(/^[0-9a-f-]{36}$/);

    const stored = await db.query.apps.findFirst({ where: eq(schema.apps.id, app.id) });
    expect(stored?.enabled).toBe(true);
  });

  it("rejects a duplicate app name", async () => {
    await createApp(db, { name: "cms", displayName: "A", callbackUrls: ["https://a.test"] });
    await expect(
      createApp(db, { name: "cms", displayName: "B", callbackUrls: ["https://b.test"] }),
    ).rejects.toThrow("already exists");
  });

  it("verifies a per-app API key and rejects unknown keys", async () => {
    const app = await createApp(db, {
      name: "portal",
      displayName: "Portal",
      callbackUrls: ["https://portal.tumba.se/cb"],
    });
    const { key } = await createApiKey(db, { appId: app.id, name: "ci" });
    expect(key.startsWith("tumba_")).toBe(true);

    expect(await createApp(db, { name: "portal2", displayName: "x", callbackUrls: [] }) as any).toBeTruthy();
    const clientId = await verifyApiKey(db, key);
    expect(clientId).toBe(app.clientId);
    expect(await verifyApiKey(db, "tumba_not-registered")).toBeNull();
  });
});

describe("global roles", () => {
  it("creates, assigns, lists and revokes a global role", async () => {
    const role = await createGlobalRole(db, { name: "support", permissions: ["users.read"] });
    await seedUser("user-1");

    const assigned = await assignGlobalRole(db, { userOid: "user-1", roleId: role.id, grantedBy: "creator" });
    expect(assigned.roleName).toBe("support");

    expect((await listGlobalRolesForUser(db, "user-1")).map((r) => r.roleName)).toEqual(["support"]);

    await revokeGlobalRole(db, "user-1", role.id);
    expect(await listGlobalRolesForUser(db, "user-1")).toHaveLength(0);
  });

  it("rejects assigning a role to a nonexistent user", async () => {
    const role = await createGlobalRole(db, { name: "support", permissions: [] });
    await expect(
      assignGlobalRole(db, { userOid: "ghost", roleId: role.id }),
    ).rejects.toThrow("not found");
  });
});

describe("app roles", () => {
  it("assigns, lists and revokes a scoped per-app role", async () => {
    const app = await createApp(db, { name: "cms", displayName: "CMS", callbackUrls: ["https://x.test"] });
    const role = await createAppRole(db, { appId: app.id, name: "editor", permissions: ["posts.create"] });
    await seedUser("user-a");

    await assignAppRole(db, { userOid: "user-a", roleId: role.id });
    const roles = await listAppRolesForUser(db, "user-a");
    expect(roles[0]).toMatchObject({ appName: "cms", roleName: "editor" });

    await revokeAppRole(db, "user-a", role.id);
    expect(await listAppRolesForUser(db, "user-a")).toHaveLength(0);
  });
});

describe("invitations", () => {
  const mockGraph: Pick<GraphApi, "createInvitation"> = {
    async createInvitation(payload) {
      expect(payload.invitedUserEmailAddress).toBe("invitee@example.com");
      return { invitedUser: { id: "oid-123" }, inviteRedeemUrl: "https://graph" };
    },
  };

  it("invites a user then assigns the role on first login", async () => {
    const app = await createApp(db, { name: "cms", displayName: "CMS", callbackUrls: ["https://x.test"] });
    const role = await createAppRole(db, { appId: app.id, name: "editor", permissions: [] });

    const invited = await inviteUser(db, mockGraph, {
      email: "invitee@example.com",
      appId: app.id,
      role: "editor",
      invitedBy: "inviter",
    });
    expect(invited.status).toBe("pending");

    const handled = await handleAcceptance(db, {
      oid: "oid-123",
      email: "invitee@example.com",
      name: "Invitee",
      type: "guest",
      tenantId: "tenant",
    });
    expect(handled).toBe(1);

    const stored = await db.query.invitations.findFirst({ where: eq(schema.invitations.id, invited.id) });
    expect(stored?.status).toBe("accepted");

    expect((await listAppRolesForUser(db, "oid-123")).map((r) => r.roleName)).toContain("editor");
  });

  it("does not touch users who log in without an invitation", async () => {
    const handled = await handleAcceptance(db, {
      oid: "nobody",
      email: "nobody@example.com",
      name: null,
      type: "member",
      tenantId: "tenant",
    });
    expect(handled).toBe(0);
    expect(await db.query.users.findFirst({ where: eq(schema.users.oid, "nobody") })).toBeUndefined();
  });
});