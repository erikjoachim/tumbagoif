import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { ConflictError, NotFoundError } from "../../shared/errors";

export interface AppRow {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  clientId: string;
  callbackUrls: string[];
  enabled: boolean;
}

export interface CreateAppInput {
  name: string;
  displayName: string;
  description?: string | null;
  callbackUrls: string[];
}

export interface UpdateAppInput {
  displayName?: string;
  description?: string | null;
  callbackUrls?: string[];
  enabled?: boolean;
}

export async function createApp(db: Database, input: CreateAppInput): Promise<AppRow> {
  const existing = await db.query.apps.findFirst({ where: eq(schema.apps.name, input.name) });
  if (existing) throw new ConflictError(`App '${input.name}' already exists`);

  const clientId = randomUUID();
  const [row] = await db
    .insert(schema.apps)
    .values({
      name: input.name,
      displayName: input.displayName,
      description: input.description ?? null,
      clientId,
      callbackUrls: input.callbackUrls,
    })
    .returning();

  return mapRow(row);
}

export async function listApps(db: Database): Promise<AppRow[]> {
  const rows = await db.query.apps.findMany({ orderBy: (cols, { asc }) => [asc(cols.name)] });
  return rows.map(mapRow);
}

export async function getApp(db: Database, appId: string): Promise<AppRow> {
  const row = await db.query.apps.findFirst({ where: eq(schema.apps.id, appId) });
  if (!row) throw new NotFoundError(`App ${appId} not found`);
  return mapRow(row);
}

export async function getAppByClientId(db: Database, clientId: string): Promise<AppRow> {
  const row = await db.query.apps.findFirst({ where: eq(schema.apps.clientId, clientId) });
  if (!row) throw new NotFoundError(`No app with client_id ${clientId}`);
  return mapRow(row);
}

export async function updateApp(db: Database, appId: string, input: UpdateAppInput): Promise<AppRow> {
  const existing = await getApp(db, appId);
  const [row] = await db
    .update(schema.apps)
    .set({
      displayName: input.displayName ?? existing.displayName,
      description: input.description !== undefined ? input.description : existing.description,
      callbackUrls: input.callbackUrls ?? existing.callbackUrls,
      enabled: input.enabled ?? existing.enabled,
    })
    .where(eq(schema.apps.id, appId))
    .returning();
  return mapRow(row);
}

export async function deleteApp(db: Database, appId: string): Promise<void> {
  const result = await db.delete(schema.apps).where(eq(schema.apps.id, appId));
  if (result.rowCount === 0) throw new NotFoundError(`App ${appId} not found`);
}

function mapRow(row: typeof schema.apps.$inferSelect): AppRow {
  return {
    id: row.id,
    name: row.name,
    displayName: row.displayName,
    description: row.description,
    clientId: row.clientId,
    callbackUrls: row.callbackUrls,
    enabled: row.enabled,
  };
}