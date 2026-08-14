import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import type { EntraUser } from "./types";

export interface UserSyncResult {
  created: number;
  updated: number;
}

/**
 * Upsert a user from Entra graph data into the users table. Returns whether the
 * row was created (true) or updated (false).
 */
export async function upsertUser(
  db: Database,
  entra: EntraUser,
  tenantId: string,
): Promise<boolean> {
  const email = entra.mail ?? entra.userPrincipalName;
  const existing = await db.query.users.findFirst({ where: eq(schema.users.oid, entra.id) });

  const values = {
    tid: tenantId,
    email,
    name: entra.displayName,
    type: (entra.userType === "Guest" ? "guest" : "member") as "member" | "guest",
    entraSynced: true,
    lastSyncAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(schema.users).set(values).where(eq(schema.users.oid, entra.id));
    return false;
  }

  await db
    .insert(schema.users)
    .values({ oid: entra.id, ...values })
    .onConflictDoNothing();
  return true;
}

export async function upsertUsers(
  db: Database,
  tenantId: string,
  users: EntraUser[],
): Promise<UserSyncResult> {
  const result: UserSyncResult = { created: 0, updated: 0 };
  for (const u of users) {
    const created = await upsertUser(db, u, tenantId);
    result.created += created ? 1 : 0;
    result.updated += created ? 0 : 1;
  }
  return result;
}