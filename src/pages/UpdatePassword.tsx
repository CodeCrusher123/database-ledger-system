import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

export function UpdatePassword() {
  // 1. FORM elements
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const status = useAuthStore((s) => s.status);
  const isRecoverySession: boolean = status.state === "recovery";
  const isAuthLoading = status.state === "loading";
  const navigate = useNavigate();

  if (isAuthLoading) return <div>Checking link...</div>;
  if (!isRecoverySession)
    return <div>Invalid or expired link. Please request reset again.</div>;

  // Recovery true -> showing
  async function handleSubmit() {
    setLocalError(null);
    if (newPassword.length < 6) {
      setLocalError("Password must be >=6");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setLocalError(error.message);
    else {
      await supabase.auth.signOut();
      navigate("signin");
    }
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="update-title">
        <header>
          <p className="auth-logo">LedgerPulse</p>
          <h1 id="update-title" className="auth-title">
            Choose a new password
          </h1>
          <p className="auth-subtitle">
            Make sure it's something you'll remember
          </p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="auth-field">
            <label htmlFor="update-new-password" className="auth-label">
              New password
            </label>
            <input
              id="update-new-password"
              className="auth-input"
              type="password"
              placeholder="Create a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="update-confirm-password" className="auth-label">
              Confirm password
            </label>
            <input
              id="update-confirm-password"
              className="auth-input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {localError && (
            <p className="auth-error" role="alert">
              {localError}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
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
