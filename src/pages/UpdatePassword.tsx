import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/AuthStore";

export function UpdatePassword() {
  // 1. FORM elements
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useAuthStore((s) => s.status);
  const isRecoverySession: boolean = status.state === "recovery";
  const isAuthLoading = status.state === "loading";

  if (isAuthLoading) return <div>Checking link...</div>;
  if (!isRecoverySession)
    return <div>Invalid or expired link. Please request reset again.</div>;

  // Recovery true -> showing
  async function handleSubmit() {
    if (newPassword.length < 6) {
      setError("Password must be >=6");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else window.location.href = "/signin"; // or navigate("/signin")
    setLoading(false);
  }

  return (
    <div>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
