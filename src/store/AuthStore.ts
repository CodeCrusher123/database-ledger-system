import { create } from "zustand";
import type { AuthStore } from "../utilities/AuthTypes";
import { supabase } from "../lib/supabaseClient";

export const useAuthStore = create<AuthStore>()((set) => ({
  status: { state: "loading" },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    return { error };
  },
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    return { error };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  },
  initAuthListener: () => {
    set({ status: { state: "loading" } });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        set({
          status: {
            state: "authenticated",
            user: session.user,
            session: session,
          },
        });
      } else {
        set({ status: { state: "unauthenticated" } });
      }
    });
  },
}));
