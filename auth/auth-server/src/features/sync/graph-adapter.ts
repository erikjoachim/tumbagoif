import type { Client } from "@microsoft/microsoft-graph-client";
import type { DeltaResult, DirectoryRole, EntraUser, EntraInvitation, GraphApi } from "./types";

/**
 * Adapts the Microsoft Graph client to the GraphApi interface used by feature
 * logic. Keeps business logic free of SDK-specific types.
 */
export function createGraphAdapter(client: Client): GraphApi {
  return {
    async listUsersDelta(deltaToken?: string): Promise<DeltaResult> {
      const url = deltaToken ? `/users/delta?$deltaToken=${encodeURIComponent(deltaToken)}` : "/users/delta";
      const res = await client.api(url).get();
      const users: EntraUser[] = (res.value ?? []).map((u: Record<string, unknown>) => ({
        id: String(u.id),
        mail: u.mail ? String(u.mail) : null,
        userPrincipalName: String(u.userPrincipalName),
        displayName: u.displayName ? String(u.displayName) : null,
        userType: u.userType ? String(u.userType) : null,
        tenantId: u.tenantId ? String(u.tenantId) : null,
      }));
      return {
        users,
        nextDeltaLink: res["@odata.deltaLink"] ?? null,
        isInitial: !deltaToken,
      };
    },

    async listRoleMembers(roleId: string): Promise<{ role: DirectoryRole; members: Array<{ id: string }> }> {
      const roleRes = await client.api(`/directoryRoles/${roleId}`).get();
      const memberRes = await client.api(`/directoryRoles/${roleId}/members`).get();
      const members = (memberRes.value ?? []).map((m: Record<string, unknown>) => ({ id: String(m.id) }));
      return {
        role: {
          id: String(roleRes.id),
          displayName: String(roleRes.displayName ?? ""),
          templateId: String(roleRes.roleTemplateId ?? ""),
          memberIds: members.map((m: { id: string }) => m.id),
        },
        members,
      };
    },

    async createInvitation(payload: {
      invitedUserEmailAddress: string;
      inviteRedirectUrl: string;
      sendInvitationMessage?: boolean;
    }): Promise<EntraInvitation> {
      const res = await client.api("/invitations").post(payload);
      return {
        invitedUser: { id: String(res.invitedUser.id) },
        inviteRedeemUrl: res.inviteRedeemUrl ? String(res.inviteRedeemUrl) : null,
      };
    },
  };
}