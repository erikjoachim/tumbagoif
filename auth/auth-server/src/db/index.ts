import { Client, Pool, type PoolConfig } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { DefaultAzureCredential } from "@azure/identity";
import type { Env } from "../env";
import { PG_AUTH_SCOPE } from "../shared/constants";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

/**
 * Acquire a Postgres password from Azure Entra auth.
 * - Local dev: `az login` identity via AzureCliCredential (part of DefaultAzureCredential)
 * - Container App: system-assigned managed identity
 */
async function getPgAccessToken(credential: DefaultAzureCredential): Promise<string> {
  const token = await credential.getToken(PG_AUTH_SCOPE);
  return token.token;
}

async function buildPoolConfig(env: Env): Promise<PoolConfig> {
  const useManagedIdentity =
    env.POSTGRES_HOST !== "localhost" && env.POSTGRES_HOST !== "127.0.0.1";

  if (useManagedIdentity) {
    const credential = new DefaultAzureCredential();
    const password = await getPgAccessToken(credential);
    return {
      host: env.POSTGRES_HOST,
      port: env.POSTGRES_PORT,
      database: env.POSTGRES_DATABASE,
      user: env.POSTGRES_USER,
      password,
      ssl: { rejectUnauthorized: false },
    };
  }

  return {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DATABASE,
    user: env.POSTGRES_USER,
  };
}

export async function createDb(env: Env): Promise<{ db: Database; pool: Pool }> {
  const poolConfig = await buildPoolConfig(env);
  const pool = new Pool(poolConfig);
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export { Client };
