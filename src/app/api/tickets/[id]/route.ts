import { NextResponse } from "next/server";
import { ticketStore } from "@/lib/ticketStore";
import { sendEmail, ticketStatusUpdateHtml } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const updatedBy = session?.user?.name ?? "IT Support";

    const ticket = ticketStore.get(params.id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await req.json();
    const oldStatus = ticket.status;
    const newStatus = body.status ?? ticket.status;
    const note: string | undefined = body.note;

    const updated = { ...ticket, status: newStatus, updatedAt: new Date().toISOString() };
    ticketStore.set(params.id, updated);

    // Email the ticket raiser when status changes
    if (oldStatus !== newStatus && ticket.email) {
      const html = ticketStatusUpdateHtml({
        id: ticket.id,
        name: ticket.name,
        category: ticket.category,
        description: ticket.description,
        oldStatus,
        newStatus,
        updatedBy,
        note,
      });

      sendEmail({
        to: ticket.email,
        subject: `[${ticket.id}] Status updated → ${newStatus.replace("_", " ")}`,
        html,
      }).catch(err => console.error("Email send error:", err));
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/tickets/[id] error:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
