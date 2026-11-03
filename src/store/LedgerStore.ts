import type {
  Accounts,
  Transactions,
  Categories,
  LedgerStore,
  SelectCategory,
  AccountType,
  TransactionType,
  CategoriesType,
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
  accounts: { state: "idle" } as AccountType,
  transactions: { state: "idle" } as TransactionType,
  categories: { state: "idle" } as CategoriesType,

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

  addTransaction: async (input) => {
    // 1. Get user for owner_id
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error("No user") as any }; // For SAVE fails UI fallback
    }
    const insertData = {
      ...input, // account_id, amount_cents, category_id, description
      owner_id: user.id, // 5th field
    };
    // 2. Insert and get back full row
    const { data: newTransaction, error } = await supabase
      .from("transactions")
      .insert(insertData)
      .select()
      .single();

    // 3. If error, return it (don't push)
    if (error) {
      return { error };
    }
    // 4. If success, push to local Zustand state
    const current = get().transactions;
    if (current.state === "loaded" && newTransaction) {
      set({
        transactions: {
          state: "loaded",
          data: [...current.data, newTransaction as Transactions],
        },
      });
    } else if (newTransaction) {
      set({
        transactions: {
          state: "loaded",
          data: [newTransaction as Transactions],
        },
      });
    }
    return { error: null };
  },

  addAccount: async (input) => {
    if (input.name.trim().length === 0) {
      return { error: new Error("Name cannot be empty") as any };
    }
    if (input.name.trim().length > 50) {
      return {
        error: new Error("Too long name. Please use a shorter one") as any,
      };
    }

    // Fetch USER ID from supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error("No user") as any }; // For SAVE fails UI fallback
    }

    const insertData = { name: input.name.trim(), owner_id: user.id };

    const { data: newAccount, error } = await supabase
      .from("accounts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { error };
    }

    const current = get().accounts;
    if (current.state === "loaded" && newAccount) {
      set({
        accounts: {
          state: "loaded",
          data: [...current.data, newAccount as Accounts],
        },
      });
    } else if (newAccount) {
      set({
        accounts: {
          state: "loaded",
          data: [newAccount as Accounts],
        },
      });
    }

    return { error: null };
  },

  addCategory: async (name: SelectCategory) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error("No user") as any };
    }

    const insertData = { name: name.trim(), owner_id: user.id };

    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { error };
    }

    const current = get().categories;
    if (current.state === "loaded" && newCategory) {
      set({
        categories: {
          state: "loaded",
          data: [...current.data, newCategory],
        },
      });
    } else if (newCategory) {
      set({
        categories: {
          state: "loaded",
          data: [newCategory as Categories],
        },
      });
    }
    return { error: null };
  },
}));
