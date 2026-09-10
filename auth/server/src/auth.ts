import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { db, pool } from "./db";
import { users } from "./db/schema";
import { env } from "./env";

const dashboardOrigin = "http://localhost:5174";

type AccountData = {
  userId: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  idToken?: string | null;
};

/** Base64url-decode a JWT payload without verification (token came from MS over TLS callback). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

/**
 * Provision/update the internal user record on Microsoft sign-in.
 * oid = account.accountId (stable across Entra + this service).
 * Guest detection: token tid differs from our tenant id.
 */
async function upsertEntraUser(account: AccountData): Promise<void> {
  const token = account.idToken ?? account.accessToken;
  const claims = token ? decodeJwtPayload(token) : null;

  const oid = account.accountId;
  const tid = typeof claims?.tid === "string" ? claims.tid : null;
  if (!oid || !tid) {
    console.error("Missing oid/tid in provider account, skipping user sync", {
      providerId: account.providerId,
      accountId: oid,
    });
    return;
  }

  const email = typeof claims?.email === "string" ? claims.email : "";
  if (!email) {
    console.error("Missing email claim in provider token", { accountId: oid });
    return;
  }

  const name = typeof claims?.name === "string" ? claims.name : null;
  const type = tid === env.MICROSOFT_TENANT_ID ? "member" : "guest";

  await db
    .insert(users)
    .values({
      oid,
      tid,
      email,
      name,
      type,
      authUserId: account.userId,
      entraSynced: false,
    })
    .onConflictDoUpdate({
      target: users.oid,
      set: {
        tid,
        email,
        name,
        type,
        authUserId: account.userId,
        updatedAt: new Date(),
      },
    });
}

export const auth = betterAuth({
  appName: "Tumba GOIF Identity",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [dashboardOrigin, "http://localhost:3000"],
  // Native pg adapter — Better Auth manages its own tables via CLI migrate.
  // Drizzle (`db`) is for feature queries against custom tables only.
  database: pool,

  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      // Single-tenant: only accounts in our Entra directory (members + guests)
      tenantId: env.MICROSOFT_TENANT_ID,
    },
  },

  plugins: [openAPI()],

  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId !== "microsoft") return;
          try {
            await upsertEntraUser(account);
          } catch (error) {
            // Log only — provisioning failure must not break the login flow
            console.error("Failed to sync Entra user to internal dataset", error);
          }
        },
      },
    },
  },
});
