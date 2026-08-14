export type UserType = "member" | "guest";

export interface User {
  oid: string;
  tid: string;
  email: string;
  name: string | null;
  type: UserType;
  photoUrl: string | null;
  entraSynced: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface App {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  clientId: string;
  callbackUrls: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
}

export interface GlobalRoleAssignment {
  userOid: string;
  roleName: string;
  grantedBy: string | null;
  grantedAt: Date;
}

export interface AppRoleDefinition {
  id: string;
  appId: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: Date;
}

export interface AppRoleAssignment {
  userOid: string;
  appName: string;
  roleName: string;
  grantedBy: string | null;
  grantedAt: Date;
}

export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Invitation {
  id: string;
  email: string;
  appId: string;
  role: string;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export type SyncType = "delta" | "on_demand" | "invitation";
export type SyncStatus = "success" | "error";

export interface SyncLog {
  id: string;
  syncType: SyncType;
  status: SyncStatus;
  usersSynced: number;
  errorDetail: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface JwtAppClaim {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string | null;
  type: UserType;
  aud: string;
  global_roles: string[];
  apps: JwtAppClaim[];
  iss: string;
  exp: number;
  iat: number;
}
