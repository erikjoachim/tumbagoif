import { NavLink, Outlet } from "react-router-dom";
import { routes } from "./routes";

type LayoutProps = {
  userName: string | null;
  userEmail: string | null;
  health: string;
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function Layout({ userName, userEmail, health, onRefresh, onSignOut }: LayoutProps) {
  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="eyebrow">tumba goif identity</p>
          <h1>Dashboard</h1>
        </div>

        <nav className="nav">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {route.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">{userName ?? "Unknown user"}</p>
          <p className="muted small">{userEmail ?? "no email"}</p>
          <p className="muted small">Server: {health}</p>
          <div className="actions">
            <button type="button" onClick={() => void onRefresh()}>
              Refresh
            </button>
            <button type="button" className="ghost" onClick={() => void onSignOut()}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <section className="content">
        <Outlet />
      </section>
    </main>
  );
}
