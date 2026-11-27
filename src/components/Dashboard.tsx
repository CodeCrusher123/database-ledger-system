import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useLedgerStore } from "../store/LedgerStore";
import "../styles/Dashboard.css";
import type {
  AccountType,
  CategoriesType,
  TransactionType,
} from "../utilities/LedgerTypes";

export type OutletContextType = {
  accounts: AccountType;
  categories: CategoriesType;
  transactions: TransactionType;
  accountsMap: Map<string, string>;
  categoriesMap: Map<string, string>;
  selectedAccountId: string | null;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
};

export function Dashboard() {
  const { accounts, transactions, selectedAccountId, setSelectedAccountId } =
    useOutletContext<OutletContextType>();
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();

  const getBalance = useLedgerStore((s) => s.getBalance);
  const fetchAll = useLedgerStore((s) => s.fetchAll);

  useEffect(() => {
    if (status.state === "unauthenticated") navigate("/signin");
  }, [status, navigate]);

  useEffect(() => {
    if (status.state === "authenticated") fetchAll();
  }, [status, fetchAll]);

  const availableAccounts = accounts.state === "loaded" ? accounts.data : [];

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
    <main className="dashboard-main" aria-labelledby="dashboard-title">
      <div className="page-header">
        <div>
          <h2 id="dashboard-title" className="page-title">
            Dashboard
          </h2>
          <p className="page-subtitle">Your overview for today</p>
        </div>
      </div>

      {/* 1. Total Balance */}
      {isLoading ? (
        <div className="card skeleton-card">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-big" />
          <div className="skeleton-line skeleton-small" />
        </div>
      ) : accounts.state === "error" ? (
        <div className="card status-error-card">Failed to load balance</div>
      ) : (
        <div className="card balance-card">
          <p className="balance-label">
            {selectedAccountId ? "Account Balance" : "Total Balance"}
          </p>
          <h1 className="balance-amount">
            ₹
            {(totalBalance / 100).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h1>
          <div className="filter-container">
            <label htmlFor="filter-account" className="filter-label">
              Account
            </label>
            <select
              id="filter-account"
              value={selectedAccountId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedAccountId(value === "" ? null : value);
              }}
            >
              <option value="">All Accounts</option>
              {availableAccounts.map((acc) => (
                <option value={acc.id} key={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
          <p className="balance-meta">
            {selectedAccountId
              ? "Showing selected account"
              : `${accounts.data.length} accounts`}
          </p>
          {selectedAccountId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setSelectedAccountId(null)}
            >
              Show all accounts
            </button>
          )}
        </div>
      )}

      {/* 2. Quick Actions - always visible */}
      <div className="card quick-actions-card">
        <button type="button" className="primary-btn">
          Add Transaction
        </button>
        <button type="button" className="secondary-btn">
          Add Account
        </button>
      </div>

      {/* 3. Recent Transactions */}
      <div className="card transactions-card">
        <div className="card-header-row">
          <h3>Recent Transactions</h3>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              navigate("/transactions");
            }}
          >
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
          <p className="status-error-text">Failed to load transactions</p>
        ) : recentTransactions.length === 0 ? (
          <p className="empty-state-text">
            No transactions yet. Add your first one.
          </p>
        ) : (
          <ul className="recent-tx-list">
            {recentTransactions.map((t) => (
              <li key={t.id} className="recent-tx-item">
                <span className="tx-description">{t.description}</span>
                <span className="tx-amount">
                  ₹
                  {(t.amount_cents / 100).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. Reserved for later - Spending / Analytics / Budget */}
      <div className="card spending-card">
        <div className="card-header-row">
          <h3>Spending Breakdown</h3>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate("/analytics")}
          >
            View analytics →
          </button>
        </div>
        <p className="empty-state-text">Coming soon — chart will go here.</p>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/budget")}
        >
          Go to Budget →
        </button>
      </div>
    </main>
  );
}
