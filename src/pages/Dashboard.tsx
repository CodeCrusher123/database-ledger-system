import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useLedgerStore } from "../store/LedgerStore";
import { SideBar } from "../components/SideBar";

export function Dashboard() {
  const status = useAuthStore((s) => s.status);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const accounts = useLedgerStore((s) => s.accounts);
  const transactions = useLedgerStore((s) => s.transactions);
  const getBalance = useLedgerStore((s) => s.getBalance);
  const fetchAll = useLedgerStore((s) => s.fetchAll);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (status.state === "unauthenticated") navigate("/signin");
  }, [status, navigate]);

  useEffect(() => {
    if (status.state === "authenticated") fetchAll();
  }, [status, fetchAll]);

  async function handleSignOut() {
    await signOut();
    navigate("/signin");
  }

  // Total balance: selected account OR all accounts
  const totalBalance = useMemo(() => {
    if (accounts.state !== "loaded") return 0;
    if (selectedAccountId) return getBalance(selectedAccountId);
    return accounts.data.reduce((sum, acc) => sum + getBalance(acc.id), 0);
  }, [accounts, selectedAccountId, getBalance]);

  // Recent transactions: filtered + last 6
  const recentTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];
    const filtered = selectedAccountId
      ? transactions.data.filter((t) => t.account_id === selectedAccountId)
      : transactions.data;
    return filtered.slice(0, 6);
  }, [transactions, selectedAccountId]);

  const isLoading = accounts.state === "idle" || accounts.state === "loading";

  return (
    <div className="dashboard-layout">
      <SideBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Later: navigate to /transactions, /analytics, /budget from here
          // For now Dashboard stays as home, other tabs just highlight
        }}
        selectedAccountId={selectedAccountId}
        onSelectAccount={(id) =>
          setSelectedAccountId((prev) => (prev === id ? null : id))
        }
      />

      <main className="dashboard-main">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Dashboard</h2>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>

        {/* 1. Total Balance */}
        {isLoading ? (
          <div className="card skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-big" />
            <div className="skeleton-line skeleton-small" />
          </div>
        ) : accounts.state === "error" ? (
          <div className="card">Failed to load balance</div>
        ) : (
          <div className="card">
            <p>{selectedAccountId ? "Account Balance" : "Total Balance"}</p>
            <h1>Rs. {totalBalance / 100}</h1>
            <p>
              {selectedAccountId
                ? "Showing selected account"
                : `${accounts.data.length} accounts`}
            </p>
            {selectedAccountId && (
              <button onClick={() => setSelectedAccountId(null)}>
                Show all accounts
              </button>
            )}
          </div>
        )}

        {/* 2. Quick Actions - always visible */}
        <div className="card">
          <button>Add Transaction</button>
          <button>Add Account</button>
        </div>

        {/* 3. Recent Transactions */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Recent Transactions</h3>
            <button onClick={() => navigate("/transactions")}>
              View all →
            </button>
          </div>

          {transactions.state === "idle" || transactions.state === "loading" ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line skeleton-medium" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))}
            </div>
          ) : transactions.state === "error" ? (
            <p>Failed to load transactions</p>
          ) : recentTransactions.length === 0 ? (
            <p>No transactions yet. Add your first one.</p>
          ) : (
            <ul>
              {recentTransactions.map((t) => (
                <li key={t.id}>
                  {t.description} — Rs. {t.amount_cents / 100}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 4. Reserved for later - Spending / Analytics / Budget */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Spending Breakdown</h3>
            <button onClick={() => navigate("/analytics")}>
              View analytics →
            </button>
          </div>
          <p>Coming soon — chart will go here.</p>
          <button onClick={() => navigate("/budget")}>Go to Budget →</button>
        </div>
      </main>
    </div>
  );
}
