import { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar";
import { useLedgerStore } from "../store/LedgerStore";

export function Layout() {
  const navigate = useNavigate();
  const accounts = useLedgerStore((s) => s.accounts);
  const transactions = useLedgerStore((s) => s.transactions);
  const categories = useLedgerStore((s) => s.categories);
  const availableAccounts = accounts.state === "loaded" ? accounts.data : [];
  const availableCategories =
    categories.state === "loaded" ? categories.data : [];

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const accountsMap = useMemo(() => {
    const map = new Map<string, string>();
    availableAccounts.forEach((acc) => {
      map.set(acc.id, acc.name);
    });
    return map;
  }, [availableAccounts]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    availableCategories.forEach((cat) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [availableCategories]);

  function handleTabChange(tab: string) {
    setActiveTab(tab);

    if (tab === "Dashboard") navigate("/dashboard");
    if (tab === "Transactions") navigate("/transactions");
    if (tab === "Analytics") navigate("/analytics");
    if (tab === "Budget") navigate("/budget");
  }

  return (
    <div className="dashboard-layout">
      <SideBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedAccountId={selectedAccountId}
        onSelectAccount={(id) =>
          setSelectedAccountId((prev) => (prev === id ? null : id))
        }
      />

      <main className="dashboard-main">
        {/* Outlet is the hole - Router puts Dashboard / Transactions here */}
        <Outlet
          context={{
            selectedAccountId,
            setSelectedAccountId,
            accounts,
            transactions,
            categories,
            accountsMap,
            categoriesMap,
          }}
        />
      </main>
    </div>
  );
}
