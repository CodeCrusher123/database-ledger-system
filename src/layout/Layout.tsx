import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar";
import { useLedgerStore } from "../store/LedgerStore";
import { useAuthStore } from "../store/AuthStore";
import { MobileNav } from "../components/MobileNav";
import "../styles/Layout.css";

export function Layout() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const accounts = useLedgerStore((s) => s.accounts);
  const transactions = useLedgerStore((s) => s.transactions);
  const categories = useLedgerStore((s) => s.categories);
  const fetchAll = useLedgerStore((s) => s.fetchAll);
  const availableAccounts = accounts.state === "loaded" ? accounts.data : [];
  const availableCategories =
    categories.state === "loaded" ? categories.data : [];

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (status.state === "unauthenticated") navigate("/signin");
  }, [navigate, status]);

  useEffect(() => {
    if (status.state === "authenticated") fetchAll();
  }, [status, fetchAll]);

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

  return (
    <div className="layout">
      <SideBar
        selectedAccountId={selectedAccountId}
        onSelectAccount={(id) =>
          setSelectedAccountId((prev) => (prev === id ? null : id))
        }
      />

      <main>
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
      <MobileNav />
    </div>
  );
}
