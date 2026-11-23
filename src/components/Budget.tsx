import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "./Dashboard";
import { useMemo, useState } from "react";
import { useLedgerStore } from "../store/LedgerStore";
import "../styles/Budget.css";

export function Budget() {
  const { transactions, categories } = useOutletContext<OutletContextType>();
  const updateCategoryBudget = useLedgerStore((s) => s.updateCategoryBudget);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");

  const scopedTransactions = useMemo(() => {
    if (transactions.state !== "loaded") return [];
    return transactions.data.filter(
      (trx) => trx.transaction_date.slice(0, 7) === selectedMonth,
    );
  }, [transactions, selectedMonth]);

  const hasDataForMonth: boolean = scopedTransactions.length > 0;

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

  const getStatus = (budgeted: number, percent: number) => {
    if (budgeted === 0) return "No Budget";
    if (percent > 100) return "Exceeded";
    if (percent >= 80) return "Nearing Limit";
    return "On Track";
  };

  const displayBudgeted = hasDataForMonth ? totalBudgeted : 0;
  const displaySpent = hasDataForMonth ? totalSpent : 0;
  const displayRemaining = hasDataForMonth ? totalRemaining : 0;
  const displayPercent = hasDataForMonth ? totalPercent : 0;

  return (
    <section className="budget-container" aria-labelledby="budget-title">
      <header className="budget-header">
        <h2 id="budget-title" className="budget-title">
          Monthly Budget
        </h2>
        <label htmlFor="budget-month" className="budget-month-label">
          Month
        </label>
        <input
          id="budget-month"
          className="budget-month-input"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </header>
      {hasDataForMonth ? (
        <>
          <section className="budget-overview" aria-label="Budget overview">
            <h3 className="budget-overview-title">Budget Overview</h3>
            <div className="budget-overview-stats">
              <p className="budget-overview-stat">
                <span className="stat-label">Total Budgeted</span>
                <span className="stat-value">
                  ₹{(displayBudgeted / 100).toFixed(2)}
                </span>
              </p>
              <p className="budget-overview-stat">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value">
                  ₹{(displaySpent / 100).toFixed(2)}
                </span>
              </p>
              <p className="budget-overview-stat">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">
                  ₹{(displayRemaining / 100).toFixed(2)}
                </span>
              </p>
            </div>
            <div
              className="budget-overview-bar"
              role="progressbar"
              aria-valuenow={Math.round(displayPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="budget-overview-bar-fill"
                style={{ width: `${Math.min(totalPercent, 100)}%` }}
              />
            </div>
            <p className="budget-overview-percent">
              {Math.round(totalPercent)}%
            </p>
          </section>

          <ul className="category-list">
            {categories.state === "loaded" &&
              categories.data.map((cat) => {
                const spent = spentByCategoryId[cat.id] ?? 0;
                const budgeted = cat.monthly_budget_cents;
                const remaining = budgeted - spent;
                const percent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
                const status = getStatus(budgeted, percent);
                const isEditing = selectedCategory === cat.id;

                return (
                  <li key={cat.id} className="category-item">
                    <article className="category-card">
                      <h3 className="category-card-title">{cat.name}</h3>
                      <div className="category-card-stats">
                        <p className="category-card-stat">
                          Budgeted: ₹{(budgeted / 100).toFixed(2)}
                        </p>
                        <p className="category-card-stat">
                          Spent: ₹{(spent / 100).toFixed(2)}
                        </p>
                        <p className="category-card-stat">
                          Remaining: ₹{(remaining / 100).toFixed(2)}
                        </p>
                      </div>
                      <div
                        className="category-card-bar"
                        role="progressbar"
                        aria-valuenow={Math.round(percent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="category-card-bar-fill"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <p className="category-card-percent">
                        {Math.round(percent)}% - {status}
                      </p>

                      {isEditing ? (
                        <form
                          className="category-card-form"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            await updateCategoryBudget(
                              cat.id,
                              Number(budgetInput) * 100,
                            );
                            setBudgetInput("");
                            setSelectedCategory(null);
                          }}
                        >
                          <label
                            htmlFor={cat.id + "-budget-input"}
                            className="category-card-label"
                          >
                            Budget for {cat.name}
                          </label>
                          <input
                            id={cat.id + "-budget-input"}
                            className="category-card-input"
                            type="number"
                            min="0"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                          />
                          <button type="submit" className="category-card-save">
                            Save
                          </button>
                          <button
                            type="button"
                            className="category-card-cancel"
                            onClick={() => {
                              setSelectedCategory(null);
                              setBudgetInput("");
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="category-card-edit"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setBudgetInput(
                              budgeted > 0 ? String(budgeted / 100) : "",
                            );
                          }}
                        >
                          {budgeted > 0 ? "Edit Budget" : "Set Budget"}
                        </button>
                      )}
                    </article>
                  </li>
                );
              })}
          </ul>
        </>
      ) : (
        <p className="budget-empty">No data available for selected month.</p>
      )}
    </section>
  );
}
