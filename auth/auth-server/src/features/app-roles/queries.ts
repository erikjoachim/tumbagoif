import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { oidByAuthUser } from "../../db/oid";
import type { JwtAppClaim } from "./types";

/**
 * Per-app role claims for a better-auth user, resolved via their oid.
 * Only enabled apps are included. Each claim aggregates the user's roles and
 * the union of permissions across those roles.
 */
export async function getUserAppRoles(db: Database, authUserId: string): Promise<JwtAppClaim[]> {
  const oid = await oidByAuthUser(db, authUserId);
  if (!oid) return [];

  const assignments = await db
    .select({
      appId: schema.userAppRoles.appId,
      roleId: schema.userAppRoles.roleId,
      roleName: schema.appRoleDefinitions.name,
      permissions: schema.appRoleDefinitions.permissions,
      appName: schema.apps.name,
      appEnabled: schema.apps.enabled,
    })
    .from(schema.userAppRoles)
    .innerJoin(
      schema.appRoleDefinitions,
      eq(schema.appRoleDefinitions.id, schema.userAppRoles.roleId),
    )
    .innerJoin(schema.apps, eq(schema.apps.id, schema.userAppRoles.appId))
    .where(eq(schema.userAppRoles.userOid, oid));

  const apps = new Map<
    string,
    { name: string; enabled: boolean; roles: string[]; permissions: Set<string> }
  >();

  for (const a of assignments) {
    if (!apps.has(a.appId)) {
      apps.set(a.appId, {
        name: a.appName,
        enabled: a.appEnabled,
        roles: [],
        permissions: new Set(a.permissions),
      });
    }
    const entry = apps.get(a.appId)!;
    entry.roles.push(a.roleName);
    for (const p of a.permissions) entry.permissions.add(p);
  }

  const claims: JwtAppClaim[] = [];
  for (const [appId, meta] of apps) {
    if (!meta.enabled) continue;
    claims.push({
      id: appId,
      name: meta.name,
      roles: meta.roles,
      permissions: [...meta.permissions],
    });
  }

  return claims;
}