import type { Database } from "./db";
import type { GraphApi } from "./features/sync/types";

export interface Deps {
  db: Database;
  graph: GraphApi;
}