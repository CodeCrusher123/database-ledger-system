import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "./Dashboard";
import { HorizontalChart } from "./HorizontalChart";
import "../styles/Analytics.css";

export function Analytics() {
  const { accounts, transactions, selectedAccountId, setSelectedAccountId } =
    useOutletContext<OutletContextType>();

  const accountList = accounts.state === "loaded" ? accounts.data : [];

  const scopedTransactions =
    transactions.state === "loaded"
      ? transactions.data.filter((trx) =>
          selectedAccountId ? trx.account_id === selectedAccountId : true,
        )
      : [];

  const totalInflowCents = scopedTransactions
    .filter((trx) => trx.amount_cents > 0)
    .reduce((sum, trx) => sum + trx.amount_cents, 0);

  const totalOutflowCents = scopedTransactions
    .filter((trx) => trx.amount_cents < 0)
    .reduce((sum, trx) => sum + Math.abs(trx.amount_cents), 0);

  const netCashFlow = (totalInflowCents - totalOutflowCents) / 100;

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(selectedAccountId === accountId ? null : accountId);
  };

  return (
    <section className="analysis-page" aria-labelledby="analysis-title">
      <header className="page-header">
        <h2 id="analysis-title" className="page-title">
          Analysis
        </h2>

        <nav className="account-filter" aria-label="Filter by account">
          <button
            type="button"
            className={`account-filter-btn ${selectedAccountId === null ? "is-active" : ""} analysis-filter-btn`}
            onClick={() => setSelectedAccountId(null)}
          >
            All Accounts
          </button>

          {accountList.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                className={`account-filter-btn ${isSelected ? "is-active" : ""} analysis-filter-btn`}
                aria-pressed={isSelected}
                onClick={() => handleAccountSelect(acc.id)}
              >
                {acc.name}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="kpi-grid" role="region" aria-label="Cash flow summary">
        <article className="kpi-card kpi-card--inflow">
          <h3 className="kpi-label">Total Inflow</h3>
          <p className="kpi-value">₹{(totalInflowCents / 100).toFixed(2)}</p>
        </article>

        <article className="kpi-card kpi-card--outflow">
          <h3 className="kpi-label">Total Outflow</h3>
          <p className="kpi-value">₹{(totalOutflowCents / 100).toFixed(2)}</p>
        </article>

        <article
          className={`kpi-card kpi-card--netflow ${
            netCashFlow > 0
              ? "is-positive"
              : netCashFlow < 0
                ? "is-negative"
                : "is-neutral"
          }`}
        >
          <h3 className="kpi-label">Net Cash Flow</h3>
          <p className="kpi-value">
            {netCashFlow > 0 ? "+" : ""}₹{netCashFlow.toFixed(2)}
          </p>
        </article>
      </div>
      <HorizontalChart />
    </section>
  );
}
