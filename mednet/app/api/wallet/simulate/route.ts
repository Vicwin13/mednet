import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { recordPatientFunding } from "@/lib/mednetWalletService";

interface SimulateWalletRequest {
  userId: string;
  amount: number;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body: SimulateWalletRequest = await request.json();
    const { userId, amount, description = "Simulated wallet funding" } = body;

    console.log("Simulate wallet request - userId:", userId, "amount:", amount);

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get user's profile to verify role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    console.log("Profile lookup result:", { profile, profileError });

    if (profileError || !profile) {
      console.error("Profile not found for userId:", userId, "Error:", profileError);
      return NextResponse.json({ error: `Profile not found for userId: ${userId}` }, { status: 404 });
    }

    // Only patients can simulate wallet funding
    if (profile.role !== "patient") {
      return NextResponse.json(
        { error: "Forbidden: Only patients can simulate wallet funding" },
        { status: 403 }
      );
    }

    // Get wallet for user
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Update wallet balance: balance += simulated_amount
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

    // Create transaction record in wallet_transactions table
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        patient_id: userId,
        transaction_type: "simulation",
        amount: amount,
        balance_after: newBalance,
        reference: `SIM_${userId}_${Date.now()}`,
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
      await recordPatientFunding(amount, `SIM_${userId}_${Date.now()}`);
    } catch (ledgerError) {
      console.error("Failed to record Mednet ledger entry:", ledgerError);
      // Continue even if ledger entry fails
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Simulated funding successful",
    });
  } catch (error) {
    console.error("Simulate wallet funding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
