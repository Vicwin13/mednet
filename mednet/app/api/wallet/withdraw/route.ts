import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

interface WithdrawRequest {
  amount: number;
  bankAccountId: string;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile to verify role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only hospitals can withdraw
    if (profile.role !== "hospital") {
      return NextResponse.json({ error: "Forbidden: Only hospitals can withdraw" }, { status: 403 });
    }

    const body: WithdrawRequest = await request.json();
    const { amount, bankAccountId } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Minimum withdrawal is ₦1,000" }, { status: 400 });
    }

    if (!bankAccountId) {
      return NextResponse.json({ error: "Bank account is required" }, { status: 400 });
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check sufficient balance
    if (!wallet.balance || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // TODO: Implement withdrawal logic with bank transfer
    // For now, return a success response
    // In production, this would:
    // 1. Create a withdrawal transaction record
    // 2. Deduct amount from wallet balance
    // 3. Initiate bank transfer via payment gateway
    // 4. Update transaction status

    return NextResponse.json({ 
      success: true, 
      message: "Withdrawal request submitted successfully",
      note: "Bank transfer integration pending implementation"
    });
  } catch (error) {
    return NextResponse.json({ error:error || "Internal server error" }, { status: 500 });
  }
}
