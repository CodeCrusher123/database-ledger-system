import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

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
    <div>
      <h2>Reset your Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleResetPassword} disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {localError && <p style={{ color: "red" }}>{localError}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      <p>
        <Link to="/signin">Back to Sign In</Link>
      </p>
    </div>
  );
}
