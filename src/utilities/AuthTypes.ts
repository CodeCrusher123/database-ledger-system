import type { User, Session } from "@supabase/supabase-js";

export type AuthState =
  | { state: "loading" }
  | { state: "authenticated"; user: User; session: Session }
  | { state: "recovery"; user: User; session: Session }
  | { state: "unauthenticated" };

export interface AuthStore {
  status: AuthState;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  initAuthListener: () => void;
}
