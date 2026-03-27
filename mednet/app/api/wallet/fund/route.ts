import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { recordPatientFunding } from "@/lib/mednetWalletService";

interface FundWalletRequest {
  userId: string;
  amount: number;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body: FundWalletRequest = await request.json();
    const { userId, amount, description = "Wallet funding" } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid userId or amount" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get wallet for user
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Update wallet balance
    const newBalance = Number(wallet.balance) + amount;

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
        transaction_type: "funding",
        amount: amount,
        balance_after: newBalance,
        reference: `FUND_${userId}_${Date.now()}`,
        description,
        status: "completed",
        metadata: {
          is_simulated: true,
          simulated_at: new Date().toISOString(),
        },
      });

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      // Continue even if transaction record fails
    }

    // Record ledger entry for Mednet (money IN to Mednet)
    try {
      await recordPatientFunding(amount, `FUND_${userId}_${Date.now()}`);
    } catch (ledgerError) {
      console.error("Failed to record Mednet ledger entry:", ledgerError);
      // Continue even if ledger entry fails
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Wallet funded successfully",
    });
  } catch (error) {
    console.error("Wallet funding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
