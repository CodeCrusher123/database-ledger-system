import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SideBar } from "../components/SideBar";
import { useLedgerStore } from "../store/LedgerStore";
import { useAuthStore } from "../store/AuthStore";
import { MobileNav } from "../components/MobileNav";
import { Sun, Moon } from "lucide-react";
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

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock background scroll when open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("ledgerpulse-theme") as
      | "light"
      | "dark"
      | null;
    const initial = saved ?? "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ledgerpulse-theme", next);
  }

  useEffect(() => {
    if (status.state === "unauthenticated") navigate("/signin");
  }, [navigate, status]);

  useEffect(() => {
    if (status.state === "authenticated") fetchAll();
  }, [status, fetchAll]);

  function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  }

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
      <ScrollToTop />
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
