import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "No Graph token in session" }, { status: 401 });
  }

  const [meRes, photoRes] = await Promise.all([
    fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,assignedLicenses", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch("https://graph.microsoft.com/v1.0/me/photo/$metadata", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const me = meRes.ok ? await meRes.json() : null;
  if (!me) return NextResponse.json({ error: "Graph /me failed" }, { status: 502 });

  return NextResponse.json({ ...me, hasPhoto: photoRes.ok });
}
