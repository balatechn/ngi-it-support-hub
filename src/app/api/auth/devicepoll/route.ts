import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { device_code } = await req.json();

  const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  if (!clientId || !device_code) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    client_id: clientId,
    device_code,
  });

  if (clientSecret) body.append("client_secret", clientSecret);

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    // authorization_pending → still waiting; slow_down → back off; expired_token / access_denied → terminal
    return NextResponse.json(
      { error: data.error, error_description: data.error_description },
      { status: res.status }
    );
  }

  // Exchange access_token for user profile from Graph
  const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const me = meRes.ok ? await meRes.json() : null;

  return NextResponse.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    id_token: data.id_token,
    expires_in: data.expires_in,
    user: me
      ? {
          id: me.id,
          name: me.displayName,
          email: me.userPrincipalName,
          jobTitle: me.jobTitle,
          department: me.department,
          officeLocation: me.officeLocation,
        }
      : null,
  });
}
