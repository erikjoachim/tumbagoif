export const GLOBAL_ROLE_NAMES = ["super-admin", "support"] as const;
export type GlobalRoleName = (typeof GLOBAL_ROLE_NAMES)[number];

export const SUPER_ADMIN = "super-admin";
export const SUPPORT = "support";

export const DEFAULT_USER_TYPE = "member";

export const API_KEY_PREFIX = "tumba_";

export const DEFAULT_JWT_EXPIRATION = "1h";

export const INVITATION_TTL_DAYS = 7;

/**
 * Microsoft Entra directory role TemplateIDs (Free tier supported).
 * Used to map Entra directory roles onto users during role-sync.
 */
export const ENTRA_ROLE_TEMPLATE_IDS = {
  GlobalAdministrator: "62e90394-69f5-4237-9190-012177145e10",
  UserAdministrator: "fe930be7-5e59-4874-aef6-23ce07b4ac90",
  AuthenticationAdministrator: "c4e39bd9-1100-46d3-8c65-fb160da0071f",
} as const;

export const ENTRA_ROLE_NAMES = {
  [ENTRA_ROLE_TEMPLATE_IDS.GlobalAdministrator]: "Global Administrator",
  [ENTRA_ROLE_TEMPLATE_IDS.UserAdministrator]: "User Administrator",
  [ENTRA_ROLE_TEMPLATE_IDS.AuthenticationAdministrator]: "Authentication Administrator",
} as const;