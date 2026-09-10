import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { pagePlaceholder, routes } from "./routes";

export function PageView() {
  const location = useLocation();

  const route = useMemo(() => {
    return routes.find((item) => item.path === location.pathname) ?? routes[0];
  }, [location.pathname]);

  return (
    <article className="page-card">
      <header className="page-header">
        <h2>{route.title}</h2>
        <p>{route.description}</p>
      </header>
      {pagePlaceholder(route)}
    </article>
  );
}
