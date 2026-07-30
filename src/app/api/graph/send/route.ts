import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as { accessToken?: string } | null;
  if (!session?.accessToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId, channelId, content } = await req.json();
  if (!teamId || !channelId || !content?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: { contentType: "text", content: content.trim() } }),
    }
  );
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
