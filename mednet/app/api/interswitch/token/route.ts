import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/interswitchToken";

export async function GET() {
  try {
    const token = await getAccessToken();

    return NextResponse.json({ token });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}