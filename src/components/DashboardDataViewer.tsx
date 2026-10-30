// A SIMPLE FUNCTION TO ESTABLISH SERVER CONNECTION WITH FRONTEND
// PROPER CODE IS STILL IN DEVELOPMENT , WILL BE UPDATED SOON
// CURRENTLY FOCUSING ON LEARNING THE ACTUAL SUPABASE DATABASE

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface ProjectItem {
  id: string;
  name: string;
}

export function DashboardDataViewer() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDatabaseData() {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from("test_items")
          .select("id, name");

        if (dbError) throw dbError;
        setItems(data || []);
      } catch (err: any) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
        } else if (err && typeof err === "object" && "message" in err) {
          setError(err.message);
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
      <h3>Live Database Rows:</h3>
      {items.length === 0 ? (
        <p>
          Connected to Supabase! (Table is empty or hasn't been created yet)
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
