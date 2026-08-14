import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { ConflictError, NotFoundError } from "../../shared/errors";
import type { CreateAppRoleInput, AppRoleDefinitionRow } from "./types";

async function appExists(db: Database, appId: string): Promise<boolean> {
  const app = await db.query.apps.findFirst({ where: eq(schema.apps.id, appId) });
  return Boolean(app);
}

export async function createAppRole(
  db: Database,
  input: CreateAppRoleInput,
): Promise<AppRoleDefinitionRow> {
  if (!(await appExists(db, input.appId))) {
    throw new NotFoundError(`App ${input.appId} not found`);
  }

  const existing = await db.query.appRoleDefinitions.findFirst({
    where: and(
      eq(schema.appRoleDefinitions.appId, input.appId),
      eq(schema.appRoleDefinitions.name, input.name),
    ),
  });
  if (existing) {
    throw new ConflictError(`App role '${input.name}' already exists for app ${input.appId}`);
  }

  const [row] = await db
    .insert(schema.appRoleDefinitions)
    .values({
      appId: input.appId,
      name: input.name,
      description: input.description ?? null,
      permissions: input.permissions,
    })
    .returning();

  return mapRow(row);
}

export async function listAppRoles(db: Database, appId: string): Promise<AppRoleDefinitionRow[]> {
  const rows = await db.query.appRoleDefinitions.findMany({
    where: eq(schema.appRoleDefinitions.appId, appId),
    orderBy: (cols, { asc }) => [asc(cols.name)],
  });
  return rows.map(mapRow);
}

export async function getAppRole(db: Database, roleId: string): Promise<AppRoleDefinitionRow> {
  const row = await db.query.appRoleDefinitions.findFirst({
    where: eq(schema.appRoleDefinitions.id, roleId),
  });
  if (!row) throw new NotFoundError(`App role ${roleId} not found`);
  return mapRow(row);
}

export async function deleteAppRole(db: Database, roleId: string): Promise<void> {
  const result = await db.delete(schema.appRoleDefinitions).where(eq(schema.appRoleDefinitions.id, roleId));
  if (result.rowCount === 0) throw new NotFoundError(`App role ${roleId} not found`);
}

function mapRow(row: typeof schema.appRoleDefinitions.$inferSelect): AppRoleDefinitionRow {
  return {
    id: row.id,
    appId: row.appId,
    name: row.name,
    description: row.description,
    permissions: row.permissions,
  };
}