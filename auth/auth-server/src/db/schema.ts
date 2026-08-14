import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Custom domain tables.
 *
 * The user table is keyed by the Microsoft object ID (oid) — the stable
 * identifier across Entra and the auth service.
 */
export const users = pgTable(
  "users",
  {
    oid: text("oid").primaryKey(),
    tid: text("tid").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    type: text("type").notNull().default("member"),
    photoUrl: text("photo_url"),
    entraSynced: boolean("entra_synced").notNull().default(false),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index("idx_users_email").on(t.email), index("idx_users_tid").on(t.tid)],
);

export const apps = pgTable(
  "apps",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    clientId: text("client_id").notNull(),
    callbackUrls: text("callback_urls").array().notNull().default(sql`'{}'`),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [uniqueIndex("ux_apps_name").on(t.name), uniqueIndex("ux_apps_client_id").on(t.clientId)],
);

export const globalRoles = pgTable(
  "global_roles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    permissions: jsonb("permissions").notNull().default(sql`'[]'`).$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [uniqueIndex("ux_global_roles_name").on(t.name)],
);

export const userGlobalRoles = pgTable(
  "user_global_roles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userOid: text("user_oid")
      .notNull()
      .references(() => users.oid, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => globalRoles.id, { onDelete: "cascade" }),
    grantedBy: text("granted_by").references(() => users.oid),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("ux_user_global_roles").on(t.userOid, t.roleId),
    index("idx_user_global_roles_user").on(t.userOid),
  ],
);

export const appRoleDefinitions = pgTable(
  "app_role_definitions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    permissions: jsonb("permissions").notNull().default(sql`'[]'`).$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("ux_app_role_def").on(t.appId, t.name),
    index("idx_app_role_def_app").on(t.appId),
  ],
);

export const userAppRoles = pgTable(
  "user_app_roles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("ux_user_app_roles").on(t.userOid, t.appId, t.roleId),
    index("idx_user_app_roles_user").on(t.userOid),
    index("idx_user_app_roles_app").on(t.appId),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id),
    role: text("role").notNull(),
    invitedBy: text("invited_by").notNull(),
    token: text("token").notNull(),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex("ux_invitations_token").on(t.token),
    index("idx_invitations_email").on(t.email),
  ],
);

export const syncLog = pgTable("sync_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  syncType: text("sync_type").notNull(),
  status: text("status").notNull(),
  usersSynced: integer("users_synced").notNull().default(0),
  errorDetail: text("error_detail"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/**
 * Persisted sync state (e.g. last Graph delta link for delta sync).
 */
export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Per-app API keys. Stored hashed; shown in plain only once at creation.
 */
export const appApiKeys = pgTable(
  "app_api_keys",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    name: text("name"),
    keyHash: text("key_hash").notNull(),
    lastFour: text("last_four").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (t) => [index("idx_app_api_keys_app").on(t.appId), uniqueIndex("ux_app_api_keys_hash").on(t.keyHash)],
);

/**
 * Better-auth core tables. Required by the drizzle adapter — do not redefine
 * elsewhere. Field names are mapped to better-auth's expectations.
 */
export const authUsers = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [uniqueIndex("ux_auth_user_email").on(t.email)],
);

export const authSessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
});

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index("idx_auth_account_user").on(t.userId), index("idx_auth_account_provider").on(t.providerId)],
);

export const authVerifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index("idx_auth_verification_identifier").on(t.identifier)],
);

/**
 * Many-to-many join table for the Admin plugin.
 */
export const authMembers = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [primaryKey({ columns: [t.organizationId, t.userId] })],
);
