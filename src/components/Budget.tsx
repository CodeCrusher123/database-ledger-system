import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "./Dashboard";
import { useMemo, useState } from "react";

export function Budget() {
  const { transactions, categories } = useOutletContext<OutletContextType>();
  const [selectedMonth, _setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const scopedTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];

    return transactions.data.filter(
      (trx) => trx.transaction_date.slice(0, 7) === selectedMonth,
    );
  }, [transactions, selectedMonth]);

  const spentByCategoryId = useMemo(() => {
    return scopedTransactions.reduce(
      (acc, trx) => {
        if (trx.amount_cents > 0) return acc;

        const key = trx.category_id ?? "uncategorized";
        acc[key] = (acc[key] ?? 0) + Math.abs(trx.amount_cents);
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [scopedTransactions]);
  console.log("selectedMonth", selectedMonth);
  console.log("spentByCategoryId", spentByCategoryId);

  const totalBudgeted =
    categories.state === "loaded"
      ? categories.data.reduce((sum, c) => sum + c.monthly_budget_cents, 0)
      : 0;

  const totalSpent = Object.values(spentByCategoryId).reduce(
    (sum, v) => sum + v,
    0,
  );
  const totalRemaining = totalBudgeted - totalSpent;
  const totalPercent =
    totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <section className="budget-container" aria-labelledby="budget-title">
      <header className="budget-header">
        <h2 id="budget-title" className="budget-title">
          Monthly Budget
        </h2>
      </header>
      <div className="budget-overview">
        <h3>Total Budget: {(totalBudgeted / 100).toFixed(2)}</h3>
        <h3>Total Spent: {(totalRemaining / 100).toFixed(2)}</h3>
        <h3>Remaining Budget: {(totalRemaining / 100).toFixed(2)}</h3>
        <p>Upcoming bar: {Math.round(totalPercent)}</p>
      </div>
      <div className="category-card">
        {categories.state === "loaded" &&
          categories.data.map((cat) => {
            const spent = spentByCategoryId[cat.id] ?? 0;
            const budgeted = cat.monthly_budget_cents;
            const remaining = budgeted - spent;
            const percent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
            return (
              <div key={cat.id}>
                <p>Budget: {budgeted / 100}</p>
                <p>Spent: {spent / 100}</p>
                <p>Remaining: {remaining / 100}</p>
                <p>Percent: {Math.round(percent)}</p>
                <form id={cat.id + "budget-form"}>
                  <input id={cat.id + "budget-input"} />
                  <button type="submit">Add Budget</button>
                </form>
              </div>
            );
          })}
      </div>
    </section>
  );
}
