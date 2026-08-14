import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { API_KEY_PREFIX } from "@tumbagoif/auth-shared";
import { NotFoundError } from "../../shared/errors";
import { getApp } from "./create";

export interface ApiKeyRow {
  id: string;
  name: string | null;
  prefix: string;
  enabled: boolean;
  createdAt: Date;
}

export interface CreateApiKeyInput {
  appId: string;
  configId?: string;
  name?: string;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function generateKey(): { full: string; hash: string; lastFour: string } {
  const suffix = randomBytes(24).toString("base64url");
  const full = `${API_KEY_PREFIX}${suffix}`;
  return { full, hash: sha256(full), lastFour: full.slice(-4) };
}

/**
 * Create an API key for an app. Returns the plaintext key exactly once.
 */
export async function createApiKey(
  db: Database,
  input: CreateApiKeyInput,
): Promise<{ key: string; row: ApiKeyRow }> {
  await getApp(db, input.appId);
  const { full, hash, lastFour } = generateKey();

  const [row] = await db
    .insert(schema.appApiKeys)
    .values({
      appId: input.appId,
      name: input.name ?? null,
      keyHash: hash,
      lastFour,
    })
    .returning();

  return {
    key: full,
    row: {
      id: row.id,
      name: row.name,
      prefix: API_KEY_PREFIX,
      enabled: row.enabled,
      createdAt: row.createdAt,
    },
  };
}

export async function listApiKeys(db: Database, appId: string): Promise<ApiKeyRow[]> {
  const rows = await db.query.appApiKeys.findMany({
    where: eq(schema.appApiKeys.appId, appId),
    orderBy: (cols, { desc }) => [desc(cols.createdAt)],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    prefix: API_KEY_PREFIX,
    enabled: r.enabled,
    createdAt: r.createdAt,
  }));
}

export async function revokeApiKey(db: Database, appId: string, keyId: string): Promise<void> {
  const result = await db
    .delete(schema.appApiKeys)
    .where(and(eq(schema.appApiKeys.id, keyId), eq(schema.appApiKeys.appId, appId)));
  if (result.rowCount === 0) throw new NotFoundError(`API key ${keyId} not found`);
}

/**
 * Verify a presented key belongs to an enabled app. Returns the app's
 * client_id if valid, else null.
 */
export async function verifyApiKey(db: Database, presented: string): Promise<string | null> {
  if (!presented.startsWith(API_KEY_PREFIX)) return null;
  const hash = sha256(presented);
  const row = await db.query.appApiKeys.findFirst({
    where: eq(schema.appApiKeys.keyHash, hash),
  });
  if (!row || !row.enabled) return null;

  const app = await db.query.apps.findFirst({ where: eq(schema.apps.id, row.appId) });
  if (!app || !app.enabled) return null;

  await db
    .update(schema.appApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.appApiKeys.id, row.id));

  return app.clientId;
}