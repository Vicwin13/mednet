import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/interswitchToken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, nin } = body;

    if (!firstName || !lastName || !nin) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get token securely
    const token = await getAccessToken();

    const res = await fetch(
      "https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1/verify/identity/nin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          nin,
        }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Verification failed", details: data },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
