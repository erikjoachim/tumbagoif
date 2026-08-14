import { env, type Env } from "./env";
import type { GraphApi } from "./features/sync/types";
import { createGraphAdapter } from "./features/sync/graph-adapter";

export async function createGraph(cfg?: Env): Promise<{ graph: GraphApi; close: () => Promise<void> }> {
  const c = cfg ?? env;
  const hasCreds = Boolean(
    c.AZURE_TENANT_ID && c.AZURE_CLIENT_ID && c.AZURE_CLIENT_SECRET,
  );

  if (!hasCreds) {
    return {
      graph: unavailableGraph("Azure credentials not configured"),
      close: async () => {},
    };
  }

  const { createGraphClient } = await import("./features/sync/graph-client");
  const client = await createGraphClient(c);
  return {
    graph: createGraphAdapter(client),
    close: async () => {},
  };
}

function unavailableGraph(reason: string): GraphApi {
  const fail = () => {
    throw new Error(`Graph API unavailable: ${reason}`);
  };
  return {
    listUsersDelta: fail,
    listRoleMembers: fail,
    createInvitation: fail,
  };
}