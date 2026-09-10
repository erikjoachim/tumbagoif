import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { authClient } from "./lib/auth-client";
import { apiGet, type HealthResponse } from "./lib/api";
import { Layout } from "./layout";
import { PageView } from "./page-view";
import { routes } from "./routes";

type SessionData = {
  session?: {
    id: string;
    expiresAt: string;
  };
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

type SessionEnvelope = {
  data?: SessionData | null;
};

function unwrapSession(result: unknown): SessionData | null {
  if (!result || typeof result !== "object") return null;

  const maybeEnvelope = result as SessionEnvelope;
  if ("data" in maybeEnvelope) {
    return maybeEnvelope.data ?? null;
  }

  return result as SessionData;
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [health, setHealth] = useState<string>("unknown");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    let nextError: string | null = null;

    const [sessionResult, healthResult] = await Promise.allSettled([
      authClient.getSession() as Promise<unknown>,
      apiGet<HealthResponse>("/health"),
    ]);

    if (sessionResult.status === "fulfilled") {
      const payload = unwrapSession(sessionResult.value);
      const hasSession = Boolean(payload?.session && payload?.user);
      setIsAuthenticated(hasSession);
      setUserName(payload?.user?.name ?? null);
      setUserEmail(payload?.user?.email ?? null);
    } else {
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
      nextError =
        sessionResult.reason instanceof Error ? sessionResult.reason.message : "Session check failed";
    }

    if (healthResult.status === "fulfilled") {
      setHealth(healthResult.value.status);
    } else {
      setHealth("error");
      if (!nextError) {
        nextError =
          healthResult.reason instanceof Error ? healthResult.reason.message : "Health check failed";
      }
    }

    if (nextError) {
      setError(nextError);
    }

    setLoading(false);
  }

  async function signInWithMicrosoft(): Promise<void> {
    const result = await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: `${window.location.origin}/`,
    });

    if (result.error) {
      setError(result.error.message ?? "Sign-in failed");
    }
  }

  async function signOut(): Promise<void> {
    const result = await authClient.signOut();
    if (result.error) {
      setError(result.error.message ?? "Sign-out failed");
      return;
    }
    await refresh();
  }

  if (loading) {
    return (
      <main className="shell-center">
        <section className="auth-panel">
          <p className="eyebrow">tumba goif identity</p>
          <h1>Auth Dashboard</h1>
          <p className="muted">Checking session...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="shell-center">
        <section className="auth-panel">
          <p className="eyebrow">tumba goif identity</p>
          <h1>Auth Dashboard</h1>
          <p className="muted">Sign in to access admin routes.</p>
          <button type="button" onClick={() => void signInWithMicrosoft()}>
            Sign in with Microsoft
          </button>
          {error ? <p className="error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              userName={userName}
              userEmail={userEmail}
              health={health}
              onRefresh={refresh}
              onSignOut={signOut}
            />
          }
        >
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path === "/" ? undefined : route.path.slice(1)}
              index={route.path === "/"}
              element={<PageView />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
