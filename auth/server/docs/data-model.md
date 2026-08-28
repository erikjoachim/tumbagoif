# Data Model (as implemented today)

## Overview

Two table groups live in the same database:

1. **Better-auth core tables** — created/managed by `better-auth migrate`, camelCase columns. Do not edit by hand.
2. **Custom tables** — defined in `src/db/schema.ts`, snake_case columns, migrated with drizzle.

Only `users` is actively written today (on MS sign-in). The role/app/invitation/sync tables exist in schema and are migrated but not yet used by any code.

## Better-auth core tables (auto-managed)

| Table | Purpose | Key columns |
|---|---|---|
| `user` | Auth user account | `id` (nanoid string), `email`, `name`, `createdAt` |
| `account` | Linked OAuth provider account | `providerId` (`microsoft`), `accountId` (= `oid`), `userId`, `idToken`, `accessToken` |
| `session` | Login sessions | `userId`, `expiresAt`, `ipAddress`, `userAgent` |
| `verification` | OAuth/verification transient data | `identifier`, `value`, `expiresAt` |

**Important**: better-auth user `id` is a nanoid string like `rC2etUWtdMT9U8RAt2XtVoYAwkOVCMQv` — **not** a UUID. Any column storing it must be `text`.

## Custom tables (Drizzle)

### users — internal user mirror

Keyed by Microsoft object ID (`oid`). This is the "internal dataset of users" used to administer permissions later.

| Column | Type | Notes |
|---|---|---|
| `oid` | text PK | Microsoft object ID — stable across Entra + this service |
| `tid` | text | Tenant id from token. `type` is derived from this |
| `email` | text | from id_token claim |
| `name` | text | from id_token claim |
| `type` | text | `member` \| `guest` — guest when `tid !== MICROSOFT_TENANT_ID` |
| `photo_url` | text | reserved (not populated yet) |
| `auth_user_id` | text | link to better-auth `user.id` (nanoid) |
| `entra_synced` | boolean | reserved for graph sync (default `false`) |
| `last_sync_at` | timestamptz | reserved for graph sync |
| `created_at` / `updated_at` | timestamptz | managed |

Indexes: `idx_users_email`, `idx_users_tid`.

### apps — registered applications

| Column | Notes |
|---|---|
| `id` | uuid PK |
| `name` | unique, e.g. `cms` |
| `display_name` | e.g. "Tumba CMS" |
| `description` | |
| `client_id` | unique; later used as JWT audience / OIDC client id |
| `callback_urls` | text[] allowed OAuth redirects |
| `enabled` | boolean default true |

### global_roles + user_global_roles

- `global_roles`: cross-app roles (e.g. `super-admin`). `permissions` is `jsonb string[]`.
- `user_global_roles`: assignment join — `user_oid → users.oid`, `role_id → global_roles.id`, `granted_by`, `granted_at`. Unique `(user_oid, role_id)`.

### app_role_definitions + user_app_roles

- `app_role_definitions`: per-app roles. `app_id → apps.id`, `name`, `permissions jsonb`. Unique `(app_id, name)`.
- `user_app_roles`: assignment join — `user_oid`, `app_id`, `role_id → app_role_definitions.id`, `granted_by`, `granted_at`. Unique `(user_oid, app_id, role_id)`.

### invitations

`email`, `app_id`, `role_id`, `invited_by`, `token` (unique), `status` (`pending`/`accepted`/`expired`/`revoked`), `expires_at`, `accepted_at`.

### sync_log

Audit trail for future Entra sync: `sync_type`, `status`, `users_synced`, `error_detail`, `started_at`, `completed_at`.

## Schema relationships

```
users ──┬── user_global_roles ── global_roles
        ├── user_app_roles ──┬── apps
        │                    └── app_role_definitions ── apps
        ├── invitations ── apps
        └── (auth_user_id) ── better-auth user.id   [text, no FK]
```

## Migration workflow

- Better-auth tables: `npm run auth:migrate` (applies directly, interactive confirm).
- Custom tables: edit `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate`.
- Committed migrations live in `drizzle/` (snapshots in `drizzle/meta/`).