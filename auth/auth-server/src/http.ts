import type { Deps } from "./deps";
import type { AppError } from "./shared/errors";
import { ValidationError } from "./shared/errors";

export interface ParsableSchema<T> {
  safeParse(data: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } };
}

/**
 * Read and validate a JSON request body with a Zod schema (zod v4).
 * Uses a structural type so it accepts any zod v4 schema without
 * fighting ZodType's invariant type parameter.
 */
export async function parseBody<T>(
  c: import("hono").Context<DepsEnv>,
  schema: ParsableSchema<T>,
): Promise<T> {
  const raw = await c.req.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
      .join(", ");
    throw new ValidationError(detail);
  }
  return parsed.data;
}

/** Hono context type carrying the shared dependencies. */
export interface DepsEnv {
  Variables: {
    deps: Deps;
    apiClientId?: string | null;
    callerOid?: string | null;
  };
}

export interface ErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export function toErrorBody(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof Error && "status" in err) {
    const appErr = err as AppError;
    return {
      status: appErr.status,
      body: { error: { code: appErr.code, message: appErr.message } },
    };
  }
  return {
    status: 500,
    body: { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
  };
}