import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  getCurrentUser,
  getDashboardPathForRole,
  isAuthenticated,
  loginWithPassword,
} from "../auth";
import { useLazyGetCurrentUserQuery } from "../api/usersApi";

function LoginPage() {
  const navigate = useNavigate();
  const [loadCurrentUser] = useLazyGetCurrentUserQuery();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(() => isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      navigate(getDashboardPathForRole(currentUser.role), { replace: true });
      return;
    }

    void loadCurrentUser()
      .unwrap()
      .then((profile) => {
        navigate(getDashboardPathForRole(profile.role), { replace: true });
      })
      .catch(() => {
        setIsRedirecting(false);
      });
  }, [loadCurrentUser, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithPassword(username, password);
      const profile = await loadCurrentUser().unwrap();
      navigate(getDashboardPathForRole(profile.role), { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return isRedirecting ? (
    <main className="dashboard-loading">Redirecting to dashboard...</main>
  ) : (
    <main className="login-page">
      <section className="login-shell" aria-label="Login">
        <div className="login-brand-panel">
          <p className="login-eyebrow">Leave Management</p>
          <h1>Welcome back</h1>
          <p>
            Review leave balances, requests, approvals, and team availability
            from a single workspace.
          </p>
          <div className="login-brand-meta">
            <span>Secure access</span>
            <span>Team calendar</span>
            <span>Fast approvals</span>
          </div>
        </div>

        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-form-header">
            <p className="login-eyebrow">Account Login</p>
            <h2>Sign in</h2>
            <span>Enter your credentials to continue.</span>
          </div>

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
