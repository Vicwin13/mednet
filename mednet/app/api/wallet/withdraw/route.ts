import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface WithdrawRequest {
  userId: string;
  amount: number;
  bankAccountId?: string;
}

export async function POST(request: Request) {
  try {
    const body: WithdrawRequest = await request.json();
    const { userId, amount, bankAccountId } = body;

    if (!userId || !amount || amount < 1000) {
      return NextResponse.json(
        { error: "Minimum withdrawal is ₦1,000" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check sufficient balance
    if (!wallet.balance || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct from wallet
    const newBalance = Number(wallet.balance) - amount;

    const { error: updateError } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update wallet balance" },
        { status: 500 }
      );
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        patient_id: userId,
        transaction_type: "withdrawal",
        amount: amount,
        balance_after: newBalance,
        reference: `WITHDRAW_${userId}_${Date.now()}`,
        description: "Wallet withdrawal",
        status: "completed",
        metadata: {
          bank_account_id: bankAccountId,
          simulated_at: new Date().toISOString(),
        },
      });

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Withdrawal request submitted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error || "Internal server error" }, { status: 500 });
  }
}
