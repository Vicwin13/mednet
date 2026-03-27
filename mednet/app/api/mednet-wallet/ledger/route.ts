import { NextResponse } from "next/server";
import { getMednetLedgerEntries } from "@/lib/mednetWalletService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    const entries = await getMednetLedgerEntries(limit);
    
    return NextResponse.json({
      success: true,
      entries,
    });
  } catch (error) {
    console.error("Error fetching Mednet ledger entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch Mednet ledger entries" },
      { status: 500 }
    );
  }
}
