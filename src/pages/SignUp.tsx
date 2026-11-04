import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

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
    <div>
      <h2>Sign Up to LedgerPulse</h2>
      <p>your personal finance tracker</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {localError && <p style={{ color: "red" }}>{localError}</p>}
      {successMsg && (
        <p style={{ color: "green", fontWeight: 500 }}>{successMsg}</p>
      )}
      <button onClick={handleSignUp} disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <p>
        Account exists? <Link to="/signin">Sign In</Link> |{" "}
        <Link to="/reset">Forgot Password</Link>
      </p>
    </div>
  );
}
