# @tumbagoif/ui

Shared UI component library for Tumba Gymnastik och IF.

Multi-framework support via per-framework dirs under `src/`:

```
src/
├── vue/       Vue 3 components (current)
├── react/     React components (future)
└── styles/    Shared design tokens (framework-agnostic)
```

## Workspace setup

This repo uses **npm workspaces**. The root `package.json` declares:

```json
"workspaces": ["ui", "web"]
```

This creates a symlink at `node_modules/@tumbagoif/ui -> ui/`. Any app in the workspace can import `@tumbagoif/ui` without `npm link` or file paths.

### Adding a new app to the workspace

Add its directory to the root `package.json` workspaces array:

```json
"workspaces": ["ui", "web", "cms"]
```

The new app needs its own `package.json`. Then you can add `@tumbagoif/ui` as a dependency:

```json
"dependencies": {
  "@tumbagoif/ui": "*"
}
```

Run `npm install` from root to link everything.

## Commands

Run from `ui/` directory:

| Command | Action |
|---|---|
| `npm run storybook` | Start Storybook at http://localhost:6006 |
| `npm run build` | Type-check + library build → `dist/` |
| `npm run build-storybook` | Build static Storybook site |
| `npm run typecheck` | Type-check only (no build) |

## Design tokens

Colors, spacing, and theme vars live in `src/styles/tokens.css` as CSS custom properties.

Apps import them in their entry point:

```ts
// main.ts (any framework)
import '@tumbagoif/ui/styles/tokens'
```

Then use anywhere:

```css
.element {
  color: var(--color-red-600);
  background: var(--color-bg-primary);
  padding: calc(var(--spacing-unit) * 3);
}
```

Available vars — see `src/styles/tokens.css`.

### Using tokens in a non-Vite app

Point your CSS pipeline to the built file:

```
node_modules/@tumbagoif/ui/dist/styles/tokens.css
```

Or copy `src/styles/tokens.css` directly.

## Adding a new Vue component

1. Create dir under `src/vue/`:

```
src/vue/my-thing/
├── TMyThing.vue
└── TMyThing.stories.ts
```

2. Export from `src/vue/index.ts`:

```ts
export { default as TMyThing } from "./my-thing/TMyThing.vue";
```

3. Run `npm run storybook` to preview.

## Adding a new framework (e.g. React)

1. Create mirror dir:

```
src/react/button/TButton.tsx
src/react/button/TButton.stories.ts
```

2. Export from `src/react/index.ts`:

```ts
export { TButton } from "./button/TButton";
```

3. Update `package.json` exports:

```json
"exports": {
  ".": { "import": "./dist/vue/index.mjs" },
  "./react": { "import": "./dist/react/index.mjs" }
}
```

4. Update `vite.config.ts` to add a second lib entry.

Storybook picks up `**/*.stories.ts` regardless of framework dir — both Vue and React stories appear side-by-side.

## Build output

`npm run build` produces:

```
dist/
├── index.mjs        # ESM bundle
├── index.d.ts       # TypeScript declarations
└── style.css        # Component styles + tokens
```

## Switching to pnpm or yarn

### pnpm

1. Delete `node_modules/` and `package-lock.json` from root AND each workspace member.
2. Create `pnpm-workspace.yaml` at root:

```yaml
packages:
  - "ui"
  - "web"
  - "cms"
```

3. Run `pnpm install`.

pnpm uses `pnpm-workspace.yaml` instead of the `workspaces` field in `package.json`.

### yarn (v2+ with Berry)

1. Delete `node_modules/` and `package-lock.json`.
2. Run `yarn set version berry`.
3. Configure `yarnrc.yml`:

```yaml
nodeLinker: node-modules
```

Yarn v1 (classic) supports the `workspaces` field in `package.json` the same way as npm.

### Key differences

| Feature | npm | pnpm | yarn |
|---|---|---|---|
| Config | `workspaces` in `package.json` | `pnpm-workspace.yaml` | `workspaces` in `package.json` (v1) or `yarnrc.yml` (v2+) |
| Lockfile | `package-lock.json` | `pnpm-lock.yaml` | `yarn.lock` |
| Hoisting | Shared deps hoisted to root | Uses hard links, strict | Similar to npm |

All three support the same API: `workspace:*` protocol (pnpm/yarn) or `"*"` (npm) for internal dependencies. The `"@tumbagoif/ui": "*"` syntax works in all three.
