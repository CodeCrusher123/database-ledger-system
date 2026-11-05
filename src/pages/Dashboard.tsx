import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useLedgerStore } from "../store/LedgerStore";

export function Dashboard() {
  const status = useAuthStore((s) => s.status);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const accounts = useLedgerStore((s) => s.accounts);
  const fetchAll = useLedgerStore((s) => s.fetchAll);

  useEffect(() => {
    if (status.state === "unauthenticated") {
      navigate("/signin");
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status.state === "authenticated") {
      fetchAll();
    }
  }, [fetchAll]);

  async function handleSignOut() {
    await signOut();
    navigate("/signin");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Dashboard</h2>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      {accounts.state === "idle" && <div>Idle...</div>}
      {accounts.state === "loading" && <div>Loading...</div>}
      {accounts.state === "error" && <div>Error: {accounts.error_message}</div>}
      {accounts.state === "loaded" && (
        <ul>
          {accounts.data.map((acc) => (
            <li key={acc.id}>{acc.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
