import { useOutletContext } from "react-router-dom";
import type { OutletContextType } from "./Dashboard";
import { useMemo, useState } from "react";
import "../styles/Analytics.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Sector,
  type PieSectorShapeProps,
  type LegendPayload,
} from "recharts";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const formatCategoryName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

const formatRupees = (cents: number) =>
  `₹${(cents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export function HorizontalChart() {
  const { transactions, selectedAccountId, categoriesMap } =
    useOutletContext<OutletContextType>();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const scopedTransactions = useMemo(() => {
    return transactions.state === "loaded"
      ? transactions.data.filter((trx) =>
          selectedAccountId ? trx.account_id === selectedAccountId : true,
        )
      : [];
  }, [transactions, selectedAccountId]);

  const calculatedExpenseTotals = useMemo(() => {
    return scopedTransactions.reduce(
      (acc, transaction) => {
        if (transaction.amount_cents > 0) return acc;

        const category =
          categoriesMap.get(transaction.category_id) ?? "Uncategorized";

        acc[category] =
          (acc[category] ?? 0) + Math.abs(transaction.amount_cents);

        return acc;
      },
      {} as Record<string, number>,
    );
  }, [scopedTransactions, categoriesMap]);

  const chartData = useMemo(() => {
    return Object.entries(calculatedExpenseTotals)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [calculatedExpenseTotals]);

  const totalExpenses = useMemo(
    () => chartData.reduce((sum, item) => sum + item.total, 0),
    [chartData],
  );

  const activeItem =
    activeIndex !== null && chartData[activeIndex]
      ? chartData[activeIndex]
      : null;

  const renderCategorySector = (props: PieSectorShapeProps) => {
    const isActive = activeIndex === props.index;
    const isDimmed = activeIndex !== null && !isActive;

    return (
      <Sector
        {...props}
        outerRadius={
          isActive ? (props.outerRadius ?? 100) + 5 : props.outerRadius
        }
        fill={COLORS[props.index % COLORS.length]}
        className={`donut-sector ${isDimmed ? "is-dimmed" : ""}`}
      />
    );
  };

  const renderDonutLegend = ({
    payload,
  }: {
    payload?: readonly LegendPayload[];
  }) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div className="donut-legend">
        {payload.map((entry, index) => {
          const item = chartData[index];
          if (!item) return null;

          const percentage =
            totalExpenses > 0
              ? ((item.total / totalExpenses) * 100).toFixed(1)
              : "0.0";
          const isActive = activeIndex === index;
          const isDimmed = activeIndex !== null && !isActive;
          const swatchColor = COLORS[index % COLORS.length];

          return (
            <button
              key={entry.value ?? item.category}
              type="button"
              className={`donut-legend-item ${isActive ? "is-active" : ""} ${
                isDimmed ? "is-dimmed" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <span
                className="donut-legend-dot"
                style={{ backgroundColor: swatchColor }}
              />
              <span className="donut-legend-name">
                {formatCategoryName(item.category)}
              </span>
              <span className="donut-legend-share">{percentage}%</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="expense-chart-card">
        <div className="expense-chart-header">
          <div>
            <h3 className="expense-chart-title">Expenses by Category</h3>
            <p className="expense-chart-description">
              Breakdown of your spending
            </p>
          </div>
        </div>

        <div className="expense-chart-container">
          {chartData.length === 0 ? (
            <div className="expense-chart-empty">
              No expense data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(220, chartData.length * 55)}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 25,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  tickFormatter={(value) => (value / 100).toLocaleString()}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                  tick={{
                    fill: "var(--primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                  tickFormatter={formatCategoryName}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={false}
                  formatter={(value: number) => [
                    formatRupees(Number(value)),
                    "Expenses",
                  ]}
                />

                <Bar
                  dataKey="total"
                  fill="var(--primary)"
                  radius={[0, 6, 6, 0]}
                  barSize={25}
                  activeBar={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="category-chart-card">
        <div className="category-chart-header">
          <div>
            <h3 className="category-chart-title">Spending Distribution</h3>
            <p className="category-chart-description">
              Share of expenses by category
            </p>
          </div>
        </div>

        <div className="category-chart-container">
          {chartData.length === 0 ? (
            <div className="expense-chart-empty">
              No expense data available.
            </div>
          ) : (
            <div className="donut-chart-wrapper">
              <ResponsiveContainer width="100%" height={340}>
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="44%"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={3}
                    stroke="var(--surface)"
                    strokeWidth={3}
                    shape={renderCategorySector}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />

                  <Tooltip
                    wrapperClassName="category-chart-tooltip"
                    formatter={(value: number, name) => [
                      formatRupees(Number(value)),
                      formatCategoryName(String(name ?? "")),
                    ]}
                  />

                  <Legend content={renderDonutLegend} verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>

              <div className="donut-center-label">
                <div className="donut-center-title">
                  {activeItem
                    ? formatCategoryName(activeItem.category)
                    : "Total Spent"}
                </div>
                <div className="donut-center-value">
                  {activeItem
                    ? formatRupees(activeItem.total)
                    : formatRupees(totalExpenses)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="category-chart-card">
        <div className="category-chart-header">
          <div>
            <h3 className="category-chart-title">6-Month Spending Trend</h3>
            <p className="category-chart-description">
              Monthly expenditure across the last 6 months
            </p>
          </div>
        </div>

        <div className="category-chart-container">
          <div className="trend-chart-placeholder">
            <p className="trend-chart-placeholder-title">Not enough data yet</p>
            <p className="trend-chart-placeholder-text">
              Add expenses across more dates and months to view your 6-month
              spending trend.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
