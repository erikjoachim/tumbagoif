# Tumba Auth Service — Project Brief

## What This Is

A centralized auth service for Tumba's ecosystem of apps (CMS, portal, standalone apps). It extends Microsoft Entra ID with custom per-app RBAC that Entra Free tier doesn't support natively.

**Core problem solved:** Entra Free gives you identity (who is this person?) but not fine-grained app permissions (what can they do in THIS app?). This service bridges that gap.

**Every app in the ecosystem requires users to log in via this auth service.** Users authenticate once (via Microsoft), then SSO carries their session across all apps without re-authenticating.

## Architecture Decisions

### Entra = Identity, Better-Auth = Permissions

Two sources of truth, each owning what it's best at:

- **Entra/M365** owns identity: user accounts, Microsoft social login, guest/member type, M365 admin roles. Every user (internal and guest) lives in Entra.
- **Better-auth** owns app RBAC: per-app roles, custom permissions, JWT issuance. This is the layer consuming apps check.

A Graph API sync keeps them aligned. Users are created/updated in both systems. Auth service never creates Entra accounts directly — it calls Graph API which creates them.

### Apps as First-Class Entities

Applications are registered in the auth service's database, not hardcoded as string constants. Each app gets a `client_id`, callback URLs, and can have per-app API keys. Adding a new app to the ecosystem is an admin UI operation — no code changes or redeploy needed.

### Global + Per-App Roles

Two levels of RBAC:

- **Global roles** (e.g., `super-admin`, `support`) — apply to ALL apps. Assign once, effective everywhere.
- **Per-app roles** (e.g., `editor` in CMS, `admin` in portal) — scoped to a single app.

JWTs include both. Consuming apps check global roles first (super-admin = full access), then fall back to per-app roles.

### Managed Identity Everywhere

No passwords or connection strings in environment variables. All service-to-service auth uses Azure managed identities:

