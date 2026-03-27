import { getAccessToken, getMerchantCode } from "@/lib/interswitchToken";

import { Database } from "@/types/supabase";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface VerifyPaymentRequest {
  txnRef: string;
  amount: number; // Amount in kobo (lowest currency unit)
}

interface InterswitchTransactionResponse {
  Amount: number;
  CardNumber: string;
  MerchantReference: string;
  PaymentReference: string;
  RetrievalReferenceNumber: string;
  SplitAccounts: unknown[];
  TransactionDate: string;
  ResponseCode: string;
  ResponseDescription: string;
  AccountNumber: string;
}

// Extended transaction interface to match actual database schema
interface TransactionRow {
  id: string;
  amount: number;
  status: string;
  wallet_id: string;
  balance_after: number | null;
  reference: string | null;
  description: string | null;
  transaction_type: string | null;
  metadata: Json | null;
  created_at: string | null;
}

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
    const body: VerifyPaymentRequest = await request.json();
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
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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

    // Get the merchant code
    const merchantCode = getMerchantCode();
    if (!merchantCode) {
      return NextResponse.json(
        { error: "Merchant code not available" },
        { status: 500 }
      );
    }

    // Verify the transaction with Interswitch
    const baseUrl = "https://qa.interswitchng.com";

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Unable to retrieve access token for user authentication");
    }
    
    const verifyResponse = await fetch(
      `${baseUrl}/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${txnRef}&amount=${amount}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData: InterswitchTransactionResponse = await verifyResponse.json();

    if (!verifyResponse.ok) {
      // Update transaction status to failed
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          metadata: {
            ...{ payment_gateway: "interswitch" },
            verification_error: verifyData as unknown as Json,
          },
        })
        .eq("reference", txnRef);

      return NextResponse.json(
        { error: "Transaction verification failed", details: verifyData },
        { status: 400 }
      );
    }

    // Verify the response code - "00" means successful
    if (verifyData.ResponseCode !== "00") {
      // Update transaction status to failed
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          metadata: {
            ...{ payment_gateway: "interswitch" },
            response_code: verifyData.ResponseCode,
            response_description: verifyData.ResponseDescription,
            verification_response: verifyData as unknown as Json,
          },
        })
        .eq("reference", txnRef);

      return NextResponse.json(
        {
          error: "Payment not successful",
          responseCode: verifyData.ResponseCode,
          responseDescription: verifyData.ResponseDescription,
        },
        { status: 400 }
      );
    }

    // CRITICAL: Verify the amount returned matches the original transaction amount
    if (verifyData.Amount !== amount) {
      // Update transaction status to failed
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          metadata: {
            ...{ payment_gateway: "interswitch" },
            amount_mismatch: {
              expected: amount,
              actual: verifyData.Amount,
            },
            verification_response: verifyData as unknown as Json,
          },
        })
        .eq("reference", txnRef);

      return NextResponse.json(
        {
          error: "Amount mismatch - security violation",
          expectedAmount: amount,
          actualAmount: verifyData.Amount,
        },
        { status: 400 }
      );
    }

    // Get the pending transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("reference", txnRef)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Type cast to TransactionRow to access metadata
    const typedTransaction = transaction as TransactionRow;

    // Check if transaction is already completed (prevent double crediting)
    if (typedTransaction.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Transaction already processed",
        newBalance: wallet.balance,
      });
    }

    // Convert amount from kobo to naira for wallet balance
    const amountInNaira = amount / 100;

    // Update wallet balance
    const newBalance = Number(wallet.balance) + amountInNaira;

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

    // Update transaction status to completed
const existingMetadata = (typedTransaction.metadata as Record<string, Json>) ?? {};

const { error: updateTransactionError } = await supabase
  .from("wallet_transactions")
  .update({
    status: "completed",
    balance_after: newBalance,
    metadata: {
      ...existingMetadata,
      interswitch_response: JSON.parse(JSON.stringify(verifyData)) as Json,
      payment_reference: verifyData.PaymentReference,
      retrieval_reference: verifyData.RetrievalReferenceNumber,
      transaction_date: verifyData.TransactionDate,
      verified_at: new Date().toISOString(),
    },
  })
  .eq("id", typedTransaction.id);

    if (updateTransactionError) {
      console.error("Failed to update transaction record:", updateTransactionError);
      // Continue even if transaction record update fails
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Wallet funded successfully",
      interswitchData: {
        paymentReference: verifyData.PaymentReference,
        retrievalReferenceNumber: verifyData.RetrievalReferenceNumber,
        transactionDate: verifyData.TransactionDate,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
