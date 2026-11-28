import { NavLink } from "react-router-dom";
import { useLedgerStore } from "../store/LedgerStore";
import type { AccountType } from "../utilities/LedgerTypes";
import { HamburgerMenu } from "./Hamburger";
import "../styles/SideBar.css";

export const menuArray = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transactions", path: "/transactions" },
  { label: "Analytics", path: "/analytics" },
  { label: "Budget", path: "/budget" },
];

export type SideBarProps = {
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
  switch (input.state) {
    case "idle":
    case "loading":
      return (
        <ul>
          <li className="sidebar-account-state">Loading accounts...</li>
        </ul>
      );
    case "error":
      return (
        <ul>
          <li className="sidebar-account-state sidebar-account-error">
            Failed to load accounts
          </li>
        </ul>
      );
    case "loaded": {
      if (input.data.length === 0) {
        return (
          <ul>
            <li className="sidebar-account-state">
              No accounts yet.{" "}
              <button className="add-account-btn">Add Account</button>
            </li>
          </ul>
        );
      } else {
        return (
          <ul>
            {input.data.map((acc) => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <li
                  key={acc.id}
                  className={`sidebar-accounts-list ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectAccount(acc.id)}
                >
                  <span className="account-name">{acc.name}</span>
                  <span className="account-balance">
                    ₹{(getBalance(acc.id) / 100).toFixed(2)}
                  </span>
                </li>
              );
            })}
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
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
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
      <div className="sidebar-footer">
        <HamburgerMenu />
      </div>
    </div>
  );
}
