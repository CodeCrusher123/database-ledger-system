import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

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
    else navigate("signin");
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
      {localError && <p style={{ color: "red" }}>{localError}</p>}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
