import type { GraphApi, DeltaResult, EntraUser } from "./types";

/**
 * Fetch users changed since last sync using Graph delta query. When no token
 * is present, performs an initial full enumeration and returns the delta link.
 */
export async function runDeltaQuery(graph: Pick<GraphApi, "listUsersDelta">, deltaToken?: string): Promise<DeltaResult> {
  const result: DeltaResult = {
    users: [],
    nextDeltaLink: null,
    isInitial: !deltaToken,
  };

  let token: string | undefined = deltaToken;
  let hasMore = true;
  let guard = 0;

  while (hasMore && guard < 500) {
    const page = await graph.listUsersDelta(token);
    result.users.push(...normalizeUsers(page.users));
    result.nextDeltaLink = page.nextDeltaLink;

    token = page.nextDeltaLink ?? undefined;
    hasMore = Boolean(page.nextDeltaLink);
    guard += 1;
  }

  return result;
}

function normalizeUsers(users: EntraUser[]): EntraUser[] {
  return users.map((u) => ({
    id: u.id,
    mail: u.mail ?? null,
    userPrincipalName: u.userPrincipalName,
    displayName: u.displayName ?? null,
    userType: (u.userType ?? "member") as EntraUser["userType"],
    tenantId: u.tenantId ?? null,
  }));
}