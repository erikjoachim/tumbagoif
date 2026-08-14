export interface InviteUserInput {
  email: string;
  appId: string;
  role: string;
  invitedBy: string;
}

export interface InvitationRow {
  id: string;
  email: string;
  appId: string;
  role: string;
  invitedBy: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}