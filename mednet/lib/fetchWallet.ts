import { getSupabaseClient } from "./supabase";

export async function fetchWallet(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  console.log("wallet:", data, "walletError:", error);
  if (error) throw error;
  return data;
}
