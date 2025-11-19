import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { code, error } = req.query as { code?: string; error?: string };

  if (error) {
    console.error("Freesound OAuth error:", error);
    // You can change this redirect to whatever error page/route you want
    res.writeHead(302, { Location: "/auth/error" });
    res.end();
    return;
  }

  if (!code) {
    res.status(400).send("Missing 'code' in callback");
    return;
  }

  const clientId = process.env.FREESOUND_CLIENT_ID;
  const clientSecret = process.env.FREESOUND_CLIENT_SECRET;
  const redirectUri =
    process.env.FREESOUND_REDIRECT_URI ||
    "https://edmshuffle.com/api/auth/freesound/callback"\;

  if (!clientId || !clientSecret) {
    console.error("Missing FREESOUND_CLIENT_ID or FREESOUND_CLIENT_SECRET env vars");
    res.status(500).send("Server misconfiguration");
    return;
  }

  try {
    const tokenRes = await fetch("https://freesound.org/apiv2/oauth2/access_token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Freesound token exchange failed:", errorText);
      res.writeHead(302, { Location: "/auth/error" });
      res.end();
      return;
    }

    const tokenData = await tokenRes.json();

    // TODO: store tokenData in your database or session
    // Example shape: { access_token, refresh_token, expires_in, scope, ... }

    // Redirect user back into your app's logged-in / dashboard area
    res.writeHead(302, { Location: "/dashboard" });
    res.end();
  } catch (err) {
    console.error("Unexpected error during Freesound OAuth callback:", err);
    res.writeHead(302, { Location: "/auth/error" });
    res.end();
  }
}
