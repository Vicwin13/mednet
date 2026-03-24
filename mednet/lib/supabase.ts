import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Return cached instance if it exists (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey);
  return supabaseInstance;
}
