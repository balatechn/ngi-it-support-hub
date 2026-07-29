import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

async function graphGet(url: string, token: string) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${url}`, {
    headers: { Authorization: `Bearer ${token}`, ConsistencyLevel: "eventual" },
  });
  return res.ok ? res.json() : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, groups, devices, skus] = await Promise.all([
    graphGet("/users?$count=true&$top=1", token),
    graphGet("/groups?$count=true&$top=1", token),
    graphGet("/deviceManagement/managedDevices?$count=true&$top=1", token),
    graphGet("/subscribedSkus", token),
  ]);

  const licenseCount =
    skus?.value?.reduce(
      (sum: number, sku: { consumedUnits: number }) => sum + (sku.consumedUnits ?? 0),
      0
    ) ?? null;

  const compliant =
    devices?.value
      ? devices.value.filter((d: { complianceState: string }) => d.complianceState === "compliant").length
      : null;

  return NextResponse.json({
    userCount: users?.["@odata.count"] ?? null,
    groupCount: groups?.["@odata.count"] ?? null,
    deviceCount: devices?.["@odata.count"] ?? null,
    compliantDevices: compliant,
    licensesAssigned: licenseCount,
    skus: skus?.value?.map((s: { skuPartNumber: string; consumedUnits: number; prepaidUnits: { enabled: number } }) => ({
      name: s.skuPartNumber,
      consumed: s.consumedUnits,
      total: s.prepaidUnits?.enabled,
    })) ?? [],
  });
}
