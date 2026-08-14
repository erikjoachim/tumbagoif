import { and, eq } from "drizzle-orm";
import type { Database } from "../db";
import * as schema from "../db/schema";

/**
 * Resolve a better-auth user id to the Microsoft oid.
 * better-auth keeps its own user table; the oid is stored on the linked
 * Microsoft account row. Used to map a logged-in user onto our users table.
 */
export async function oidByAuthUser(db: Database, authUserId: string): Promise<string | null> {
  const acct = await db.query.authAccounts.findFirst({
    where: and(
      eq(schema.authAccounts.userId, authUserId),
      eq(schema.authAccounts.providerId, "microsoft"),
    ),
  });
  return acct?.accountId ?? null;
}