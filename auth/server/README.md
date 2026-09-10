# Tumba GOIF Identity — Auth Server

Central auth service for Tumba GOIF's apps. Microsoft Entra ID handles identity (who you are); this service provides the internal user dataset and, later, per-app roles/permissions (what you can do).

## Status: WIP — foundation only

Working today:
- Hono server on `:3000`, better-auth mounted at `/api/auth/*`
- Microsoft social login (single-tenant, your Entra directory — members and guests)
- Auto-provisioning of the internal `users` table on first MS sign-in
- Guest detection: `tid !== MICROSOFT_TENANT_ID` ⇒ `type = 'guest'`
- Drizzle schema + migrations for all custom tables
- Better-auth core tables via native pg adapter + `better-auth migrate`

Not yet built:
- OIDC provider flow for consuming apps
- Roles/permissions (RBAC) endpoints
- Admin UI
- Entra graph sync jobs
- Tests (minimal)
- Production deployment / hardening

## Local setup

Prerequisites:
- Node 20+
- PostgreSQL running locally with role `tgoif_auth_user` and database `tgoif_identity_dev`
- Entra app registration (see `.env.example` comments) — redirect URI `http://localhost:3000/api/auth/callback/microsoft`

```bash
npm install                # from repo root
cp .env.example .env       # then fill in values
npm run auth:migrate       # full migration: drizzle first, then better-auth core tables
npm run db:generate        # drizzle migration for custom tables (only after schema changes)
npm run db:migrate         # apply drizzle migrations
npm run dev                # starts server on :3000
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | yes | Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | yes | Base URL, e.g. `http://localhost:3000` |
| `MICROSOFT_CLIENT_ID` | runtime | Entra app registration (client) ID |
| `MICROSOFT_CLIENT_SECRET` | runtime | Secret **value**, not secret ID |
| `MICROSOFT_TENANT_ID` | runtime | Your Entra directory (tenant) ID |

Dashboard dev origin `http://localhost:5174` trusted in auth config (`trustedOrigins`).
Use absolute callback URLs in dashboard sign-in (`http://localhost:5174/`) so OAuth returns to dashboard, not auth server origin.

The three `MICROSOFT_*` vars are optional at boot so DB migrations can run before an Entra app registration exists. Server runs without them, but Microsoft login will fail.

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | tsx watch, hot reload |
| `npm run build` | `tsc` typecheck + emit |
| `npm run start` | run compiled `dist/` |
| `npm run test` | vitest run |
| `npm run auth:migrate` | full migration: drizzle first, then better-auth core tables |
| `npm run auth:migrate:core` | create/update better-auth core tables only |
| `npm run db:generate` | new drizzle migration from schema changes |
| `npm run db:migrate` | apply pending drizzle migrations |
| `npm run db:push` | apply schema directly (dev only) |

## Better-auth 1.7 issuer fix

If runtime logs `Database schema mismatch` for `account.issuer`, run `npm run auth:migrate`.
Migration `0003_better_auth_account_issuer_relax.sql` drops `NOT NULL` on `account.issuer`
and removes `issuer + accountId` unique indexes so new inserts from better-auth 1.7.3+ work.

## Smoke test

1. Start server: `npm run dev`
2. Check health: `GET http://localhost:3000/api/auth/ok` → `{"ok":true}`
3. Open `http://localhost:3000`, devtools console:
   ```js
   fetch("/api/auth/sign-in/social", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ provider: "microsoft", callbackURL: "/api/auth/ok" })
   }).then((r) => r.json()).then((d) => (location.href = d.url));
   ```
4. After redirect back, verify in DB:
   ```sql
   select oid, tid, email, name, type, auth_user_id from users;
   ```

## Notes

- Better Auth uses native `pg.Pool` adapter (its own tables, camelCase columns). Drizzle (`src/db/`) is only for the custom tables — keep it that way.
- Custom tables use snake_case columns.
- See `docs/auth-flow.md` and `docs/data-model.md` for details. Architecture context: `../PROJECT_BRIEF.md`.
