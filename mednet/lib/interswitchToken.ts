let accessToken: string | null = null;
let expiryTime: number | null = null;
let merchantCode: string | null = null;

export function getMerchantCode() {
return merchantCode;
}
export async function getAccessToken() {
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

  accessToken = data.access_token;
  merchantCode = data.merchant_code;

  // ⏳ Save expiry (convert seconds → ms)
    expiryTime = now + data.expires_in * 1000;

  return accessToken;
}