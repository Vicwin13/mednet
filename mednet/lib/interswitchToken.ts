let accessToken: string | null = null;
let expiryTime: number | null = null;

export function getMerchantCode(): string {
  // Merchant code is a fixed value from your Interswitch account
  // It should be set in your environment variables
  const merchantCode = process.env.INTERSWITCH_MERCHANT_CODE;
  
  if (!merchantCode) {
    throw new Error("INTERSWITCH_MERCHANT_CODE environment variable is not set");
  }
  
  return merchantCode;
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // ✅ Reuse token if still valid
  if (accessToken && expiryTime && now < expiryTime) {
    return accessToken;
  }

  const res = await fetch("https://apps.qa.interswitchng.com/passport/oauth/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(
        `${process.env.INTERSWITCH_CLIENT_ID}:${process.env.INTERSWITCH_CLIENT_SECRET}`
      ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Failed to get access token: ${res.status}`);
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("No access token in response");
  }

  const token : string = data.access_token;

  accessToken = token;

  // ⏳ Save expiry (convert seconds → ms)
  expiryTime = now + data.expires_in * 1000;

  return accessToken;
}