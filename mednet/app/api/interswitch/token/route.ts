import { getAccessToken, getMerchantCode } from "@/lib/interswitchToken";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = await getAccessToken();
    const merchantCode = getMerchantCode();

    return NextResponse.json({ token, merchantCode });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}