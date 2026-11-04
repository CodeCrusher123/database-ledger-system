import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

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
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Sign In to LedgerPulse</h2>
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
      <button onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p>
        No Account? <Link to="/signup">Sign Up</Link> |{" "}
        <Link to="/reset">Forgot Password</Link>
      </p>
    </div>
  );
}
