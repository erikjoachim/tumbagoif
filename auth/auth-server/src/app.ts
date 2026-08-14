import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Database } from "./db";
import type { Deps } from "./deps";
import type { GraphApi } from "./features/sync/types";
import { createAuth } from "./auth";
import type { DepsEnv } from "./http";
import appsRoutes from "./features/apps/routes";
import globalRolesRoutes from "./features/global-roles/routes";
import appRolesRoutes from "./features/app-roles/routes";
import syncRoutes from "./features/sync/routes";
import invitationsRoutes from "./features/invitations/routes";
import { verifyApiKey } from "./features/apps/api-keys";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function createApp(db: Database, graph: GraphApi): Hono<DepsEnv> {
  const deps: Deps = { db, graph };
  const auth = createAuth(db);

  const app = new Hono<DepsEnv>();

  app.use("*", logger());
  app.use("/api/*", cors());
  app.use("/api/*", async (c, next) => {
    c.set("deps", deps);
    c.set("apiClientId", null);
    c.set("callerOid", null);

    const authz = c.req.header("authorization");
    if (authz?.startsWith("Bearer ")) {
      const clientId = await verifyApiKey(db, authz.slice("Bearer ".length));
      c.set("apiClientId", clientId);
    }

    await next();
  });

  app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
  app.route("/api/apps", appsRoutes);
  app.route("/api/global-roles", globalRolesRoutes);
  app.route("/api", appRolesRoutes);
  app.route("/api/sync", syncRoutes);
  app.route("/api/invitations", invitationsRoutes);

  app.onError((err, c) => {
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 500;
    const body =
      err instanceof Error && "code" in err && "status" in err
        ? { error: { code: (err as { code: string }).code, message: err.message } }
        : { error: { code: "INTERNAL_ERROR", message: "Internal server error" } };
    return c.json(body, status as ContentfulStatusCode);
  });

  return app;
}