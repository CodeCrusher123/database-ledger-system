import { useLedgerStore } from "../store/LedgerStore";
import type { AccountType } from "../utilities/LedgerTypes";

export const menuArray: string[] = [
  "Dashboard",
  "Transactions",
  "Analytics",
  "Budget",
];

export type SideBarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export type AccountMenuProps = {
  input: AccountType;
  getBalance: (id: string) => number;
};

function assertNever(x: never): never {
  throw new Error(`Unexpected error: ${x}`);
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  input,
  getBalance,
}) => {
  switch (input.state) {
    case "idle":
      return (
        <ul>
          <li>Loading accounts...</li>
        </ul>
      );
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
              <li key={acc.id}>
                {acc.name} - Rs.{getBalance(acc.id) / 100}
              </li>
            ))}
          </ul>
        );
      }
    }
    default: {
      return (
        <ul>
          <li>{assertNever(input)}</li>
        </ul>
      );
    }
  }
};

export function SideBar({ activeTab, onTabChange }: SideBarProps) {
  const accounts = useLedgerStore((s) => s.accounts);
  const getBalance = useLedgerStore((s) => s.getBalance);
  return (
    <div className="sidebar-container">
      <h2>LedgerPulse</h2>
      <ul className="menu-items-container">
        {menuArray.map((item) => (
          <li
            key={item}
            className="menu-item"
            style={{ background: item === activeTab ? "blue" : "transparent" }}
            onClick={() => onTabChange(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <h3>Accounts</h3>
      <ul className="accounts-container">
        {<AccountMenu input={accounts} getBalance={getBalance} />}
      </ul>
    </div>
  );
}
