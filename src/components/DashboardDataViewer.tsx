// Updated for LedgerPulse real tables
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface AccountItem {
  id: string;
  name: string;
}

export function DashboardDataViewer() {
  const [items, setItems] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatabaseData() {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from("accounts") // <- changed from test_items
          .select("id, name");

        if (dbError) throw dbError;
        setItems(data || []);
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
        } else if (err && typeof err === "object" && "message" in err) {
          setError((err as any).message);
        } else {
          setError("Unknown error occurred: " + err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDatabaseData();
  }, []);

  if (loading) return <div>Connecting to database and reading rows...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}
    >
      <h3>Live Database Rows (accounts):</h3>
      {items.length === 0 ? (
        <p>
          Connected to Supabase! Accounts table is empty (expected for new user)
          or RLS is working.
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
