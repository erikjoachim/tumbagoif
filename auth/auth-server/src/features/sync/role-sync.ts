import type { Database } from "../../db";
import { oidByAuthUser } from "../../db/oid";
import type { DirectoryRole, GraphApi } from "./types";
import { upsertUser } from "./user-sync";

/**
 * Read Entra directory roles and their members, then upsert each member into
 * the users table so role-synced users exist locally.
 */
export async function syncEntraRoles(
  db: Database,
  graph: Pick<GraphApi, "listRoleMembers">,
  roles: DirectoryRole[],
  tenantId: string,
): Promise<number> {
  let count = 0;
  for (const role of roles) {
    const { members } = await graph.listRoleMembers(role.id);
    for (const member of members) {
      await upsertUser(db, member as any, tenantId);
      count += 1;
    }
  }
  return count;
}

/**
 * Map the Microsoft oid for a better-auth session user during an invitation
 * acceptance. Returns null when no Entra-linked account exists.
 */
export async function resolveOidForAuthUser(
  db: Database,
  authUserId: string,
): Promise<string | null> {
  return oidByAuthUser(db, authUserId);
}