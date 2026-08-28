import {
  pgTable,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Internal user dataset mirrored from Entra ID.
 * Keyed by Microsoft object ID (oid) — the stable identifier across Entra and this service.
 */
export const users = pgTable(
  "users",
  {
    oid: text("oid").primaryKey(),
    tid: text("tid").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    /** 'member' | 'guest' — guest when token tid differs from our tenant */
    type: text("type").notNull(),
    photoUrl: text("photo_url"),
    /** Better-auth user id (link to auth service's own user table) */
    authUserId: text("auth_user_id"),
    entraSynced: boolean("entra_synced").default(false).notNull(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_users_email").on(t.email), index("idx_users_tid").on(t.tid)],
);

/** Registered applications. First-class entities, not string constants. */
export const apps = pgTable("apps", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  /** Used as JWT audience / OIDC client_id */
  clientId: text("client_id").notNull().unique(),
  callbackUrls: text("callback_urls").array(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Global roles apply to ALL apps (e.g. super-admin, support). */
export const globalRoles = pgTable("global_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userGlobalRoles = pgTable(
  "user_global_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userOid: text("user_oid")
      .notNull()
      .references(() => users.oid, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => globalRoles.id, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => users.oid),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_user_global_roles_user").on(t.userOid),
    unique("uq_user_global_role").on(t.userOid, t.roleId),
  ],
);

/** Per-app role definitions. Each app owns its own role set. */
export const appRoleDefinitions = pgTable(
  "app_role_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_app_role_def_app").on(t.appId),
    unique("uq_app_role_name").on(t.appId, t.name),
  ],
);

/** User ↔ app ↔ role assignments. */
export const userAppRoles = pgTable(
  "user_app_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userOid: text("user_oid")
      .notNull()
      .references(() => users.oid, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => appRoleDefinitions.id, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => users.oid),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_user_app_roles_user").on(t.userOid),
    index("idx_user_app_roles_app").on(t.appId),
    unique("uq_user_app_role").on(t.userOid, t.appId, t.roleId),
  ],
);

/** Invitation tracking: email → app → role → status. */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => appRoleDefinitions.id),
    invitedBy: text("invited_by").notNull(),
    token: text("token").notNull().unique(),
    /** 'pending' | 'accepted' | 'expired' | 'revoked' */
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_invitations_email").on(t.email), index("idx_invitations_token").on(t.token)],
);

/** Graph API sync log — audit trail for sync operations. */
export const syncLog = pgTable("sync_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** 'delta' | 'on_demand' | 'invitation' */
  syncType: text("sync_type").notNull(),
  /** 'success' | 'error' */
  status: text("status").notNull(),
  usersSynced: integer("users_synced").default(0).notNull(),
  errorDetail: text("error_detail"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
