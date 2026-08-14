export interface GlobalRoleRow {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface CreateGlobalRoleInput {
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface AssignGlobalRoleInput {
  userOid: string;
  roleId: string;
  grantedBy?: string;
}

export interface GlobalRoleAssignmentRow {
  userOid: string;
  roleName: string;
  grantedBy: string | null;
  grantedAt: Date;
}
