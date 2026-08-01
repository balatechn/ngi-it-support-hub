// Shared Microsoft Graph API token helper (client credentials)
let _token = "";
let _tokenExpiry = 0;

export async function getGraphToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;

  const tenantId     = process.env.AZURE_AD_TENANT_ID!;
  const clientId     = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         "https://graph.microsoft.com/.default",
      }),
    }
  );

  if (!res.ok) throw new Error(`Graph token error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { access_token: string; expires_in: number };
  _token       = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  return _token;
}
