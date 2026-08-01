import { NextResponse } from "next/server";
import { getGraphToken } from "@/lib/graph";

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
  jobTitle: string | null;
  department: string | null;
  officeLocation: string | null;
  mobilePhone: string | null;
  accountEnabled: boolean;
}

export async function GET() {
  try {
    const token = await getGraphToken();

    // Fetch all enabled members (skip service accounts / guests by filtering accountEnabled)
    const res = await fetch(
      "https://graph.microsoft.com/v1.0/users" +
      "?$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,accountEnabled" +
      "&$filter=accountEnabled eq true" +
      "&$orderby=displayName" +
      "&$top=999",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json() as { value: GraphUser[] };
    return NextResponse.json(data.value);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Failed to fetch directory" }, { status: 500 });
  }
}
