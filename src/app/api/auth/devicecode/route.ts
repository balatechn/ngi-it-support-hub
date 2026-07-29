import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const tenantId = process.env.AZURE_AD_TENANT_ID ?? "common";
  const clientId = process.env.AZURE_AD_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "AZURE_AD_CLIENT_ID not configured" }, { status: 503 });
  }

  const scope = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "User.Read",
    "DeviceManagementManagedDevices.Read.All",
    "Directory.Read.All",
  ].join(" ");

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/devicecode`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, scope }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error_description ?? "Failed to initiate device code flow" },
      { status: res.status }
    );
  }

  return NextResponse.json({
    device_code: data.device_code,
    user_code: data.user_code,
    verification_uri: data.verification_uri,
    verification_uri_complete: data.verification_uri_complete,
    expires_in: data.expires_in,
    interval: data.interval,
    message: data.message,
  });
}
