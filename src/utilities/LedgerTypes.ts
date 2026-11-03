export type Accounts = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type Transactions = {
  id: string;
  account_id: string;
  amount_cents: number;
  description: string | null;
  category_id: string | null;
  owner_id: string;
  created_at: string;
  transaction_date: string;
};

export type Categories = {
  id: string;
  name: string;
  color_hex: string | null;
  created_at: string;
  owner_id: string;
};

export type AccountType =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "loaded"; data: Accounts[] }
  | { state: "error"; error_message: string };

export type TransactionType =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "loaded"; data: Transactions[] }
  | { state: "error"; error_message: string };

export type CategoriesType =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "loaded"; data: Categories[] }
  | { state: "error"; error_message: string };

export type AddTransactionInput = {
  account_id: string;
  amount_cents: number;
  category_id: string | null;
  description: string | null;
};

export type AddAccountInput = {
  name: string;
};

export interface LedgerStore {
  // 1. States
  accounts: AccountType;
  transactions: TransactionType;
  categories: CategoriesType;

  // 2. Computed / Selectors
  getBalance: (id: string) => number;

  // 3. Actions
  fetchAll: () => Promise<void>;
  addTransaction: (input: AddTransactionInput) => Promise<{ error: Error }>;
  addAccount: (name: AddAccountInput) => Promise<{ error: Error }>;
  addCategory: (name: SelectCategory) => Promise<{ error: Error }>;
}

export type SelectCategory =
  | "foods and drink"
  | "transport"
  | "bill"
  | "medical"
  | "entertainment"
  | "housing"
  | "emergency"
  | "clothing"
  | "others";
