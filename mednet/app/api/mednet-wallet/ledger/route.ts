import { NextResponse } from "next/server";
import { getMednetLedgerEntries } from "@/lib/mednetWalletService";

export async function GET(request: Request) {
  console.log('[DEBUG] /api/mednet-wallet/ledger: Request received');
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    console.log('[DEBUG] /api/mednet-wallet/ledger: Fetching entries with limit:', limit);
    const entries = await getMednetLedgerEntries(limit);
    console.log('[DEBUG] /api/mednet-wallet/ledger: Returning entries count:', entries?.length);
    
    return NextResponse.json({
      success: true,
      entries,
    });
  } catch (error) {
    console.error('[DEBUG] /api/mednet-wallet/ledger: Error fetching entries:', error);
    return NextResponse.json(
      { error: "Failed to fetch Mednet ledger entries" },
      { status: 500 }
    );
  }
}
