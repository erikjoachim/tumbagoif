# Tumba GOIF Auth Dashboard

React + Vite admin dashboard scaffold for auth service.

## Commands

- `npm run dev` start dashboard on `http://localhost:5174`
- `npm run build` typecheck + build
- `npm run preview` preview build
- `npm run api:generate` generate TypeScript API client from auth OpenAPI schema (NSwag)

## Requirements for API generation

1. Start auth server on `http://localhost:3000`
2. Ensure open api plugin enabled (`/api/auth/open-api/generate-schema`)
3. Run `npm run api:generate`

Generated file target: `src/lib/auth-api-client.ts`
