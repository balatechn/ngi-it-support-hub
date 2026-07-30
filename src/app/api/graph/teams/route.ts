import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    "https://graph.microsoft.com/v1.0/me/joinedTeams?$select=id,displayName",
    { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" }
  );
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
