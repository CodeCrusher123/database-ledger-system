import { NavLink } from "react-router-dom";
import { useLedgerStore } from "../store/LedgerStore";
import type { AccountType } from "../utilities/LedgerTypes";
import "../styles/SideBar.css";

// Change: menu now has label + path, not just string
export const menuArray = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transactions", path: "/transactions" },
  { label: "Analytics", path: "/analytics" },
  { label: "Budget", path: "/budget" },
];

export type SideBarProps = {
  // Delete these two — no longer needed
  // activeTab: string;
  // onTabChange: (tab: string) => void;
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
};

export type AccountMenuProps = {
  input: AccountType;
  getBalance: (id: string) => number;
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
};

export function assertNever(x: never): never {
  throw new Error(`Unexpected error: ${x}`);
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  input,
  getBalance,
  selectedAccountId,
  onSelectAccount,
}) => {
  // ... your AccountMenu code stays exactly the same, no change ...
  switch (input.state) {
    case "idle":
    case "loading":
      return (
        <ul>
          <li>Loading accounts...</li>
        </ul>
      );
    case "error":
      return (
        <ul>
          <li>Failed to load accounts</li>
        </ul>
      );
    case "loaded": {
      if (input.data.length === 0) {
        return (
          <ul>
            <li>
              No accounts yet. <button>Add Account</button>
            </li>
          </ul>
        );
      } else {
        return (
          <ul>
            {input.data.map((acc) => (
              <li
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                style={{
                  background:
                    acc.id === selectedAccountId ? "lightblue" : "transparent",
                  cursor: "pointer",
                }}
              >
                {acc.name} - ₹{getBalance(acc.id) / 100}
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
};

export function SideBar({ selectedAccountId, onSelectAccount }: SideBarProps) {
  const accounts = useLedgerStore((s) => s.accounts);
  const getBalance = useLedgerStore((s) => s.getBalance);
  return (
    <div className="sidebar-container">
      <h2>LedgerPulse</h2>
      <ul className="menu-items-container">
        {menuArray.map((item) => (
          <li key={item.label} className="menu-item">
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                background: isActive ? "blue" : "transparent",
                cursor: "pointer",
                display: "block",
                color: isActive ? "white" : "inherit",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "8px",
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <h3>Accounts</h3>
      <div className="accounts-container">
        <AccountMenu
          input={accounts}
          getBalance={getBalance}
          selectedAccountId={selectedAccountId}
          onSelectAccount={onSelectAccount}
        />
      </div>
    </div>
  );
}
