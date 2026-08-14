import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins/jwt";
import { admin } from "better-auth/plugins/admin";
import { apiKey as createApiKeyPlugin } from "@better-auth/api-key";
import type { Database } from "./db";
import {
  authUsers,
  authSessions,
  authAccounts,
  authVerifications,
  authMembers,
  appApiKeys,
} from "./db/schema";
import { env } from "./env";
import { getUserGlobalRoles } from "./features/global-roles/queries";
import { getUserAppRoles } from "./features/app-roles/queries";
import { handleAcceptance } from "./features/invitations/accept";
import { oidByAuthUser } from "./db/oid";
import { roles, ac } from "./permissions";

export function createAuth(db: Database) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_BASE_URL,
    secret: env.BETTER_AUTH_SECRET ?? "",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: authUsers,
        session: authSessions,
        account: authAccounts,
        verification: authVerifications,
        member: authMembers,
        apikey: appApiKeys,
      },
      usePlural: true,
    }),

    socialProviders: {
      microsoft: {
        clientId: env.MICROSOFT_CLIENT_ID ?? "",
        clientSecret: env.MICROSOFT_CLIENT_SECRET ?? "",
        tenantId: env.MICROSOFT_TENANT_ID ?? "common",
      },
    },

    plugins: [
      admin({ ac, roles, defaultRole: "user" }),
      jwt({
        jwt: {
          definePayload: async ({ user }) => {
            const [globalRolesClaim, appClaims] = await Promise.all([
              getUserGlobalRoles(db, user.id),
              getUserAppRoles(db, user.id),
            ]);
            return {
              sub: user.id,
              email: user.email,
              name: user.name,
              global_roles: globalRolesClaim,
              apps: appClaims,
            };
          },
          expirationTime: "1h",
        },
        jwks: { jwksPath: "/.well-known/jwks.json" },
      }),
      createApiKeyPlugin([{ configId: "app-keys", defaultPrefix: "tumba_" }]),
    ],

    hooks: {
      after: async (ctx) => {
        const c = ctx as unknown as {
          context: { newUser?: boolean; user?: { id: string; email: string; name: string } };
        };
        const newUser = c.context?.newUser;
        const authUserId = c.context?.user?.id;
        if (newUser && authUserId) {
          const oid = await oidByAuthUser(db, authUserId);
          if (oid) {
            await handleAcceptance(db, {
              oid,
              email: c.context?.user?.email ?? "",
              name: c.context?.user?.name ?? null,
              type: "guest",
              tenantId: env.AZURE_TENANT_ID ?? "",
            });
          }
        }
      },
    },
  });
}