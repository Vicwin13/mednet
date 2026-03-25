import { getSupabaseClient } from "./supabase";

export async function fetchWallet(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
