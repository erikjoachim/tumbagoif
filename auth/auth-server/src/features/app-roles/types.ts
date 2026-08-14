export interface AppRoleDefinitionRow {
  id: string;
  appId: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface CreateAppRoleInput {
  appId: string;
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface AssignAppRoleInput {
  userOid: string;
  roleId: string;
  grantedBy?: string;
}

export interface AppRoleAssignmentRow {
  userOid: string;
  appName: string;
  roleName: string;
  grantedBy: string | null;
  grantedAt: Date;
}

export interface JwtAppClaim {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}