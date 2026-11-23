import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesColumn,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export function MobileNav() {
  return (
    <nav className="mobile-layout-nav">
      <NavLink
        to="/dashboard"
        aria-label="Dashboard"
        className={({ isActive }) =>
          isActive ? "mobile-nav-link active" : "mobile-nav-link"
        }
      >
        <LayoutDashboard />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/transactions"
        aria-label="Transactions"
        className={({ isActive }) =>
          isActive ? "mobile-nav-link active" : "mobile-nav-link"
        }
      >
        <ArrowLeftRight />
        <span>Transactions</span>
      </NavLink>
      <NavLink
        to="/analytics"
        aria-label="Analytics"
        className={({ isActive }) =>
          isActive ? "mobile-nav-link active" : "mobile-nav-link"
        }
      >
        <ChartNoAxesColumn />
        <span>Analytics</span>
      </NavLink>
      <NavLink
        to="/budget"
        aria-label="Budget"
        className={({ isActive }) =>
          isActive ? "mobile-nav-link active" : "mobile-nav-link"
        }
      >
        <Wallet />
        <span>Budget</span>
      </NavLink>
    </nav>
  );
}
