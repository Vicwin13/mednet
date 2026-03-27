import { NextResponse } from "next/server";
import { getMednetBalance } from "@/lib/mednetWalletService";

export async function GET() {
  try {
    const balance = await getMednetBalance();
    
    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error("Error fetching Mednet wallet balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch Mednet wallet balance" },
      { status: 500 }
    );
  }
}
