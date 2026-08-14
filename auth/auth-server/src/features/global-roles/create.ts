import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { ConflictError, NotFoundError } from "../../shared/errors";
import type { CreateGlobalRoleInput, GlobalRoleRow } from "./types";

export async function createGlobalRole(
  db: Database,
  input: CreateGlobalRoleInput,
): Promise<GlobalRoleRow> {
  const existing = await db.query.globalRoles.findFirst({
    where: eq(schema.globalRoles.name, input.name),
  });
  if (existing) {
    throw new ConflictError(`Global role '${input.name}' already exists`);
  }

  const [row] = await db
    .insert(schema.globalRoles)
    .values({
      name: input.name,
      description: input.description ?? null,
      permissions: input.permissions,
    })
    .returning();

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
  };
}

export async function listGlobalRoles(db: Database): Promise<GlobalRoleRow[]> {
  const rows = await db.query.globalRoles.findMany({
    orderBy: (g, { asc }) => [asc(g.name)],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: r.permissions,
  }));
}

export async function getGlobalRole(db: Database, roleId: string): Promise<GlobalRoleRow> {
  const row = await db.query.globalRoles.findFirst({ where: eq(schema.globalRoles.id, roleId) });
  if (!row) throw new NotFoundError(`Global role ${roleId} not found`);
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
  };
}

export async function deleteGlobalRole(db: Database, roleId: string): Promise<void> {
  const result = await db.delete(schema.globalRoles).where(eq(schema.globalRoles.id, roleId));
  if (result.rowCount === 0) throw new NotFoundError(`Global role ${roleId} not found`);
}

export async function assertUserExists(db: Database, userOid: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(schema.users.oid, userOid) });
  if (!user) {
    throw new NotFoundError(`User ${userOid} not found`);
  }
}

export async function isRoleAssigned(db: Database, userOid: string, roleId: string): Promise<boolean> {
  const row = await db.query.userGlobalRoles.findFirst({
    where: and(
      eq(schema.userGlobalRoles.userOid, userOid),
      eq(schema.userGlobalRoles.roleId, roleId),
    ),
  });
  return Boolean(row);
}