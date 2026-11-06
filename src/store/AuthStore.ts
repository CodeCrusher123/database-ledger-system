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
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  },
  initAuthListener: () => {
    set({ status: { state: "loading" } });

    // 1. IMMEDIATE CHECK: Does a session exist currently ?
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
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

    // 2. PERMANENT LISTENER: Notify when SESSION changes later
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);

      // event can be: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
      if (event === "PASSWORD_RECOVERY" && session?.user) {
        set({
          status: { state: "recovery", user: session.user, session: session },
        });
      } else if (session?.user) {
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

    // CLEAN UP: return a function to unsubscribe
    return () => {
      subscription.unsubscribe();
    };
  },
}));
