export interface EntraUser {
  id: string;
  mail: string | null;
  userPrincipalName: string;
  displayName: string | null;
  userType: string | null;
  tenantId: string | null;
}

export interface DirectoryRoleMembership {
  directoryScopeId: string;
  roleTemplateId: string;
  displayName?: string;
}

export interface DeltaResult {
  users: EntraUser[];
  nextDeltaLink: string | null;
  isInitial: boolean;
}

export interface SyncRunResult {
  usersSynced: number;
  created: number;
  updated: number;
  nextDeltaLink: string | null;
}

export interface DirectoryRole {
  id: string;
  displayName: string;
  templateId: string;
  memberIds: string[];
}

export interface EntraInvitation {
  invitedUser: { id: string };
  inviteRedeemUrl?: string | null;
}

export interface GraphApi {
  listUsersDelta(deltaToken?: string): Promise<DeltaResult>;
  listRoleMembers(
    roleId: string,
  ): Promise<{ role: DirectoryRole; members: Array<{ id: string }> }>;
  createInvitation(payload: {
    invitedUserEmailAddress: string;
    inviteRedirectUrl: string;
    sendInvitationMessage?: boolean;
  }): Promise<EntraInvitation>;
}