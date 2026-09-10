import type { ReactNode } from "react";

export type AppRoute = {
  path: string;
  label: string;
  title: string;
  description: string;
};

export const routes: ReadonlyArray<AppRoute> = [
  {
    path: "/",
    label: "Dashboard",
    title: "Dashboard",
    description: "Overview and quick entry for auth administration.",
  },
  {
    path: "/users",
    label: "Users",
    title: "Users",
    description: "Manage members and guests from auth dataset.",
  },
  {
    path: "/apps",
    label: "Apps",
    title: "Apps",
    description: "Register consuming apps and maintain callback URLs.",
  },
  {
    path: "/global-roles",
    label: "Global Roles",
    title: "Global Roles",
    description: "Cross-app role management for support and super-admin.",
  },
  {
    path: "/roles",
    label: "App Roles",
    title: "App Roles",
    description: "Per-app roles matrix across users and applications.",
  },
  {
    path: "/sync",
    label: "Entra Sync",
    title: "Entra Sync",
    description: "Monitor and trigger Entra delta synchronization jobs.",
  },
  {
    path: "/invitations",
    label: "Invitations",
    title: "Invitations",
    description: "Invite guests and track invitation lifecycle.",
  },
  {
    path: "/settings",
    label: "Settings",
    title: "Settings",
    description: "Auth service settings and operational defaults.",
  },
];

export function pagePlaceholder(route: AppRoute): ReactNode {
  return (
    <section className="page-placeholder">
      <p>{route.description}</p>
      <ul>
        <li>Feature endpoints pending.</li>
        <li>UI shell ready for API binding.</li>
        <li>Will consume NSwag client once endpoints land.</li>
      </ul>
    </section>
  );
}
