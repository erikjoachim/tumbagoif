import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { NotFoundError } from "../../shared/errors";
import { assertUserExists, getGlobalRole } from "./create";
import type { AssignGlobalRoleInput, GlobalRoleAssignmentRow } from "./types";

export async function assignGlobalRole(
  db: Database,
  input: AssignGlobalRoleInput,
): Promise<GlobalRoleAssignmentRow> {
  await assertUserExists(db, input.userOid);
  const role = await getGlobalRole(db, input.roleId);

  const existing = await db.query.userGlobalRoles.findFirst({
    where: and(
      eq(schema.userGlobalRoles.userOid, input.userOid),
      eq(schema.userGlobalRoles.roleId, input.roleId),
    ),
  });
  if (existing) {
    return {
      userOid: input.userOid,
      roleName: role.name,
      grantedBy: existing.grantedBy,
      grantedAt: existing.grantedAt,
    };
  }

  const [row] = await db
    .insert(schema.userGlobalRoles)
    .values({
      userOid: input.userOid,
      roleId: input.roleId,
      grantedBy: input.grantedBy ?? null,
    })
    .returning();

  return {
    userOid: row.userOid,
    roleName: role.name,
    grantedBy: row.grantedBy,
    grantedAt: row.grantedAt,
  };
}

export async function revokeGlobalRole(
  db: Database,
  userOid: string,
  roleId: string,
): Promise<void> {
  const result = await db
    .delete(schema.userGlobalRoles)
    .where(
      and(
        eq(schema.userGlobalRoles.userOid, userOid),
        eq(schema.userGlobalRoles.roleId, roleId),
      ),
    );
  if (result.rowCount === 0) {
    throw new NotFoundError(`Assignment not found`);
  }
}

export async function listGlobalRolesForUser(
  db: Database,
  userOid: string,
): Promise<GlobalRoleAssignmentRow[]> {
  const rows = await db
    .select({
      userOid: schema.userGlobalRoles.userOid,
      roleName: schema.globalRoles.name,
      grantedBy: schema.userGlobalRoles.grantedBy,
      grantedAt: schema.userGlobalRoles.grantedAt,
    })
    .from(schema.userGlobalRoles)
    .innerJoin(schema.globalRoles, eq(schema.globalRoles.id, schema.userGlobalRoles.roleId))
    .where(eq(schema.userGlobalRoles.userOid, userOid));

  return rows.map((r) => ({
    userOid: r.userOid,
    roleName: r.roleName,
    grantedBy: r.grantedBy,
    grantedAt: r.grantedAt,
  }));
}