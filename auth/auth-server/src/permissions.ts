import { createAccessControl } from "better-auth/plugins/access";

const statements = {
  users: ["read", "write", "invite", "delete"],
  apps: ["read", "write", "admin"],
  roles: ["read", "write", "assign"],
  sync: ["read", "trigger"],
} as const;

export const ac = createAccessControl(statements);

export const globalRoles = {
  "super-admin": ac.newRole({
    users: ["read", "write", "invite", "delete"],
    apps: ["read", "write", "admin"],
    roles: ["read", "write", "assign"],
    sync: ["read", "trigger"],
  }),
  "support": ac.newRole({
    users: ["read", "invite"],
    apps: ["read"],
    roles: ["read"],
    sync: ["read"],
  }),
};

/**
 * Built-in roles for the auth service's own admin UI.
 * Per-app roles for other apps live in the app_role_definitions table.
 */
export const roles = {
  admin: ac.newRole({
    users: ["read", "write", "invite"],
    apps: ["read", "write", "admin"],
    roles: ["read", "write", "assign"],
  }),
  editor: ac.newRole({
    users: ["read"],
    apps: ["read"],
  }),
  viewer: ac.newRole({
    users: ["read"],
  }),
  user: ac.newRole({}),
};

export type Role = keyof typeof roles;
