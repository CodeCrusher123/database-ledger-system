import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import "../styles/Auth.css";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const resetPassword = useAuthStore((s) => s.resetPassword);

  async function handleResetPassword() {
    setLocalError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setLocalError("Email required");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      setLocalError(error.message);
    } else {
      setSuccessMsg(
        "Check your email — we sent a reset link (expires in 1 hour).",
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="reset-title">
        <header>
          <p className="auth-logo">LedgerPulse</p>
          <h1 id="reset-title" className="auth-title">
            Reset your password
          </h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a reset link
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
        >
          <div className="auth-field">
            <label htmlFor="reset-email" className="auth-label">
              Email
            </label>
            <input
              id="reset-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {localError && (
            <p className="auth-error" role="alert">
              {localError}
            </p>
          )}
          {successMsg && (
            <p className="auth-success" role="status">
              {successMsg}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            <Link to="/signin" className="auth-link">
              Back to Sign In
            </Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
