import type {
  Accounts,
  Transactions,
  Categories,
  LedgerStore,
} from "../utilities/LedgerTypes";
import { supabase } from "../lib/supabaseClient";
import { create } from "zustand";

function makeState<T>(
  settledResult: any,
): { state: "loaded"; data: T } | { state: "error"; error_message: string } {
  if (settledResult.status === "rejected") {
    return { state: "error", error_message: settledResult.reason.message };
  }
  // since it is FULFILLED now , checking for Supabase error
  const res = settledResult.value;
  if (res.error) {
    return { state: "error", error_message: res.error.message };
  }
  return { state: "loaded", data: res.data as T };
}

export const useLedgerStore = create<LedgerStore>()((set, get) => ({
  accounts: { state: "idle" },
  transactions: { state: "idle" },
  categories: { state: "idle" },

  getBalance: (accountId: string) => {
    const txState = get().transactions;
    if (txState.state !== "loaded") return 0;
    return txState.data
      .filter((t) => t.account_id === accountId)
      .reduce((sum, t) => sum + t.amount_cents, 0);
  },

  fetchAll: async () => {
    // 1. Start LOADING
    set({
      accounts: { state: "loading" },
      transactions: { state: "loading" },
      categories: { state: "loading" },
    });

    // 2. Start FETCHING
    const results = await Promise.allSettled([
      supabase.from("accounts").select(),
      supabase.from("transactions").select(),
      supabase.from("categories").select(),
    ]);

    // 3. RESOLVING data & errors
    set({
      accounts: makeState<Accounts[]>(results[0]),
      transactions: makeState<Transactions[]>(results[1]),
      categories: makeState<Categories[]>(results[2]),
    });
  },

  addTransaction: async (_input) => {
    // TODO: implement Supabase insert + local state push for tea flow
    return { error: null };
  },
}));
