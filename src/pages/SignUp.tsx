import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import "../styles/Auth.css";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  async function handleSignUp() {
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError("Email and Password required");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      setLocalError(error.message);
    } else {
      setSuccessMsg(
        "Account created! Check your email to confirm — link expires in 1 hour. Then sign in.",
      );
      setTimeout(() => navigate("/signin"), 3000);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <header>
          <p className="auth-logo">LedgerPulse</p>
          <h1 id="signup-title" className="auth-title">
            Create account
          </h1>
          <p className="auth-subtitle">Your personal finance tracker</p>
        </header>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <div className="auth-field">
            <label htmlFor="signup-email" className="auth-label">
              Email
            </label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password" className="auth-label">
              Password
            </label>
            <input
              id="signup-password"
              className="auth-input"
              type="password"
              placeholder="Create a password"
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
          {successMsg && (
            <p className="auth-success" role="status">
              {successMsg}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Account exists?{" "}
            <Link to="/signin" className="auth-link">
              Sign In
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
