import { useState, useMemo } from "react";
import type { Transactions, TransactionType } from "../utilities/LedgerTypes";
import { assertNever } from "./SideBar";
import type { OutletContextType } from "./Dashboard";
import { useOutletContext } from "react-router-dom";
import "../styles/Transactions.css";

interface TransactionCardProps {
  input: TransactionType;
  allTransactions: Transactions[];
  transactionsFilter: Transactions[];
  accountsMap: Map<string, string>;
  categoriesMap: Map<string, string>;
}

export function TransactionCard({
  input,
  allTransactions,
  transactionsFilter,
  accountsMap,
  categoriesMap,
}: TransactionCardProps) {
  switch (input.state) {
    case "idle":
      return <p>No transactions loaded yet.</p>;
    case "loading":
      return (
        <table className="skeleton-table-transactions">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* 8 fake rows, same height as real rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="skeleton-row-transactions">
                <td>
                  <div className="skeleton-bar-transactions" />
                </td>
                <td>
                  <div className="skeleton-bar-transactions wide" />
                </td>
                <td>
                  <div className="skeleton-bar-transactions" />
                </td>
                <td>
                  <div className="skeleton-bar-transactions" />
                </td>
                <td>
                  <div className="skeleton-bar-transactions" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "error":
      return <p>Couldn't load transactions. Please try again.</p>;

    case "loaded": {
      if (allTransactions.length === 0) {
        return (
          <p>No transactions yet. Add your first transaction to get started.</p>
        );
      } else if (transactionsFilter.length === 0) {
        return (
          <p>
            No transactions match your selected filter. Try changing or clearing
            them.
          </p>
        );
      } else {
        return (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactionsFilter.map((tx) => {
                const accountName =
                  accountsMap.get(tx.account_id) ?? "Unknown Account";
                const categoryName =
                  categoriesMap.get(tx.category_id) ?? "Unknown Category";

                return (
                  <tr key={tx.id}>
                    <td>
                      {new Date(tx.transaction_date).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                    <td>{tx.description}</td>
                    <td>{categoryName}</td>
                    <td>{accountName}</td>
                    <td
                      className={
                        tx.amount_cents < 0
                          ? "amount-negative"
                          : "amount-positive"
                      }
                    >
                      {(tx.amount_cents / 100).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }
    }

    default: {
      return assertNever(input);
    }
  }
}

export function TransactionsPage() {
  const {
    accounts,
    transactions,
    categories,
    selectedAccountId,
    setSelectedAccountId,
    accountsMap,
    categoriesMap,
  } = useOutletContext<OutletContextType>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const availableAccounts = accounts.state === "loaded" ? accounts.data : [];

  const allTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];
    const filtered = selectedAccountId
      ? transactions.data.filter(
          (transaction) => transaction.account_id === selectedAccountId,
        )
      : transactions.data;
    return filtered;
  }, [selectedAccountId, transactions]);

  const transactionsFilter = useMemo(() => {
    if (!selectedCategory) return allTransactions;
    return allTransactions.filter(
      (cat) => cat.category_id === selectedCategory,
    );
  }, [allTransactions, selectedCategory]);

  const categoryList = categories.state == "loaded" ? categories.data : [];

  return (
    <div className="transactions-layout">
      {/*Top Header section*/}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <h2>Transactions</h2>
          <p>Showing {transactionsFilter.length} transactions</p>
        </span>
        {/*Placeholder for Transaction button*/}
        <button>Add Transaction</button>
      </div>

      {/*Filter/Dropdown section*/}
      <div className="filter-container">
        <select
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

        <select
          value={selectedCategory ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCategory(value === "" ? null : value);
          }}
        >
          <option value="">All</option>
          {categoryList.map((cat) => (
            <option value={cat.id} key={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/*Main Transaction section*/}
      <div className="transaction-container">
        <TransactionCard
          input={transactions}
          allTransactions={allTransactions}
          transactionsFilter={transactionsFilter}
          accountsMap={accountsMap}
          categoriesMap={categoriesMap}
        />
      </div>
    </div>
  );
}
