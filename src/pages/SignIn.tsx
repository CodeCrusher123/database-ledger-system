import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import "../styles/Auth.css";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  async function handleSignIn() {
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError("Email and Password required");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setLocalError(error.message);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signin-title">
        <header>
          <p className="auth-logo">LedgerPulse</p>
          <h1 id="signin-title" className="auth-title">
            Welcome back
          </h1>
          <p className="auth-subtitle">Sign in to continue to your ledger</p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignIn();
          }}
        >
          <div className="auth-field">
            <label htmlFor="signin-email" className="auth-label">
              Email
            </label>
            <input
              id="signin-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signin-password" className="auth-label">
              Password
            </label>
            <input
              id="signin-password"
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {localError && (
            <p className="auth-error" role="alert">
              {localError}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            No account?{" "}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
          <p>
            <Link to="/reset" className="auth-link">
              Forgot Password
            </Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
