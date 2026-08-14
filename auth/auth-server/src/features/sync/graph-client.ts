import { ClientSecretCredential } from "@azure/identity";
import {
  Client,
  type AuthenticationProvider,
  type AuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client";
import { env, type Env } from "../../env";

/**
 * Graph API requires client-credential (application) auth — managed identity
 * is NOT supported for application permissions. The token cache / refresh is
 * handled by @azure/identity.
 */
export async function createGraphClient(cfg?: Env): Promise<Client> {
  const c = cfg ?? env;
  const credential = new ClientSecretCredential(
    c.AZURE_TENANT_ID!,
    c.AZURE_CLIENT_ID!,
    c.AZURE_CLIENT_SECRET!,
  );

  const authProvider: AuthenticationProvider = {
    getAccessToken: async (
      providerOptions?: AuthenticationProviderOptions,
    ) => {
      const scope = providerOptions?.scopes?.[0] ?? "https://graph.microsoft.com/.default";
      const token = await credential.getToken(scope);
      return token.token;
    },
  };

  return Client.initWithMiddleware({ authProvider });
}

export async function listUsersDelta(client: Client, deltaToken?: string) {
  let url = "/users/delta";
  if (deltaToken) {
    url = `/users/delta?$deltaToken=${encodeURIComponent(deltaToken)}`;
  }
  const res = await client.api(url).get();
  return res;
}

export async function createGraphInvitation(
  client: Client,
  payload: {
    invitedUserEmailAddress: string;
    inviteRedirectUrl: string;
    sendInvitationMessage?: boolean;
  },
) {
  return client.api("/invitations").post(payload);
}

export async function listDirectoryRoles(client: Client): Promise<Array<Record<string, unknown>>> {
  const res = await client.api("/directoryRoles").get();
  return res.value;
}

export async function listRoleMembers(client: Client, roleId: string) {
  const res = await client.api(`/directoryRoles/${roleId}/members`).get();
  return res.value;
}