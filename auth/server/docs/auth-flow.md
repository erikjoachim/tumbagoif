# Auth Flow (as implemented today)

## Flow overview

```
Smart app / browser                          Auth server                          Microsoft Entra            Postgres
        │   POST /api/auth/sign-in/social        │                                   │                        │
        │   {provider: microsoft}                │                                   │                        │
        │ ─────────────────────────────────►     │                                   │                        │
        │                                       │  Build authorize URL (PKCE+state)   │                        │
        │ ◄─────────────────────────────────     │                                   │                        │
        │      {url: login.microsoftonline.com..}|                                   │                        │
        │ redirect to url                        │                                   │                        │
        │ ─────────────────────────────────────────────────────────────────►         │                        │
        │                                       │                                   │  User signs in        │
        │                                       │  GET /api/auth/callback/microsoft  ◄────────────────────   │
        │ ◄─────────────────────────────────────│                                   │  code →                 │
        │                                       │  Exchange code for tokens          │                        │
        │                                       │                                   │                        │
        │                                       │  Create user row (first time)      │                        │
        │                                       │  Create account row                │                        │
        │                                       │  Create session                    │                        │
        │                                       │  Hook: upsert users mirror table   │                        │
```

There is no auth UI yet — sign-in is triggered by calling the API directly (see README smoke test).

## Steps in detail

1. **Trigger** — `POST /api/auth/sign-in/social` with `provider: "microsoft"`. Server returns a redirect URL to `login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize` with PKCE + state.

2. **Microsoft sign-in** — user authenticates against your Entra tenant (`tenantId` in provider config = single-tenant). Org members and invited guests both sign in here.

3. **Callback** — `GET /api/auth/callback/microsoft`. Server exchanges the code for tokens (id token, access token, refresh token). PKCE auto, state validated per OAuth flow.

4. **Account + session creation** — better-auth creates rows in its own `user`, `account`, `session` tables (camelCase columns). `account.accountId` = Microsoft object ID (`oid`), stable across Entra and this service.

5. **Internal user provisioning (hook)** — `databaseHooks.account.create.after` fires for the `microsoft` provider:
   - Decodes `idToken` (JWT payload only; token came over TLS callback)
   - Reads `oid` (from `account.accountId`) and `tid`
   - Reads `email` and `name` claims
   - Upserts `users` row keyed on `oid`
   - Sets `type`: `member` if `tid === MICROSOFT_TENANT_ID`, otherwise `guest`
   - Stores `auth_user_id` = better-auth user id (the only link between the two user tables)

   Hook failures are logged, never block the login (catch + `console.error`).

6. **Repeat logins** — no new `account` row, so hook does not fire. Existing `users` row is not refreshed on repeat login today; updates only happen on first-time account creation. (Entra sync job will cover this later.)

## Member vs guest

| Claim | member | guest |
|---|---|---|
| `tid` | equals `MICROSOFT_TENANT_ID` | different tenant (home org) |
| `oid` | object id in your tenant | object id of guest object in your tenant |

## Failure modes observed

| Symptom | Cause |
|---|---|
| `AADSTS7000215 invalid_client` | `.env` contains secret **ID**, not secret **Value** |
| Login succeeds, `users` row missing | Hook error logged server-side; check `console.error` in tsx watch output |
| `invalid input syntax for type uuid` (historical) | `auth_user_id` was `uuid`, better-auth ids are nanoid strings — fixed, column is now `text` |

## Verification queries

```sql
select id, email, name from "user" order by "createdAt" desc limit 5;
select "providerId", "accountId", "userId" from account order by "createdAt" desc limit 5;
select oid, tid, email, name, type, auth_user_id from users order by created_at desc;
```