import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseURL || !supabasePublishableKey) {
  throw new Error("Missing  Supabase environment variables in .env.local");
}

export const supabase = createClient(supabaseURL, supabasePublishableKey);
