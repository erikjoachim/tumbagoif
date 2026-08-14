import { desc, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import type { GraphApi, SyncRunResult } from "./types";

const DELTA_TOKEN_KEY = "last_delta_link";

/**
 * Orchestrates a Graph delta sync: runs the delta query, upserts users,
 * records the log and persists the new delta link.
 */
export async function runDeltaSync(db: Database, graph: Pick<GraphApi, "listUsersDelta">, tenantId: string): Promise<SyncRunResult> {
  const [logRow] = await db
    .insert(schema.syncLog)
    .values({ syncType: "delta", status: "running", startedAt: new Date() })
    .returning();

  try {
    const previousToken = await getDelta(db);
    const delta = await graph.listUsersDelta(previousToken ?? undefined);

    let created = 0;
    let updated = 0;
    for (const user of delta.users) {
      const isNew = await upsertUserCount(db, user, tenantId);
      if (isNew) created++;
      else updated++;
    }

    if (delta.nextDeltaLink) {
      await setDelta(db, delta.nextDeltaLink);
    }

    await db
      .update(schema.syncLog)
      .set({ status: "success", usersSynced: delta.users.length, completedAt: new Date() })
      .where(eq(schema.syncLog.id, logRow.id));

    return {
      usersSynced: delta.users.length,
      created,
      updated,
      nextDeltaLink: delta.nextDeltaLink,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(schema.syncLog)
      .set({ status: "error", errorDetail: message, completedAt: new Date() })
      .where(eq(schema.syncLog.id, logRow.id));
    throw err;
  }
}

async function upsertUserCount(db: Database, user: any, tenantId: string): Promise<boolean> {
  const existing = await db.query.users.findFirst({ where: eq(schema.users.oid, user.id) });
  const email = user.mail ?? user.userPrincipalName;
  const values = {
    tid: tenantId,
    email,
    name: user.displayName ?? null,
    type: (user.userType === "Guest" ? "guest" : "member") as "member" | "guest",
    entraSynced: true,
    lastSyncAt: new Date(),
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(schema.users).set(values).where(eq(schema.users.oid, user.id));
    return false;
  }
  await db
    .insert(schema.users)
    .values({ oid: user.id, ...values })
    .onConflictDoNothing();
  return true;
}

async function getDelta(db: Database): Promise<string | null> {
  const row = await db.query.syncState.findFirst({ where: eq(schema.syncState.key, DELTA_TOKEN_KEY) });
  return row?.value ?? null;
}

async function setDelta(db: Database, value: string): Promise<void> {
  await db
    .insert(schema.syncState)
    .values({ key: DELTA_TOKEN_KEY, value })
    .onConflictDoUpdate({ target: schema.syncState.key, set: { value, updatedAt: new Date() } });
}

export async function getSyncLogs(db: Database, limit = 50) {
  return db.query.syncLog.findMany({
    orderBy: [desc(schema.syncLog.startedAt)],
    limit,
  });
}

export async function getSyncState(db: Database): Promise<{ deltaTokenSet: boolean; lastSyncAt: string | null }> {
  const delta = await getDelta(db);
  const last = await db.query.syncLog.findFirst({ orderBy: [desc(schema.syncLog.startedAt)] });
  return {
    deltaTokenSet: Boolean(delta),
    lastSyncAt: last?.completedAt?.toISOString() ?? null,
  };
}