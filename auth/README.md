# Auth Workspace Commands

This folder contains two npm workspaces:

- `@tumbagoif/auth-server` in `auth/server`
- `@tumbagoif/auth-dashboard` in `auth/dashboard`

Use these command shortcuts.

## From repo root (`tumbagoif/`)

| Command | Action |
|---|---|
| `npm run auth:dev:server` | start auth server dev mode |
| `npm run auth:dev:dashboard` | start auth dashboard dev mode |
| `npm run auth:build` | build server + dashboard |
| `npm run auth:build:server` | build only server |
| `npm run auth:build:dashboard` | build only dashboard |
| `npm run auth:test` | run server tests |
| `npm run auth:lint` | run dashboard lint |
| `npm run auth:migrate` | full auth migration (drizzle first, then better-auth core) |
| `npm run auth:db:migrate` | run drizzle migrations in server |
| `npm run auth:migrate:core` | run only better-auth core migration |

## From auth folder (`tumbagoif/auth/`)

| Command | Action |
|---|---|
| `npm run dev:server` | start auth server dev mode |
| `npm run dev:dashboard` | start auth dashboard dev mode |
| `npm run build` | build server + dashboard |
| `npm run build:server` | build only server |
| `npm run build:dashboard` | build only dashboard |
| `npm run test` | run server tests |
| `npm run lint:dashboard` | run dashboard lint |
| `npm run auth:migrate` | full auth migration (drizzle first, then better-auth core) |
| `npm run auth:migrate:core` | run only better-auth core migration |
| `npm run db:migrate` | run drizzle migrations in server |

## From specific workspace folders

### `auth/server`

Use:

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run auth:migrate`
- `npm run auth:migrate:core`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`

`auth:migrate` intentionally runs `db:migrate` first. This avoids Better Auth failing on legacy `account.issuer` constraints.

### `auth/dashboard`

Use:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`
- `npm run api:generate`

## Notes

- Keep `package.json` in `auth/server` and `auth/dashboard`; each is its own package/workspace.
- `auth/package.json` is command hub only.
- Root `package.json` remains top-level workspace registry + global shortcuts.
