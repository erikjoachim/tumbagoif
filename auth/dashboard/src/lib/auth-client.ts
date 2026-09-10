import { createAuthClient } from "better-auth/react";

const authBaseUrl = `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
});
