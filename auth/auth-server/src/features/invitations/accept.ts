import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { upsertUser } from "../sync/user-sync";
import type { EntraUser } from "../sync/types";

export interface AcceptContext {
  /** Microsoft object id (oid) of the authenticated user. */
  oid: string;
  email: string;
  name: string | null;
  type?: "member" | "guest";
  tenantId: string;
}

/**
 * Handle acceptance on the user's first login (Microsoft callback).
 * Matches pending invitations by email, creates the local user, assigns the
 * invited app role, and marks the invitation accepted.
 */
export async function handleAcceptance(db: Database, ctx: AcceptContext): Promise<number> {
  const pending = await db.query.invitations.findMany({
    where: and(
      eq(schema.invitations.email, ctx.email),
      eq(schema.invitations.status, "pending"),
    ),
  });

  if (pending.length > 0) {
    const active = pending.filter((i) => i.expiresAt > new Date());
    if (active.length === 0) {
      for (const i of pending) {
        await db
          .update(schema.invitations)
          .set({ status: "expired" })
          .where(eq(schema.invitations.id, i.id));
      }
      return 0;
    }

    const entraUser: EntraUser = {
      id: ctx.oid,
      mail: ctx.email,
      userPrincipalName: ctx.email,
      displayName: ctx.name,
      userType: ctx.type === "guest" ? "Guest" : "Member",
      tenantId: ctx.tenantId,
    };
    await upsertUser(db, entraUser, ctx.tenantId);

    for (const invite of active) {
      const app = await db.query.apps.findFirst({ where: eq(schema.apps.id, invite.appId) });
      if (!app) continue;
      const role = await db.query.appRoleDefinitions.findFirst({
        where: and(
          eq(schema.appRoleDefinitions.appId, invite.appId),
          eq(schema.appRoleDefinitions.name, invite.role),
        ),
      });
      if (!role) continue;

      await db
        .insert(schema.userAppRoles)
        .values({ userOid: ctx.oid, appId: invite.appId, roleId: role.id, grantedBy: invite.invitedBy })
        .onConflictDoNothing();

      await db
        .update(schema.invitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(schema.invitations.id, invite.id));
    }

    return active.length;
  }

  return 0;
}