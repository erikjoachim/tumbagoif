import { newDb } from "pg-mem";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";
import * as schema from "./db/schema";

export interface TestDb {
  db: NodePgDatabase<typeof schema>;
}

export async function createTestDb(): Promise<TestDb> {
  const mem = newDb();

  mem.public.registerFunction({
    name: "gen_random_uuid",
    returns: "text",
    impure: true,
    implementation: () => randomUUID(),
  });

  const pg = mem.createPg();
  const pool = new pg.Pool();
  const db = drizzle(pool as never, { schema }) as unknown as NodePgDatabase<typeof schema>;

  return { db };
}