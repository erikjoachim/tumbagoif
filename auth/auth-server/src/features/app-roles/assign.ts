import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { NotFoundError } from "../../shared/errors";
import { assertUserExists } from "../global-roles/create";
import { getAppRole } from "./create";
import type { AppRoleAssignmentRow, AssignAppRoleInput } from "./types";

export async function assignAppRole(
  db: Database,
  input: AssignAppRoleInput,
): Promise<AppRoleAssignmentRow> {
  await assertUserExists(db, input.userOid);
  const role = await getAppRole(db, input.roleId);
  const app = await db.query.apps.findFirst({ where: eq(schema.apps.id, role.appId) });
  if (!app) throw new NotFoundError(`App ${role.appId} not found`);

  const existing = await db.query.userAppRoles.findFirst({
    where: and(
      eq(schema.userAppRoles.userOid, input.userOid),
      eq(schema.userAppRoles.roleId, input.roleId),
    ),
  });
  if (existing) {
    return {
      userOid: input.userOid,
      appName: app.name,
      roleName: role.name,
      grantedBy: existing.grantedBy,
      grantedAt: existing.grantedAt,
    };
  }

  const [row] = await db
    .insert(schema.userAppRoles)
    .values({
      userOid: input.userOid,
      appId: role.appId,
      roleId: input.roleId,
      grantedBy: input.grantedBy ?? null,
    })
    .returning();

  return {
    userOid: row.userOid,
    appName: app.name,
    roleName: role.name,
    grantedBy: row.grantedBy,
    grantedAt: row.grantedAt,
  };
}

export async function revokeAppRole(db: Database, userOid: string, roleId: string): Promise<void> {
  const result = await db
    .delete(schema.userAppRoles)
    .where(
      and(
        eq(schema.userAppRoles.userOid, userOid),
        eq(schema.userAppRoles.roleId, roleId),
      ),
    );
  if (result.rowCount === 0) throw new NotFoundError(`Assignment not found`);
}

export async function listAppRolesForUser(db: Database, userOid: string): Promise<AppRoleAssignmentRow[]> {
  const rows = await db
    .select({
      userOid: schema.userAppRoles.userOid,
      appName: schema.apps.name,
      roleName: schema.appRoleDefinitions.name,
      grantedBy: schema.userAppRoles.grantedBy,
      grantedAt: schema.userAppRoles.grantedAt,
    })
    .from(schema.userAppRoles)
    .innerJoin(schema.apps, eq(schema.apps.id, schema.userAppRoles.appId))
    .innerJoin(schema.appRoleDefinitions, eq(schema.appRoleDefinitions.id, schema.userAppRoles.roleId))
    .where(eq(schema.userAppRoles.userOid, userOid));

  return rows.map((r) => ({
    userOid: r.userOid,
    appName: r.appName,
    roleName: r.roleName,
    grantedBy: r.grantedBy,
    grantedAt: r.grantedAt,
  }));
}