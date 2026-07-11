# AGENTS.md - Tumba Gymnastik och IF Development Guide

## Project Overview

Monorepo with npm workspaces. Two active packages:

- **web/** — Vue 3 + TypeScript public website (Vite, vue-router)
- **ui/** — `@tumbagoif/ui` shared component library (Vite lib mode, Storybook)

Deps hoisted to root `node_modules/` by npm workspaces. Single `package-lock.json` at root. Additional dirs (`cms/`) exist as placeholders, not in workspace.

## Build Commands

Run from each workspace's own directory, NOT from root.

### web/ (public website)

| Command | Action |
|---------|--------|
| `npm run dev` | Vite dev server :5173 |
| `npm run build` | `vue-tsc` + `vite build` |
| `npm run deploy` | `npm ci` + `vue-tsc` + `vite build` (CI) |
| `npm run preview` | Preview production build |

### ui/ (component library)

| Command | Action |
|---------|--------|
| `npm run storybook` | Storybook at :6006 |
| `npm run build` | `vue-tsc` + vite lib build → `dist/` |
| `npm run build-storybook` | Static Storybook site |
| `npm run typecheck` | `vue-tsc --noEmit` |

Root: `npm install` (installs all workspace deps).

## Code Style Guidelines

### TypeScript

- **Strict mode is enforced** (`"strict": true` in tsconfig)
- `noUnusedLocals` and `noUnusedParameters` are enabled — unused variables cause build errors
- Avoid `any` type — use proper TypeScript types or `unknown`
- Use `.ts` extension for plain TypeScript files
- Component props should use `defineProps` with type annotation
- Always use explicit return types for functions when the type is non-obvious

### Vue SFCs (Single File Components)

- Use `<script setup lang="ts">` for all new components
- Prefer Composition API over Options API
- Use `defineProps` with explicit types for component props
- Use `defineEmits` for typed emit declarations
- Keep logic in `<script setup>`, use `<template>` for markup only
- Prefer `ref()` for primitives, `reactive()` for objects when appropriate
- Use `computed()` for derived state instead of manual re-computation

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components (app) | PascalCase | `SportsGrid.vue`, `HeroSection.vue` |
| Components (shared) | PascalCase with T prefix | `TBadge.vue`, `TButton.vue` |
| Router routes | PascalCase | `name: 'Home'` |
| Files | kebab-case | `cookies-policy.vue` |
| CSS classes | kebab-case | `.sport-card`, `.bento-grid` |
| Constants | camelCase | `const defaultTimeout = 5000` |
| Types/Interfaces | PascalCase | `interface SportsData` |

### Imports

```typescript
// Vue ecosystem
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'

// Internal workspace package
import { TBadge, TButton } from '@tumbagoif/ui'

// Relative imports for local modules
import SportsGrid from '../components/SportsGrid.vue'
import type { RouteRecordRaw } from 'vue-router'

// Environment variables
import.meta.env.VITE_SOME_VAR
```

### File Structure

```
tumbagoif/
├── package.json              npm workspaces: ["ui", "web"]
├── package-lock.json         Single lockfile for all workspaces
├── node_modules/             Hoisted shared deps
│   └── @tumbagoif/ui/        Symlink → ../ui/
├── ui/                       @tumbagoif/ui component library
│   ├── package.json
│   ├── vite.config.ts        Library mode build
│   ├── tsconfig.json
│   ├── .storybook/
│   │   ├── main.ts
│   │   └── preview.ts
│   └── src/
│       ├── styles/
│       │   └── tokens.css    Design tokens (CSS custom properties)
│       ├── vue/
│       │   ├── index.ts      Barrel exports
│       │   ├── badge/        TBadge.vue + TBadge.stories.ts
│       │   ├── button/       TButton.vue + TButton.stories.ts
│       │   ├── card/         TCard.vue + TCard.stories.ts
│       │   ├── section-header/
│       │   │                 TSectionHeader.vue + TSectionHeader.stories.ts
│       │   └── stats-grid/   TStatsGrid.vue + TStatsGrid.stories.ts
│       └── vite-env.d.ts
├── web/                      Public website
│   ├── package.json          Depends on "@tumbagoif/ui": "*"
│   ├── src/
│   │   ├── main.ts           App entry point
│   │   ├── App.vue           Root component
│   │   ├── router/           Vue Router configuration
│   │   │   └── index.ts
│   │   ├── components/       App-specific (non-shared) components
│   │   │   ├── About.vue
│   │   │   ├── Footer.vue
│   │   │   ├── Hero.vue
│   │   │   └── SportsGrid.vue
│   │   ├── pages/            Route-level components
│   │   │   ├── Home.vue
│   │   │   ├── PrivacyPolicy.vue
│   │   │   ├── CookiesPolicy.vue
│   │   │   └── UnderConstruction.vue
│   │   ├── assets/           Static assets
│   │   │   └── *.svg
│   │   └── style.css         Global styles & CSS variables
│   ├── public/
│   │   └── *.html
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig*.json
└── cms/                      Placeholder (not in workspace)
```

### CSS & Styling

- Design tokens: colors, spacing, red tints defined in `ui/src/styles/tokens.css` as CSS custom properties
- Apps import tokens via: `import '@tumbagoif/ui/styles/tokens'`
- Use CSS custom properties for theming:
  ```css
  :root {
    --color-bg-primary: #0a0a0a;
    --color-red-600: #dc2626;
    --spacing-unit: 8px;
  }
  ```
- Use scoped styles in components (`<style scoped>`)
- Use `calc()` with spacing variables for consistent spacing
- Use CSS Grid for layouts; Flexbox for alignment
- No Tailwind CSS — plain CSS only
- Prefer CSS variables over hardcoded values for colors and spacing

## UI Library (@tumbagoif/ui)

### Component naming

All shared components prefixed with `T` (Tumba):
`TBadge`, `TButton`, `TCard`, `TSectionHeader`, `TStatsGrid`

### Per-framework directory structure

```
src/
├── vue/       Vue 3 SFC components (current)
├── react/     React components (future)
└── styles/    Shared design tokens (framework-agnostic)
```

Each framework dir mirrors the same component hierarchy. Stories (`.stories.ts`) sit beside each component.

### Adding a new Vue component

1. Create dir: `src/vue/thing/TThing.vue` + `src/vue/thing/TThing.stories.ts`
2. Export from `src/vue/index.ts`:
   ```ts
   export { default as TThing } from "./thing/TThing.vue";
   ```
3. Run `npm run storybook` to preview with controls/args.

### Design tokens

Colors, spacing, and theme vars live in `src/styles/tokens.css` as CSS custom properties. Apps import them in their entry point:

```ts
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

See `ui/src/styles/tokens.css` for available variables.

## Workspace Management

### Adding a new workspace member

1. Create directory with its own `package.json`
2. Add dir name to root `package.json` workspaces array:
   ```json
   "workspaces": ["ui", "web", "cms"]
   ```
3. To use `@tumbagoif/ui`, add to dependencies:
   ```json
   "dependencies": { "@tumbagoif/ui": "*" }
   ```
4. Run `npm install` from root

### Dependency hoisting

npm hoists shared deps to root `node_modules/`. A per-workspace `node_modules/` appears only when version conflicts prevent hoisting.

### Switching to pnpm or yarn

See `ui/README.md` for detailed instructions. Each package manager uses a different config file and lockfile format (pnpm requires `pnpm-workspace.yaml`, yarn uses `yarnrc.yml`).

## Error Handling

- Use TypeScript's null safety (`?.`, `??`, type guards) instead of loose checks
- Validate environment variables at runtime:
  ```typescript
  if (import.meta.env.VITE_UNDER_CONSTRUCTION === 'true') {
    // Show under construction page
  }
  ```
- Handle router errors gracefully with wildcard routes
- Wrap async operations in try/catch when errors should be handled gracefully

## Performance Considerations

- Use lazy loading for page components: `component: () => import('../pages/Home.vue')`
- Avoid importing large libraries if only a small portion is used
- Use `v-for` with `:key` on stable, unique identifiers
- Minimize reactivity overhead - avoid wrapping large objects in `ref()` unnecessarily

## Git Conventions

- Commit messages should be concise and descriptive
- Push directly to main is allowed (no branch protection)
- No pre-commit hooks currently configured
- Use `git mv` when moving files to preserve history
- Only root `package-lock.json` is tracked — delete stale per-workspace lockfiles

## TypeScript Configuration

```json
// Key settings (shared across workspaces)
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "moduleResolution": "bundler"
}
```

## Deployment (Azure Static Web Apps)

The website is deployed to Azure Static Web Apps.

**Workflow:** `.github/workflows/website-deploy.yml`

- Runs on push to `main` (ignores `*.md` and `AGENTS.md`)
- Uses `Azure/static-web-apps-deploy@v1` action
- Builds from `web/` directory (`app_location: "./web"`), output `dist/`
- Uses `AZURE_STATIC_WEB_APPS_API_TOKEN_CALM_ISLAND_0EAC90703` secret

## Adding New Pages

1. Create component in `web/src/pages/`
2. Add route in `web/src/router/index.ts`:
   ```typescript
   {
     path: '/new-page',
     name: 'NewPage',
     component: () => import('../pages/NewPage.vue')
   }
   ```

## Common Issues

| Issue | Solution |
|-------|----------|
| **Unused variables** | Causes build failure — remove or prefix with `_` |
| **Missing types** | Import types from `vue-router` explicitly |
| **Import extensions** | Don't add `.ts` or `.vue` in imports |
| **npm audit --force wants breaking upgrade** | Upgrade within current major instead (e.g. vite 5→6, not 5→8). Check peer compatibility. |
| **Stale per-workspace package-lock.json** | Delete it — only root lockfile is used. |
| **@tumbagoif/ui not resolving** | Run `npm install` from root. Check root `node_modules/@tumbagoif/ui` is a symlink to `../ui/`. |
| **Storybook won't start** | Verify `storybook` + framework versions match. Check `.storybook/main.ts` addons are installed. |
| **Deploy fails** | Check `AZURE_STATIC_WEB_APPS_API_TOKEN_CALM_ISLAND_0EAC90703` secret is set. |
| **Environment variables** | Prefix with `VITE_` to expose to client. |
