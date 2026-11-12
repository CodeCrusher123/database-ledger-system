import { useState, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLedgerStore } from "../store/LedgerStore";
import type { SelectCategory } from "../utilities/LedgerTypes";

interface TransactionProps {
  selectedAccountId: string | null;
  setSelectedAccountId: Dispatch<SetStateAction<string | null>>;
}

export function Transactions({
  selectedAccountId,
  setSelectedAccountId,
}: TransactionProps) {
  const accounts = useLedgerStore((s) => s.accounts);
  const transactions = useLedgerStore((s) => s.transactions);
  const categories = useLedgerStore((s) => s.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const availableAccounts = useMemo(() => {
    if (accounts.state !== "loaded") return [];
    return accounts.data;
  }, [accounts]);

  const allTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];
    const filtered = selectedAccountId
      ? transactions.data.filter((acc) => acc.account_id === selectedAccountId)
      : transactions.data;
    return [...filtered];
  }, [selectedAccountId, transactions]);

  const categoryFilter = useMemo(() => {
    if (!selectedCategory) return allTransactions;
    return allTransactions.filter(
      (cat) => cat.category_id === selectedCategory,
    );
  }, [allTransactions, selectedCategory]);

  const categoryList = useMemo(() => {
    if (categories.state !== "loaded") return [];
    return categories.data;
  }, [categories]);

  return (
    <div className="transactions-layout">
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
    </div>
  );
}
