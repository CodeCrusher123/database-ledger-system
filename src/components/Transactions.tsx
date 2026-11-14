import { useState, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLedgerStore } from "../store/LedgerStore";
import type { Transactions, TransactionType } from "../utilities/LedgerTypes";
import { assertNever } from "./SideBar";

interface TransactionProps {
  selectedAccountId: string | null;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
}

interface TransactionCardProps {
  input: TransactionType;
  allTransactions: Transactions[];
  categoryFilter: Transactions[];
}

export function TransactionCard({
  input,
  allTransactions,
  categoryFilter,
}: TransactionCardProps) {
  switch (input.state) {
    case "idle":
      return <p>No transactions loaded yet.</p>;
    case "loading":
      return <p>Loading Transaction...</p>;

    case "error":
      return <p>Couldn't load transactions. Please try again.</p>;

    case "loaded": {
      if (allTransactions.length === 0) {
        return (
          <p>No transactions yet. Add your first transaction to get started.</p>
        );
      } else if (categoryFilter.length === 0) {
        return (
          <p>
            No transactions match your selected filter. Try changing or clearing
            them.
          </p>
        );
      } else {
        return (
          <ul>
            {categoryFilter.map((item) => (
              <li key={item.id}>
                {item.amount_cents / 100} {item.transaction_date}
              </li>
            ))}
          </ul>
        );
      }
    }

    default: {
      return assertNever(input);
    }
  }
}

export function TransactionsPage({
  selectedAccountId,
  setSelectedAccountId,
}: TransactionProps) {
  const accounts = useLedgerStore((s) => s.accounts);
  const transactions = useLedgerStore((s) => s.transactions);
  const categories = useLedgerStore((s) => s.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const availableAccounts = accounts.state === "loaded" ? accounts.data : [];

  const allTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];
    const filtered = selectedAccountId
      ? transactions.data.filter((acc) => acc.account_id === selectedAccountId)
      : transactions.data;
    return filtered;
  }, [selectedAccountId, transactions]);

  const categoryFilter = useMemo(() => {
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
          <p>Showing {categoryFilter.length} transactions</p>
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
          categoryFilter={categoryFilter}
        />
      </div>
    </div>
  );
}
