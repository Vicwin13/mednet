import { NextResponse } from "next/server";
import { getMednetBalance } from "@/lib/mednetWalletService";

export async function GET() {
  console.log('[DEBUG] /api/mednet-wallet/balance: Request received');
  try {
    const balance = await getMednetBalance();
    console.log('[DEBUG] /api/mednet-wallet/balance: Returning balance:', balance);
    
    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('[DEBUG] /api/mednet-wallet/balance: Error fetching balance:', error);
    return NextResponse.json(
      { error: "Failed to fetch Mednet wallet balance" },
      { status: 500 }
    );
  }
}
