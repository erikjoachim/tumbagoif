import { z } from "zod";

export const createAppSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-_]+$/, "name must be lowercase kebab-case"),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  callbackUrls: z.array(z.string().url()).min(1).max(10),
});

export const updateAppSchema = createAppSchema.partial().extend({
  enabled: z.boolean().optional(),
});

export const createGlobalRoleSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9-]*$/, "name must be lowercase kebab-case"),
  description: z.string().max(500).optional().nullable(),
  permissions: z.array(z.string()).min(1).default(["*"]),
});

export const assignGlobalRoleSchema = z.object({
  userOid: z.string().min(1),
  roleId: z.string().min(1),
});

export const revokeGlobalRoleSchema = z.object({
  userOid: z.string().min(1),
  roleId: z.string().min(1),
});

export const createAppRoleSchema = z.object({
  appId: z.string().min(1),
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9-]*$/, "name must be lowercase kebab-case"),
  description: z.string().max(500).optional().nullable(),
  permissions: z.array(z.string()).min(1),
});

export const assignAppRoleSchema = z.object({
  userOid: z.string().min(1),
  roleId: z.string().min(1),
});

export const revokeAppRoleSchema = z.object({
  userOid: z.string().min(1),
  roleId: z.string().min(1),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  appId: z.string().min(1),
  role: z.string().min(1),
});

export const triggerSyncSchema = z.object({
  type: z.enum(["delta", "on_demand"]).default("delta"),
});

export const createApiKeySchema = z.object({
  configId: z.string().default("app-keys"),
});
