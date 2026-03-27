let accessToken: string | null = null;
let expiryTime: number | null = null;

export async function ninAccessToken() {
  const now = Date.now();

  if (accessToken && expiryTime && now < expiryTime) {
    return accessToken;
  }

  const clientId = process.env.NIN_CLIENT_ID!;
  const clientSecret = process.env.NIN_CLIENT_SECRET!;

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://qa.interswitchng.com/passport/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encoded}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "profile", 
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Token error:", data);
    throw new Error("Failed to get access token");
  }

  accessToken = data.access_token;
  expiryTime = now + data.expires_in * 1000 - 60000;

  return accessToken;
}