- **Container App → PostgreSQL:** System-assigned managed identity with Entra auth
- **Local dev → PostgreSQL:** `az login` identity → access token as password
- **Container App → Graph API:** `ClientSecretCredential` (Graph API doesn't support managed identity for application permissions)

### Infrastructure as Code (Bicep + Azure Developer CLI)

All Azure services provisioned via Bicep templates. `azd up` provisions infrastructure + deploys app in one command. No manual portal setup.

### Feature-Based Organization

Source code is organized by **feature**, not by technical domain. Each feature contains everything it needs — types, validation, business logic, API routes, and tests. Dependencies live within the feature, not in a shared "generic" folder.

**Why:** Keeps files small, features self-contained, and changes localized. When you work on invitations, you work in one place. When you work on sync, you work in another. No hunting across 10 folders to understand one flow.

### Public Networking (Start Simple)

Auth server runs on Azure Container Apps with public ingress and HTTPS. PostgreSQL uses public endpoint with firewall rules. No VNet or private endpoints initially — adds cost and complexity a non-profit doesn't need. Upgrade path exists if required later.

### SSO Across Apps

All apps share the same auth service. The auth service maintains a session cookie at `auth.tumba.se`. Once a user authenticates with Microsoft, they stay logged in at the auth service level. Every subsequent app redirect to the auth service sees the existing session and issues a new JWT immediately — no Microsoft prompt. The Microsoft session eventually expires (8-24 hours depending on Entra config), requiring re-authentication.

---

## Project Structure

```
auth/
├── PROJECT_BRIEF.md           # This file
├── azure.yaml                 # Azure Developer CLI manifest
├── package.json               # workspace root
│
├── infra/                     # Bicep IaC templates (azd provisions from here)
│   ├── main.bicep             # Orchestrator: references all modules
│   ├── core/
│   │   ├── container-app.bicep    # Container Apps environment + auth server
│   │   ├── postgres.bicep         # PostgreSQL Flexible Server + Entra auth
│   │   ├── static-web-app.bicep   # Static Web Apps for admin UI
│   │   └── container-registry.bicep  # ACR for Docker images
│   └── modules/
│       ├── managed-identity.bicep     # System-assigned managed identity
│       └── service-connection.bicep   # Container App ↔ PostgreSQL identity connection
│
├── server/                    # Hono + better-auth backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── Dockerfile
│   └── src/
│       ├── index.ts           # Hono server entry, mounts feature routes
│       ├── auth.ts            # Better-auth instance (plugins, social provider)
│       ├── permissions.ts     # createAccessControl + role definitions
│       ├── db/
│       │   ├── index.ts       # DB client instance (DefaultAzureCredential for auth)
│       │   └── schema.ts      # Drizzle schema (all tables)
│       ├── features/
│       │   ├── apps/
│       │   │   ├── create.ts          # Register new app (generates client_id)
│       │   │   ├── list.ts            # List all registered apps
│       │   │   ├── update.ts          # Update app settings (callback URLs, enabled)
│       │   │   ├── api-keys.ts        # Generate/revoke per-app API keys
│       │   │   ├── routes.ts          # CRUD routes for apps
│       │   │   ├── types.ts
│       │   │   └── apps.test.ts
│       │   ├── global-roles/
│       │   │   ├── create.ts          # Create global role (super-admin, support)
│       │   │   ├── assign.ts          # Assign/revoke global roles to users
│       │   │   ├── routes.ts          # CRUD routes for global roles
│       │   │   ├── types.ts
│       │   │   └── global-roles.test.ts
│       │   ├── app-roles/
│       │   │   ├── create.ts          # Create role for a specific app
│       │   │   ├── assign.ts          # Assign/revoke per-app roles
│       │   │   ├── routes.ts          # CRUD routes for app roles
│       │   │   ├── types.ts
│       │   │   └── app-roles.test.ts
│       │   ├── sync/
│       │   │   ├── graph-client.ts    # Graph API authenticated client
│       │   │   ├── delta-sync.ts      # Delta query: pull users from Entra
│       │   │   ├── user-sync.ts       # Upsert user from Graph API data
│       │   │   ├── role-sync.ts       # Read/write Entra role assignments
│       │   │   ├── routes.ts          # POST /sync/trigger, GET /sync/status
│       │   │   ├── types.ts           # Graph API response types
│       │   │   └── sync.test.ts       # Integration tests with mocked Graph API
│       │   └── invitations/
│       │       ├── invite.ts          # Create invitation + call Graph API
│       │       ├── accept.ts          # Handle acceptance on first login
│       │       ├── routes.ts          # POST /invite, GET /invitations
│       │       ├── types.ts
│       │       └── invitations.test.ts
│       ├── shared/
│       │   ├── constants.ts   # Entra role IDs, defaults
│       │   └── errors.ts      # Typed error classes
│       └── env.ts             # Environment variable validation (zod)
│
├── admin-ui/                  # React + Vite + shadcn admin dashboard
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── components.json        # shadcn config
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── lib/
│       │   ├── auth-client.ts  # better-auth client instance
│       │   └── api.ts         # fetch wrapper for /api/* calls
│       ├── components/
│       │   ├── auth/           # from better-auth-ui.com (shadcn registry)
│       │   ├── admin/          # from better-auth-interface (shadcn registry)
│       │   └── ui/             # shadcn base components
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── SignIn.tsx
│       │   ├── Users.tsx           # User list + management
│       │   ├── Apps.tsx            # Register apps, manage settings, API keys
│       │   ├── GlobalRoles.tsx     # Create/manage global roles, assign to users
│       │   ├── AppRoles.tsx        # Matrix: users × apps × roles
│       │   ├── EntraSync.tsx       # Custom: sync status, trigger, logs
│       │   ├── Invitations.tsx     # Custom: invite form, pending list
│       │   └── Settings.tsx
│       ├── hooks/
│       │   ├── use-sync.ts
│       │   ├── use-apps.ts
│       │   ├── use-global-roles.ts
│       │   ├── use-app-roles.ts
│       │   └── use-invitations.ts
│       └── types/
│           └── index.ts
│
└── shared/                    # Shared types between server and admin UI
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── types.ts           # User, App, GlobalRole, AppRole, Invitation, SyncLog
        ├── constants.ts       # Role names, Entra role definitions
        └── validation.ts      # Shared Zod schemas
```

---

## Database Schema

PostgreSQL via Azure Flexible Server. Drizzle ORM for schema and migrations. **No `DATABASE_URL`** — Container App uses managed identity, local dev uses `az login` token.

### Connection pattern

```typescript
// Container App or local dev — same code, same credential source
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const token = await credential.getToken(
  "https://ossrdbms-aad.database.windows.net/.default"
);
// Use token.token as the password in the PostgreSQL connection
```

### Tables

```sql
-- Core user table. Keyed by Microsoft object ID (oid).
-- oid is the stable identifier across Entra and your auth service.
CREATE TABLE users (
  oid           TEXT PRIMARY KEY,
  tid           TEXT NOT NULL,
  email         TEXT NOT NULL,
  name          TEXT,
  type          TEXT NOT NULL,            -- 'member' | 'guest'
  photo_url     TEXT,
  entra_synced  BOOLEAN DEFAULT FALSE,
  last_sync_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tid ON users(tid);

-- Registered applications. First-class entities, not string constants.
-- Each app that integrates with the auth service is registered here.
CREATE TABLE apps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,          -- 'cms', 'portal'
  display_name    TEXT NOT NULL,                 -- 'Tumba CMS'
  description     TEXT,
  client_id       TEXT NOT NULL UNIQUE,          -- UUID, used as JWT audience
  callback_urls   TEXT[],                        -- allowed OAuth redirect URIs
  enabled         BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Global roles. Apply to ALL apps. Assign once, effective everywhere.
-- Example: super-admin has full access to every app.
CREATE TABLE global_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,          -- 'super-admin', 'support'
  description TEXT,
  permissions JSONB DEFAULT '[]',           -- ['*'] or ['users.manage', 'apps.manage']
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- User ↔ global role assignments
CREATE TABLE user_global_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_oid    TEXT NOT NULL REFERENCES users(oid) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES global_roles(id) ON DELETE CASCADE,
  granted_by  TEXT REFERENCES users(oid),
  granted_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_oid, role_id)
);
CREATE INDEX idx_user_global_roles_user ON user_global_roles(user_oid);

-- Per-app role definitions. Each app has its own set of roles.
CREATE TABLE app_role_definitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id      UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                 -- 'admin', 'editor', 'viewer'
  description TEXT,
  permissions JSONB DEFAULT '[]',           -- ['posts.create', 'posts.publish']
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, name)
);
CREATE INDEX idx_app_role_def_app ON app_role_definitions(app_id);

-- User ↔ app ↔ role assignments
CREATE TABLE user_app_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_oid    TEXT NOT NULL REFERENCES users(oid) ON DELETE CASCADE,
  app_id      UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES app_role_definitions(id) ON DELETE CASCADE,
  granted_by  TEXT REFERENCES users(oid),
  granted_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_oid, app_id, role_id)
);
CREATE INDEX idx_user_app_roles_user ON user_app_roles(user_oid);
CREATE INDEX idx_user_app_roles_app ON user_app_roles(app_id);

-- Invitation tracking. Links email → app → role → status.
CREATE TABLE invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  app_id      UUID NOT NULL REFERENCES apps(id),
  role        TEXT NOT NULL,
  invited_by  TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  status      TEXT DEFAULT 'pending',     -- 'pending' | 'accepted' | 'expired'
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Graph API sync log. Audit trail for sync operations.
CREATE TABLE sync_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type    TEXT NOT NULL,             -- 'delta' | 'on_demand' | 'invitation'
  status       TEXT NOT NULL,             -- 'success' | 'error'
  users_synced INT DEFAULT 0,
  error_detail TEXT,
  started_at   TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Better-auth also creates its own tables (user, session, account, verification)
-- via the Drizzle adapter. Don't create those manually.
```

### Schema relationships

```
users ──┬── user_global_roles ── global_roles
        ├── user_app_roles ──┬── apps
        │                    └── app_role_definitions ── apps
        ├── invitations ── apps
        └── entra_roles

apps: standalone entity, referenced by user_app_roles, app_role_definitions, invitations
global_roles: standalone entity, referenced by user_global_roles
app_role_definitions: belongs to apps, referenced by user_app_roles
```

---

## Better-Auth Configuration

### Instance setup

```typescript
// server/src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { microsoft } from "better-auth/social-providers";
import { jwt } from "better-auth/plugins/jwt";
import { admin } from "better-auth/plugins/admin";
import { apiKey } from "@better-auth/api-key";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID,
    },
  },

  plugins: [
    admin({ ac, roles, defaultRole: "user" }),
    jwt({
      jwt: {
        definePayload: async ({ user }) => {
          // Fetch global roles
          const globalRoles = await getUserGlobalRoles(user.id);
          // Fetch per-app roles (only for enabled apps)
          const appRoles = await getUserAppRoles(user.id);
          return {
            sub: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            global_roles: globalRoles,    // ['super-admin']
            apps: appRoles,               // [{ id, name, roles, permissions }]
          };
        },
        expirationTime: "1h",
      },
      jwks: { jwksPath: "/.well-known/jwks.json" },
    }),
    apiKey([{
      configId: "app-keys",              // per-app API keys via configId
      defaultPrefix: "tumba_",
    }]),
  ],
});
```

### Permissions (RBAC)

```typescript
// server/src/permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  users: ["read", "write", "invite", "delete"],
  apps: ["read", "write", "admin"],
  roles: ["read", "write", "assign"],
  sync: ["read", "trigger"],
} as const;

export const ac = createAccessControl(statements);

// Global roles (apply to ALL apps)
export const globalRoles = {
  "super-admin": ac.newRole({
    ...adminAc.statements,
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

// Per-app roles are defined dynamically in the app_role_definitions table.
// These are the built-in roles for the auth service's own admin UI.
export const roles = {
  admin: ac.newRole({
    ...adminAc.statements,
    users: ["read", "write", "invite"],
    apps: ["read", "write", "admin"],
    roles: ["read", "write", "assign"],
  }),
  editor: ac.newRole({ users: ["read"], apps: ["read"] }),
  viewer: ac.newRole({ users: ["read"] }),
  user: ac.newRole({}),
};
```

### Environment variables

```
# Database (no connection string — uses managed identity)
POSTGRES_HOST=authdb.postgres.database.azure.com
POSTGRES_DATABASE=authdb
POSTGRES_USER=auth-admin@authdb          # Entra admin for initial setup

# Microsoft OAuth
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=

# Microsoft Graph API (for Entra sync)
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# Better-auth
BETTER_AUTH_SECRET=
BETTER_AUTH_BASE_URL=https://auth.tumba.se

# App
PORT=3000
NODE_ENV=production
```

---

## Feature: Sync (Entra ↔ Auth Service)

### What it does

Keeps the auth service's user data aligned with Entra via Microsoft Graph API.

- **Delta query:** Periodically fetch all users changed since last sync. Creates/updates/deletes local user records.
- **On-demand:** Triggered when admin adds a user via the UI. Calls Graph API immediately.
- **Role sync:** Reads Entra directory role assignments for each user.

### Graph API permissions needed

App registration in Entra needs these **application permissions** (not delegated):
- `User.Read.All` — read user profiles
- `User.Invite.All` — invite guest users
- `RoleManagement.Read.Directory` — read role assignments
- `Directory.Read.All` — read directory data
- `RoleManagement.ReadWrite.Directory` — manage role assignments (optional, for admin role management)

All work on Entra ID Free tier. No P1/P2 required.

### Graph API client

Use `@microsoft/microsoft-graph-client` with `@azure/identity` `ClientSecretCredential`. The client handles token acquisition and refresh automatically. Note: Graph API requires `ClientSecretCredential` — managed identity is not supported for application permissions.

### Delta query pattern

1. First sync: `GET /users/delta` (no token)
2. Paginate through all results via `@odata.nextLink`
3. Save `@odata.deltaLink` (contains delta token for next sync)
4. Next sync: `GET /users/delta?$deltaToken=<token>`
5. Only changed/created/deleted users are returned

For each user in the delta response, also fetch their role memberships:
`GET /users/{id}/roleMemberships/directoryScoped`

### Sync log

Every sync operation writes to `sync_log` with status, user count, and errors. The admin UI shows this as an audit trail.

---

## Feature: Invitations

### Flow

```
Admin UI                    Auth Server                  Graph API                  Entra
    │                           │                           │                        │
    │ POST /invite              │                           │                        │
    │ {email, app_id, role}     │                           │                        │
    │ ────────────────────────► │                           │                        │
    │                           │ Store invitation in DB    │                        │
    │                           │ (app_id references apps)  │                        │
    │                           │ POST /invitations         │                        │
    │                           │ ─────────────────────────►│                        │
    │                           │                           │ Create guest account   │
    │                           │                           │ Send invitation email  │
    │                           │ ◄─────────────────────────│                        │
    │                           │                           │                        │
    │ ◄──────────────────────── │                           │                        │
    │ Invitation created        │                           │                        │
    │                           │                           │                        │
    │ ...user accepts email link, authenticates via Microsoft...                     │
    │                           │                           │                        │
    │                           │ Better-auth callback      │                        │
    │                           │ Match oid to invitation   │                        │
    │                           │ Create user + assign role │                        │
    │                           │ Mark invitation accepted  │                        │
```

### Key detail

The Graph API `POST /invitations` creates the guest user in Entra and sends the invitation email. Your auth service stores the invitation locally to track status and assign the initial app role when the user first authenticates.

---

## Feature: Apps

### What it does

Manages registered applications as first-class entities. Apps are registered through the admin UI — no code changes or redeploy needed to add a new app to the ecosystem.

### App registration flow

```
Admin UI                    Auth Server
    │                           │
    │ POST /apps                │
    │ {name, display_name,      │
    │  description, callback_urls}
    │ ────────────────────────► │
    │                           │ Generate client_id (UUID)
    │                           │ Store in apps table
    │ ◄──────────────────────── │
    │ {id, client_id, ...}      │
```

### Client ID and API keys

- **Client ID:** UUID generated on registration (`f47ac10b-58cc-4372-a567-0e02b2c3d479`). Used as JWT `aud` claim and app identifier.
- **API Keys:** Generated per-app via better-auth's `apiKey` plugin with `configId`. Format: `tumba_k7f8g9h2j4k5l6m8n0p1q2r3s4t5`. Stored hashed, shown once at creation.

### How consuming apps authenticate

```
1. JWT verification (user identity + roles):
   - App fetches JWKS from: https://auth.tumba.se/.well-known/jwks.json
   - Verifies JWT signature using public keys
   - Reads JWT payload → user identity + global_roles + per-app roles
   - No API key needed — just standard JWKS verification

2. API calls (check roles, list users):
   - App sends: Authorization: Bearer tumba_k7f8g9h2j...
   - Auth service verifies API key is valid and belongs to this app
   - Returns requested data

3. User login (OAuth redirect):
   - App redirects to: https://auth.tumba.se/oauth/authorize
     ?client_id=<app's client_id>
     &redirect_uri=<registered callback URL>
     &response_type=code
     &scope=openid profile email
   - Auth service redirects to Microsoft Entra
   - User authenticates with Microsoft
   - Auth service issues JWT with audience = app's client_id
   - Redirects back to app with JWT
```

### SSO behavior

All apps share the same auth service. Once a user authenticates with Microsoft, the auth service maintains a session cookie. Subsequent app logins see the existing session and issue a new JWT immediately — no Microsoft prompt. The Microsoft session expires after 8-24 hours (configurable in Entra).

---

## Feature: Global Roles

### What it does

Manages cross-app roles that apply to ALL apps. Example: a user with `super-admin` global role has full access to every app in the ecosystem.

### Data model

| user_oid | role_name | permissions |
|---|---|---|
| abc-123 | super-admin | ['*'] |
| def-456 | support | ['users.read', 'users.invite'] |

### How it works

1. **Admin UI:** Super-admin creates global roles (name + permissions), assigns users
2. **JWT issuance:** `definePayload` queries `user_global_roles` → embeds `global_roles` claim
3. **Consuming apps:** Check `global_roles` first. If `super-admin` → full access. Otherwise, check per-app roles.

### Global roles vs per-app roles

| | Global roles | Per-app roles |
|---|---|---|
| Scope | ALL apps | Single app |
| Example | `super-admin`, `support` | `editor` in CMS, `admin` in portal |
| Table | `global_roles` + `user_global_roles` | `app_role_definitions` + `user_app_roles` |
| Use case | "This user can manage everything" | "This user can edit posts in CMS" |

---

## Feature: App Roles

### Data model

Each row = one user has one role in one app.

Example for a user with CMS editor + portal admin:

| user_oid | app (UUID) | role |
|---|---|---|
| abc-123 | cms-uuid | editor |
| abc-123 | portal-uuid | admin |

### How it's used

1. **Admin UI:** Admin assigns roles via a matrix view (users × apps × roles)
2. **JWT issuance:** When a JWT is issued, `definePayload` queries `user_app_roles` and embeds the result as the `apps` claim
3. **Consuming apps:** Verify JWT signature via JWKS, check `global_roles` first, then read `apps[appName]` for per-app permissions

### Permission resolution order

```
1. Check global_roles → if 'super-admin' → full access everywhere
2. Check apps[name].permissions → app-specific access
3. No match → access denied
```

### Entra roles vs app roles

| | Entra built-in roles | App roles (your service) |
|---|---|---|
| Purpose | M365 admin access (Global Admin, User Admin) | App-level permissions (CMS editor, portal admin) |
| Managed by | M365 admin portal | Your admin UI |
| Stored in | Entra (not in your DB) | `app_role_definitions` + `user_app_roles` tables |
| Cost | Requires P1/P2 for custom roles | Free (your own DB) |
| When to use | Admin needs to manage M365 settings | User needs app-specific access |

---

## JWT Verification (for consuming apps)

### Standard JWKS

The auth server exposes `/.well-known/jwks.json` — a standard RFC 7517 endpoint. Any language, any framework, any service can verify tokens using this.

### JWT payload structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "Erik N",
  "type": "member",
  "aud": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "global_roles": ["super-admin"],
  "apps": [
    {
      "id": "cms-uuid",
      "name": "cms",
      "roles": ["editor"],
      "permissions": ["posts.create", "posts.publish"]
    }
  ],
  "iss": "https://auth.tumba.se",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Verification pattern

```
Consuming app receives JWT in Authorization: Bearer header
    │
    ├─ Fetch JWKS from auth server (cache the public keys, they don't change often)
    ├─ Match JWT header `kid` to JWKS key
    ├─ Verify signature
    ├─ Check `iss` matches auth server URL
    ├─ Check `aud` matches THIS app's client_id
    ├─ Check `exp` hasn't passed
    └─ Read claims: global_roles + apps[].roles for authorization decisions
```

### Permission check in consuming app

```typescript
function hasPermission(jwtPayload: JWT, permission: string): boolean {
  // 1. Global super-admin → full access everywhere
  if (jwtPayload.global_roles?.includes("super-admin")) return true;

  // 2. Check per-app permissions
  const appAccess = jwtPayload.apps?.find(
    (a) => a.name === "cms"  // this app's name
  );
  return appAccess?.permissions?.includes(permission) ?? false;
}
```

### Language examples

- **TypeScript/Node:** `jose` library with `createRemoteJWKSet`
- **Python:** `PyJWT` + `PyJWKClient`
- **Go:** `lestrrat-go/jwx/v2/jwk` + `golang-jwt/jwt/v5`
- **.NET:** `Microsoft.AspNetCore.Authentication.JwtBearer` with `IssuerSigningKeyResolver`

No better-auth SDK needed on the consuming side. Just standard JWKS libraries.

---

## Admin UI (React + shadcn)

### Component sources

| Component | Source | How it's installed |
|---|---|---|
| Auth pages (sign-in, settings) | better-auth-ui.com | `npx shadcn add https://better-auth-ui.com/r/auth.json` |
| User table, create/edit/ban dialogs | better-auth-interface | `npx shadcn add https://jrrdavies.github.io/better-auth-interface/r/admin-dashboard.json` |
| Shadcn base components | shadcn/ui | Installed as dependency of above |
| Entra Sync, App Roles, Invitations | Custom | Built from scratch using shadcn components |

### Peer dependency requirements

- React >= 19.2.6
- better-auth >= 1.6.19
- Tailwind CSS >= 4.3.1
- zod >= 4.4.3
- @tanstack/react-query >= 5.100.14

### Provider nesting

```tsx
// Both libraries provide their own AuthProvider wrapping the same client instance.
// They use separate React contexts — no conflict.
<AuthProvider authClient={authClient}>          {/* better-auth-interface */}
  <AuthProvider2 authClient={authClient}>        {/* better-auth-ui.com */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </AuthProvider2>
</AuthProvider>
```

### Admin UI pages

| Page | Route | Description |
|---|---|---|
| Sign In | `/sign-in` | Microsoft login via better-auth-ui |
| Dashboard | `/` | Overview stats, last sync time, pending invitations |
| Users | `/users` | User list from better-auth-interface, with sync status column |
| Apps | `/apps` | Register apps, manage settings, view/generate API keys |
| Global Roles | `/global-roles` | Create global roles, assign to users |
| App Roles | `/roles` | Matrix: users × apps, assign/revoke per-app roles |
| Entra Sync | `/sync` | Sync log, delta token status, trigger sync button |
| Invitations | `/invitations` | Invite form (email + app + role), pending/accepted list |
| Settings | `/settings` | Organization settings from better-auth-ui |

---

## Testing Philosophy

### Guiding principle

Write tests that, when they pass, give you **genuine confidence** that the system works. Not tests for coverage metrics. Not tests that just verify mocks are mocked. Tests that exercise the real logic against real (or realistically simulated) dependencies.

If a test passes and you still don't feel confident — delete it and write a better one.

### What to test

**High value (test these thoroughly):**

- **Feature integration tests:** Each feature (`apps`, `global-roles`, `app-roles`, `sync`, `invitations`) gets tests that exercise the full flow from route handler through business logic to database. Use a real test database (SQLite for unit tests, or a test PostgreSQL instance for integration tests).
- **JWT verification:** Test that `definePayload` produces the correct `global_roles` and `apps` claim structure. Test that the JWKS endpoint returns valid keys. Test that consuming apps can verify tokens. Test that the `aud` claim matches the app's client_id.
- **Sync logic:** Test delta query parsing, user upsert logic, role mapping. Mock the Graph API HTTP layer, not the business logic.
- **Invitation flow:** Test the full lifecycle — create invitation, simulate first login, verify user is created with correct role.
- **App management:** Test app CRUD, API key generation/revocation, callback URL validation.
- **Global vs per-app roles:** Test that global roles apply across all apps, per-app roles are scoped correctly, and JWT contains both.
- **Edge cases:** Expired invitations, duplicate users, missing email claims, users with no roles, users with roles across multiple apps, disabled apps.

**Low value (skip or minimize):**

- Unit tests that just call a function with canned input and check the output matches a canned output — unless the function has complex logic worth verifying.
- Tests that mock every dependency and only verify "this function calls that function" — these test your mocks, not your code.
- Tests that exist purely to hit a coverage number.

### Test organization

Co-locate tests with features:

```
features/
├── sync/
│   ├── delta-sync.ts
│   ├── user-sync.ts
│   ├── routes.ts
│   ├── delta-sync.test.ts      # Tests for delta-sync.ts
│   └── user-sync.test.ts       # Tests for user-sync.ts
├── invitations/
│   ├── invite.ts
│   ├── accept.ts
│   ├── routes.ts
│   ├── invite.test.ts
│   └── accept.test.ts
```

### Test infrastructure

- **Unit tests:** Vitest with SQLite in-memory database. Fast, no external dependencies. Run on every change.
- **Integration tests:** Vitest with a real PostgreSQL test database (or use `pg-mem` for an in-memory Postgres). Run before PRs.
- **API tests:** Test Hono routes end-to-end with the auth instance. Better-auth provides test helpers for creating test instances with mock databases.
- **No browser/E2E tests for the auth server.** The admin UI gets E2E tests separately if needed, but that's not the priority here.

### Test patterns

```typescript
// Example: Testing the invitation feature

// 1. Create a test instance of better-auth with a test DB
// 2. Create test data (users, roles)
// 3. Call the feature logic directly (not HTTP)
// 4. Assert on database state + return values

describe("invitation", () => {
  it("creates invitation and stores in DB", async () => {
    const result = await inviteUser({
      email: "test@gmail.com",
      app: "cms",
      role: "editor",
      invitedBy: adminUser.oid,
    });

    expect(result.status).toBe("pending");
    expect(result.email).toBe("test@gmail.com");

    const stored = await db.select().from(invitations)
      .where(eq(invitations.id, result.id));
    expect(stored).toHaveLength(1);
  });

  it("assigns role on first login when invitation exists", async () => {
    // Create invitation
    const invite = await inviteUser({ ... });

    // Simulate Microsoft callback with the invited user's oid
    await handleAuthCallback(mockMicrosoftProfile);

    // Verify user was created
    const user = await db.select().from(users)
      .where(eq(users.oid, mockMicrosoftProfile.oid));
    expect(user).toHaveLength(1);

    // Verify role was assigned
    const roles = await db.select().from(appRoles)
      .where(eq(appRoles.userOid, mockMicrosoftProfile.oid));
    expect(roles[0].app).toBe("cms");
    expect(roles[0].role).toBe("editor");

    // Verify invitation was marked accepted
    const stored = await db.select().from(invitations)
      .where(eq(invitations.id, invite.id));
    expect(stored[0].status).toBe("accepted");
  });

  it("rejects login from non-invited user", async () => {
    const result = await handleAuthCallback(randomMicrosoftProfile);
    // Should not create user or assign roles
  });
});
```

---

## Azure Deployment

### Infrastructure as Code

All Azure services provisioned via Bicep templates in `auth/infra/`. Use Azure Developer CLI (`azd`) for provisioning and deployment:

```bash
azd init        # First time: scaffold project, link to Bicep templates
azd up          # Provision infra + deploy app (one command)
azd provision   # Just provision/update infrastructure
azd deploy      # Just deploy app code
```

### Services

| Service | Purpose | Tier | Cost |
|---|---|---|---|
| Azure Static Web Apps | Admin UI (React SPA) | Standard | ~$9/mo (required for Container Apps backend integration) |
| Azure Container Apps | Auth server (Hono) | Consumption | ~$0 (180K vCPU-sec/mo free) |
| Azure PostgreSQL Flexible | Database | Burstable B1ms | ~$12/mo |
| Azure Container Registry | Docker images | Basic | ~$0 |

### Bicep template structure

```
auth/infra/
├── main.bicep                    # Orchestrator: references all modules
├── core/
│   ├── container-app.bicep       # Container Apps environment + auth server
│   ├── postgres.bicep            # PostgreSQL Flexible Server + Entra auth
│   ├── static-web-app.bicep      # Static Web Apps for admin UI
│   └── container-registry.bicep  # ACR for Docker images
└── modules/
    ├── managed-identity.bicep    # System-assigned managed identity
    └── service-connection.bicep  # Container App ↔ PostgreSQL identity connection
```

### What `azd up` provisions

1. Resource group
2. Container Registry (for Docker images)
3. Container Apps environment
4. Container App (auth server) with **system-assigned managed identity**
5. PostgreSQL Flexible Server with **Entra auth enabled**
6. Static Web Apps (admin UI) linked to Container App backend
7. Service connection: Container App identity → PostgreSQL Entra auth
8. All role assignments and firewall rules

### Auth between services

```
Admin UI (Static Web Apps)
    │ /api/* proxied to Container App
    │ Session cookies (better-auth)
    ▼
Container Apps (auth server)
    │ Managed identity → PostgreSQL (Entra auth, no password)
    │ ClientSecretCredential → Microsoft Graph API
    │ Public JWKS endpoint → consuming apps
    ▼
PostgreSQL Flexible Server
    │ Entra auth: Container App identity maps to DB role
    │ No connection string, no password in env vars
```

### Managed identity details

**Container App → PostgreSQL (production):**
- Container App has system-assigned managed identity
- `az containerapp connection create postgres-flexible` automates setup:
  - Creates Entra admin on PostgreSQL
  - Creates database user mapped to the identity
  - Sets up env vars in Container App
- App code uses `DefaultAzureCredential` → gets token for `https://ossrdbms-aad.database.windows.net/.default` → uses token as PostgreSQL password

**Local dev → PostgreSQL:**
- Developer runs `az login` (already done)
- `DefaultAzureCredential` tries Azure CLI credentials first
- Same code works locally — no separate connection string needed
- Alternative: `az account get-access-token --resource https://ossrdbms-aad.database.windows.net` → use token as password in psql

### Static Web Apps ↔ Container Apps

- Static Web Apps proxies `/api/*` routes to the Container App
- Container App gets identity provider "Azure Static Web Apps (Linked)" — only proxied traffic allowed
- Requires **Standard plan** for backend integration (~$9/mo)

### Networking

- Container Apps: public ingress, HTTPS, external
- PostgreSQL: public endpoint, firewall rules (allow Container App outbound IPs only)
- SSL enforced on all connections
- No VNet or private endpoints initially — adds cost and complexity a non-profit doesn't need. Upgrade path exists if required later.

### CI/CD

Two GitHub Actions workflows:

1. **Auth server:** On push to `auth/server/**` → build Docker → push to ACR → deploy Container Apps
2. **Admin UI:** On push to `auth/admin-ui/**` → build React → deploy Static Web Apps

Both deploy to `main` only.

---

## Environment & Dependencies

### server (auth-server)

Runtime dependencies:
- `better-auth` — core auth framework
- `@better-auth/api-key` — API key plugin (per-app keys via configId)
- `hono` — HTTP server framework
- `drizzle-orm` — database ORM
- `@microsoft/microsoft-graph-client` — Graph API client
- `@azure/identity` — Azure credential management (DefaultAzureCredential)
- `zod` — environment validation
- `pg` — PostgreSQL driver

Dev dependencies:
- `vitest` — test runner
- `drizzle-kit` — migration tool
- `@types/node`, `typescript`

### admin-ui

Runtime dependencies:
- `react`, `react-dom` >= 19.2.6
- `better-auth` — client library
- `@better-auth-ui/core`, `@better-auth-ui/react` — auth UI data layer
- `@tanstack/react-query` >= 5.100.14
- `tailwindcss` >= 4.3.1
- `zod` >= 4.4.3
- `react-router` — routing

Dev dependencies:
- `vite` — bundler
- `@vitejs/plugin-react`
- `typescript`

### Root workspace

```json
{
  "workspaces": ["ui", "web", "auth"]
}
```

---

## Constraints

- **No paid Entra features.** Custom directory roles, dynamic groups, and conditional access require P1/P2. This service provides the RBAC alternative.
- **All users live in Entra.** Internal members and external guests both authenticate via Microsoft. The auth service is a permission layer, not an identity provider.
- **Non-profit Azure credits.** Keep costs minimal. Consumption-tier Container Apps and Burstable PostgreSQL.
- **No commits without explicit permission.** Show what will be committed, propose message, wait for approval.
- **Feature-based organization.** Don't default to domain-based folder structure. Group by feature unless there's a strong reason not to.
- **Testable by design.** Code should be structured so features can be tested independently. Inject dependencies, avoid singletons where possible, keep business logic separate from HTTP concerns.
- **Managed identity everywhere.** No passwords or connection strings in environment variables. Container App → PostgreSQL via managed identity. Local dev via `az login`. Only exception: Microsoft Graph API uses `ClientSecretCredential` (Graph API doesn't support managed identity for application permissions).
- **Apps are first-class entities.** Not hardcoded strings. Registered in DB, managed via admin UI, with client_id and per-app API keys.
- **SSO across all apps.** All apps share the same auth service. Session cookie at auth.tumba.se enables seamless login across CMS, portal, and any future app.
