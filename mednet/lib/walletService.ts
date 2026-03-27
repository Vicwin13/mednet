import { Database } from "@/types/supabase";
import { getSupabaseClient } from "./supabase";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
// type WalletTransaction = Database["public"]["Tables"]["wallet_transactions"]["Row"];

export interface WalletWithProfile extends Wallet {
  profiles: {
    role: "patient" | "hospital";
    firstname: string | null;
    lastname: string | null;
    hospitalname: string | null;
  };
}

/**
 * Fetch wallet for authenticated user (security: only own wallet)
 */
export async function fetchWallet(userId: string): Promise<Wallet | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Fetch wallet with profile info
 */
export async function fetchWalletWithProfile(userId: string): Promise<WalletWithProfile | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("wallets")
    .select(`
      *,
      profiles!inner (
        role,
        firstname,
        lastname,
        hospitalname
      )
    `)
    .eq("user_id", userId)
    .single();
  
  if (error) throw error;
  return data as WalletWithProfile;
}

/**
 * Fetch transaction history for wallet
 */
export async function fetchWalletTransactions(walletId: string, limit: number = 20) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

/**
 * Check if wallet exists, create if not (on user registration)
 */
export async function ensureWalletExists(userId: string) {
  const supabase = getSupabaseClient();
  
  const { data: existingWallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId)
    .single();
  
  if (existingWallet) return existingWallet;
  
  // Create new wallet
  const { data, error } = await supabase
    .from("wallets")
    .insert({
      user_id: userId,
      balance: 0,
      currency: "NGN",
      is_active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
