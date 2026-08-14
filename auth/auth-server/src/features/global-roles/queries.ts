import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { oidByAuthUser } from "../../db/oid";

/**
 * Global role names for a better-auth user, resolved via their oid.
 * Used by the JWT plugin's definePayload.
 */
export async function getUserGlobalRoles(
  db: Database,
  authUserId: string,
): Promise<string[]> {
  const oid = await oidByAuthUser(db, authUserId);
  if (!oid) return [];

  const rows = await db
    .select({ name: schema.globalRoles.name })
    .from(schema.userGlobalRoles)
    .innerJoin(schema.globalRoles, eq(schema.globalRoles.id, schema.userGlobalRoles.roleId))
    .where(eq(schema.userGlobalRoles.userOid, oid));

  return rows.map((r) => r.name);
}