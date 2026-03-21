# AGENTS.md - Tumba Gymnastik och IF Development Guide

## Project Overview

This is a Vue 3 + TypeScript sports club website built with Vite. The project is a simple informational site for Tumba Goif (Tumba Gymnastik O IF | Tumba Gymnastik och Idrottsförening) sports club (gymnastics, basketball, floorball, gym).

## Build Commands

```bash
# Development
npm run dev          # Start Vite dev server with hot reload

# Build & Production
npm run build        # Type-check with vue-tsc, then build for production
npm run preview      # Preview production build locally
npm run deploy       # CI/CD: clean install + type-check + build
```

**Running a single test:** No test framework is currently configured.

**Type checking:** Use `vue-tsc --noEmit` to type-check without building.

## Code Style Guidelines

### TypeScript

- **Strict mode is enforced** (`"strict": true` in tsconfig.app.json)
- Enable `noUnusedLocals` and `noUnusedParameters` - unused variables cause build errors
- Avoid `any` type - use proper TypeScript types or `unknown` when type is truly unknown
- Use `.ts` extension for plain TypeScript files
- Component props should use TypeScript interfaces or `defineProps` with type annotation

### Vue SFCs (Single File Components)

- Use `<script setup lang="ts">` for all new components
- Prefer Composition API (`<script setup>`) over Options API
- Use `defineProps` with explicit types for component props
- Use `defineEmits` for typed emit declarations
- Keep logic in `<script setup>`, use `<template>` for markup only

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

// Avoid barrel exports unless the codebase already uses them
```

### File Structure

```
src/
├── main.ts              # App entry point
├── App.vue               # Root component
├── router/
│   └── index.ts          # Vue Router configuration
├── components/           # Reusable UI components
│   ├── SportsGrid.vue
│   ├── Hero.vue
│   └── Footer.vue
├── pages/                # Route-level components
│   ├── Home.vue
│   ├── PrivacyPolicy.vue
│   └── CookiesPolicy.vue
├── assets/               # Static assets
│   └── *.svg
└── style.css             # Global styles & CSS variables
```

### CSS & Styling

- Use CSS custom properties (variables) for theming:
  ```css
  :root {
    --color-bg-primary: #0a0a0a;
    --color-red-600: #dc2626;
    --spacing-unit: 8px;
  }
  ```
- Prefer scoped styles in components (default `<style scoped>`)
- Use `calc()` with spacing variables for consistent spacing
- Use CSS Grid for layouts; Flexbox for alignment
- No Tailwind CSS - plain CSS only

### Error Handling

- Use TypeScript's null safety (`?.`, `??`, type guards) instead of loose checks
- Validate environment variables at runtime:
  ```typescript
  if (import.meta.env.VITE_UNDER_CONSTRUCTION === 'true') {
    // ...
  }
  ```
- Handle router errors gracefully with wildcard routes

### Performance Considerations

- Use lazy loading for page components: `component: () => import('../pages/Home.vue')`
- Avoid importing large libraries if only a small portion is used
- Use `v-for` with `:key` on stable, unique identifiers
- Minimize reactivity overhead - avoid wrapping large objects in `ref()` unnecessarily

### Git Conventions

- Commit messages should be concise and descriptive
- Push directly to main is allowed (no branch protection)
- No pre-commit hooks currently configured

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

The project uses Firebase Hosting. The deploy workflow:
1. `npm ci` - Clean install
2. `vue-tsc -b` - Build type definitions
3. `vite build` - Production build
4. `firebase deploy` - Deploy to Firebase Hosting

## Common Issues

- **Unused variables**: Causes build failure due to strict config
- **Missing types**: Ensure all Vue Router types are imported from `vue-router`
- **Import extensions**: Don't add `.ts` or `.vue` extensions in imports (handled by bundler)
