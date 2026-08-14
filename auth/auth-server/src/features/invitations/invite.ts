import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Database } from "../../db";
import * as schema from "../../db/schema";
import { INVITATION_TTL_DAYS } from "@tumbagoif/auth-shared";
import { ConflictError, NotFoundError } from "../../shared/errors";
import type { GraphApi } from "../sync/types";
import type { InvitationRow, InviteUserInput } from "./types";

const DEFAULT_REDIRECT = "/";

/**
 * Creates a local invitation and, via Graph API, a guest account in Entra.
 * The auth service tracks status locally to assign the initial app role when
 * the user first authenticates.
 */
export async function inviteUser(
  db: Database,
  graph: Pick<GraphApi, "createInvitation">,
  input: InviteUserInput,
  options: { inviteRedirectUrl?: string; appClientId?: string } = {},
): Promise<InvitationRow> {
  const app = await db.query.apps.findFirst({ where: eq(schema.apps.id, input.appId) });
  if (!app) throw new NotFoundError(`App ${input.appId} not found`);

  const role = await db.query.appRoleDefinitions.findFirst({
    where: and(
      eq(schema.appRoleDefinitions.appId, input.appId),
      eq(schema.appRoleDefinitions.name, input.role),
    ),
  });
  if (!role) {
    throw new NotFoundError(`App role '${input.role}' not found for app '${app.name}'`);
  }

  const existing = await db.query.invitations.findFirst({
    where: and(
      eq(schema.invitations.email, input.email),
      eq(schema.invitations.status, "pending"),
      eq(schema.invitations.appId, input.appId),
    ),
  });
  if (existing) throw new ConflictError("A pending invitation already exists for this email + app");

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const inviteRedirectUrl = options.inviteRedirectUrl ?? DEFAULT_REDIRECT;

  await graph.createInvitation({
    invitedUserEmailAddress: input.email,
    inviteRedirectUrl,
    sendInvitationMessage: true,
  });

  const [row] = await db
    .insert(schema.invitations)
    .values({
      email: input.email,
      appId: input.appId,
      role: input.role,
      invitedBy: input.invitedBy,
      token,
      expiresAt,
    })
    .returning();

  return mapRow(row);
}

export async function listInvitations(db: Database, status?: string): Promise<InvitationRow[]> {
  const where = status ? eq(schema.invitations.status, status) : undefined;
  const rows = await db.query.invitations.findMany({
    where,
    orderBy: (cols, { desc }) => [desc(cols.createdAt)],
  });
  return rows.map(mapRow);
}

function mapRow(row: typeof schema.invitations.$inferSelect): InvitationRow {
  return {
    id: row.id,
    email: row.email,
    appId: row.appId,
    role: row.role,
    invitedBy: row.invitedBy,
    token: row.token,
    status: row.status as InvitationRow["status"],
    expiresAt: row.expiresAt,
    acceptedAt: row.acceptedAt,
    createdAt: row.createdAt,
  };
}