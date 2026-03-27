import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface CreateTransactionRequest {
  txnRef: string;
  amount: number;
}

// type Json =
//   | string
//   | number
//   | boolean
//   | null
//   | { [key: string]: Json | undefined }
//   | Json[];

// Helper function to get user from session
async function getUserFromSession(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // Get the authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  // Verify the token and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return user;
}

export async function POST(request: Request) {
  try {
    const body: CreateTransactionRequest = await request.json();
    const { txnRef, amount } = body;

    if (!txnRef || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user from session (don't trust userId from frontend)
    const user = await getUserFromSession(request);

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations
    const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

    // Get the wallet for the user
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Create a pending transaction record
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        patient_id: user.id,
        transaction_type: "funding",
        amount: amount,
        balance_after: Number(wallet.balance), // Current balance before payment
        reference: txnRef,
        description: "Wallet funding via Interswitch",
        status: "pending",
        metadata: {
          payment_gateway: "interswitch",
          created_at: new Date().toISOString(),
        },
      });

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      return NextResponse.json(
        { error: "Failed to create transaction record", details: transactionError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
