# AGENTS.md - Tumba Gymnastik och IF Development Guide

## Project Overview

This is a Vue 3 + TypeScript sports club website built with Vite. The project is a simple informational site for Tumba Goif (Tumba Gymnastik O IF | Tumba Gymnastik och Idrottsförening) sports club (gymnastics, basketball, floorball, gym).

**Project structure:** This repository contains multiple applications. The website lives in `web/`. Each app manages its own dependencies (`node_modules`, `package.json`, `package-lock.json`).

## Build Commands

All commands run from the `web/` directory:

```bash
# Development
npm run dev          # Start Vite dev server with hot reload (http://localhost:5173)

# Build & Production
npm run build        # Type-check with vue-tsc, then build for production
npm run preview      # Preview production build locally

# CI/CD
npm run deploy       # Clean install + type-check + build (used by GitHub Actions)
```

**Type checking only:** `npm exec vue-tsc --noEmit`

**Running a single test:** No test framework is currently configured.

## Code Style Guidelines

### TypeScript

- **Strict mode is enforced** (`"strict": true` in tsconfig.app.json)
- `noUnusedLocals` and `noUnusedParameters` are enabled - unused variables cause build errors
- Avoid `any` type - use proper TypeScript types or `unknown` when type is truly unknown
- Use `.ts` extension for plain TypeScript files
- Component props should use TypeScript interfaces or `defineProps` with type annotation
- Always use explicit return types for functions when the type is non-obvious

### Vue SFCs (Single File Components)

- Use `<script setup lang="ts">` for all new components
- Prefer Composition API (`<script setup>`) over Options API
- Use `defineProps` with explicit types for component props
- Use `defineEmits` for typed emit declarations
- Keep logic in `<script setup>`, use `<template>` for markup only
- Prefer `ref()` for primitives, `reactive()` for objects when appropriate
- Use `computed()` for derived state instead of manual re-computation

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `SportsGrid.vue`, `HeroSection.vue` |
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

// Relative imports for local modules
import SportsGrid from '../components/SportsGrid.vue'
import type { RouteRecordRaw } from 'vue-router'

// Environment variables
import.meta.env.VITE_SOME_VAR

// Avoid barrel exports unless the codebase already uses them
// Don't add .ts or .vue extensions in imports (handled by bundler)
```

### File Structure

```
web/
├── src/
│   ├── main.ts              # App entry point
│   ├── App.vue               # Root component
│   ├── router/
│   │   └── index.ts          # Vue Router configuration
│   ├── components/           # Reusable UI components
│   │   ├── About.vue
│   │   ├── Footer.vue
│   │   ├── Hero.vue
│   │   └── SportsGrid.vue
│   ├── pages/                # Route-level components
│   │   ├── Home.vue
│   │   ├── PrivacyPolicy.vue
│   │   ├── CookiesPolicy.vue
│   │   └── UnderConstruction.vue
│   ├── assets/               # Static assets
│   │   └── *.svg
│   └── style.css             # Global styles & CSS variables
├── public/                   # Static files served as-is
│   └── *.html
├── index.html                 # Root HTML template
├── vite.config.ts             # Vite configuration
└── tsconfig*.json             # TypeScript configuration
```

### CSS & Styling

- Use CSS custom properties (variables) for theming in `style.css`:
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
- No Tailwind CSS - plain CSS only
- Prefer CSS variables over hardcoded values for colors and spacing

### Error Handling

- Use TypeScript's null safety (`?.`, `??`, type guards) instead of loose checks
- Validate environment variables at runtime:
  ```typescript
  if (import.meta.env.VITE_UNDER_CONSTRUCTION === 'true') {
    // Show under construction page
  }
  ```
- Handle router errors gracefully with wildcard routes
- Wrap async operations in try/catch when errors should be handled gracefully

### Performance Considerations

- Use lazy loading for page components: `component: () => import('../pages/Home.vue')`
- Avoid importing large libraries if only a small portion is used
- Use `v-for` with `:key` on stable, unique identifiers
- Minimize reactivity overhead - avoid wrapping large objects in `ref()` unnecessarily

### Git Conventions

- Commit messages should be concise and descriptive
- Push directly to main is allowed (no branch protection)
- No pre-commit hooks currently configured
- Use `git mv` when moving files to preserve history

## TypeScript Configuration

```json
// tsconfig.app.json - Key settings
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "moduleResolution": "bundler"
}
```

## Firebase Deployment

The project uses Firebase Hosting. Configuration is in `web/firebase.json`.

**Deploy workflow:**
1. `npm ci` - Clean install
2. `vue-tsc -b` - Type-check
3. `vite build` - Production build (outputs to `web/dist`)
4. `firebase deploy` - Deploy to Firebase Hosting

**GitHub Actions:** `.github/workflows/firebase-deploy.yml` runs on push to `main`. It:
- Changes to `web/` directory
- Runs `npm run deploy`
- Deploys to Firebase `live` channel

## Common Issues

| Issue | Solution |
|-------|----------|
| **Unused variables** | Causes build failure - remove or prefix with `_` |
| **Missing types** | Import types from `vue-router` explicitly |
| **Import extensions** | Don't add `.ts` or `.vue` in imports |
| **Firebase deploy fails** | Check `FIREBASE_SERVICE_ACCOUNT_TUMBAGOIF_WEB` secret is set |
| **Environment variables** | Prefix with `VITE_` to expose to client |

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
