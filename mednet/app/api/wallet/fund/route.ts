import { NextResponse } from "next/server";
import { getMerchantCode } from "@/lib/interswitchToken";
import { getSupabaseClient } from "@/lib/supabase";

interface FundWalletRequest {
  userId: string;
  amount: number;
  txnRef: string;
  response: Record<string, unknown>;
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

export async function POST(request: Request) {
  try {
    const body: FundWalletRequest = await request.json();
    const { userId, amount, txnRef, response } = body;

    if (!userId || !amount || !txnRef) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Verify the transaction with Interswitch using the correct endpoint
    const merchantCode = getMerchantCode();
    if (!merchantCode) {
      return NextResponse.json(
        { error: "Merchant code not available" },
        { status: 500 }
      );
    }

    // Amount in kobo (lowest currency unit)
    const amountInKobo = Math.round(amount * 100);

    // Use the correct Interswitch transaction confirmation endpoint
    // Test URL: https://qa.interswitchng.com/collections/api/v1/gettransaction.json
    // Live URL: https://webpay.interswitchng.com/collections/api/v1/gettransaction.json
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://webpay.interswitchng.com"
      : "https://qa.interswitchng.com";

    const verifyResponse = await fetch(
      `${baseUrl}/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${txnRef}&amount=${amountInKobo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData: InterswitchTransactionResponse = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: "Transaction verification failed", details: verifyData },
        { status: 400 }
      );
    }

    // 2. Verify the response code - "00" means successful
    if (verifyData.ResponseCode !== "00") {
      return NextResponse.json(
        {
          error: "Payment not successful",
          responseCode: verifyData.ResponseCode,
          responseDescription: verifyData.ResponseDescription,
        },
        { status: 400 }
      );
    }

    // 3. CRITICAL: Verify the amount returned matches the original transaction amount
    if (verifyData.Amount !== amountInKobo) {
      return NextResponse.json(
        {
          error: "Amount mismatch - security violation",
          expectedAmount: amountInKobo,
          actualAmount: verifyData.Amount,
        },
        { status: 400 }
      );
    }

    // 4. Get the wallet for the user
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

    // 5. Update wallet balance
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

    // 6. Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        wallet_id: wallet.id,
        transaction_type: "funding",
        amount: amount,
        balance_after: newBalance,
        reference: txnRef,
        description: "Wallet funding via Interswitch",
        status: "completed",
        metadata: {
          payment_response: response,
          payment_gateway: "interswitch",
          interswitch_response: verifyData,
        },
      });

    if (transactionError) {
      console.error("Failed to create transaction record:", transactionError);
      // Continue even if transaction record fails
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
    console.error("Wallet funding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
