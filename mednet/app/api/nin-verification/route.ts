import { NextResponse } from "next/server";
import { ninAccessToken } from "@/lib/ninAccessToken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, nin } = body;

    if (!firstName || !lastName || !nin) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Get a valid Bearer token (cached)
    const token = await ninAccessToken();

    // 2. Call the NIN verification endpoint with the Bearer token
    const res = await fetch(
      "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/nin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, nin }),
      }
    );

    const data = await res.json();
    console.log("NIN Verification response:", data);

    if (!res.ok) {
      console.error("Verification failed:", data);
      return NextResponse.json(
        { error: "Verification failed", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("NIN verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
