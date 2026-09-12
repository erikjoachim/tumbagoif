# AGENTS.md - Point of Sale (POS)

Standalone React app. NOT part of the TumbolaGoIF monorepo: it is not an npm workspace, does not use `@tumbagoif/ui` or the repo's Vue/design-token conventions, and has its own `package.json` + `package-lock.json`. Ignore the root `AGENTS.md` except repo-wide git conventions.

## Stack

- React 18 + TypeScript (strict) + Vite 5
- Tailwind CSS 3 (utility classes in `src/index.css`, no config beyond `tailwind.config.js`)
- `lucide-react` for icons
- Supabase JS client (direct, no wrapper)

## Commands (run from `pos/`)

| Command | Action |
|---------|--------|
| `npm install` | Install pos deps — NOT covered by root `npm install` (not a workspace); currently no local `node_modules` |
| `npm run dev` | Vite dev server |
| `npm run build` | `vite build` only — does **not** typecheck |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.app.json` — run separately from build |
| `npm run lint` | `eslint .` |
| `npm run preview` | Preview production build |

`build`, `lint`, and `typecheck` are separate; build alone will not catch TS errors.

## File layout & conventions

- `src/App.tsx` — tab shell (cashier / inventory / history) + routes. `/pris-lista` is a public menu/price-list page (`MenuView`); everything else routes to the POS shell. Uses `react-router-dom` (not part of the RN/monorepo conventions).
- `src/views/*.tsx` — one file per view; all Supabase calls live in views, no data layer
- `src/lib/supabase.ts` — the single shared client
- `src/lib/format.ts` — all currency/date formatting uses `sv-SE` locale + SEK
- `src/types.ts` — shared `Product`, `CartItem`, `Sale`/`SaleItem` interfaces
- `@/` alias → `src/`; defined in **both** `vite.config.ts` and `tsconfig.app.json` (keep in sync)
- Files use explicit `.tsx`/`.ts` extensions in imports (e.g. `./App.tsx`)

Notable TS settings: `noUnusedLocals`/`noUnusedParameters` are **disabled** — unused variables do not fail the build (opposite of the monorepo).

## Supabase

- Client config comes from `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). `.env` is gitignored; the app breaks at runtime (not compile time) if it's missing.
- The publishable key (successor to the anon key) is intentionally public. Single-tenant, no auth: RLS policies grant `anon, authenticated` full CRUD on `products`, `sales`, `sale_items`.
- Schema lives in `supabase/migrations/*.sql` (timestamped filenames). Add a new migration file for DB changes; do not edit the applied schema file.
- Sales are NOT inserted directly. The UI calls `supabase.rpc('complete_sale', { p_items })` (`SECURITY DEFINER`) which creates the sale + sale_items and decrements stock atomically. Keep that as the only write path for sales (see `CashierView.tsx`).

## Deployment (Azure Static Web Apps)

- Deploy runs from branch `release/point-of-sale` via `.github/workflows/pos-deploy.yml` (repo root), NOT from `main`. Pushing to `main` will NOT deploy the POS.
- The workflow builds inside `./pos` and deploys `pos/dist`. Build-time env comes from repo secrets, mapped from `POS_`-prefixed secret names to the `VITE_` vars the code reads: `POS_VITE_SUPABASE_URL`, `POS_VITE_SUPABASE_PUBLISHABLE_KEY` (not the local `.env`). The SWA token secret is `AZURE_STATIC_WEB_APPS_API_TOKEN_POS` (separate SWA resource from the website's `AZURE_STATIC_WEB_APPS..._CALM_ISLAND...`).
- `VITE_ENABLE_HISTORY_DELETE` (plain env var in the workflow, public, not a secret) shows a "Clear all history" button in the History tab used for testing; it is off unless the flag is set to `true`.

## Formatting

- No per-app Prettier config; root `.prettierrc` applies. Root `npm run format` (`prettier --write .` from repo root) **will** reformat `pos/` since it is not in `.prettierignore`.
- Files in `pos/` use double quotes and trailing semicolons (matches the starter template, not the repo default).