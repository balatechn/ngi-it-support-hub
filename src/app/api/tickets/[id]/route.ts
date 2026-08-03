import { NextResponse } from "next/server";
import { getTicket, patchTicket } from "@/lib/ticketStore";
import type { TicketNote } from "@/lib/ticketStore";
import { sendEmail, ticketStatusUpdateHtml } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session   = await getServerSession(authOptions);
    const updatedBy = session?.user?.name ?? "IT Support";

    const ticket = await getTicket(params.id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body      = await req.json();
    const oldStatus = ticket.status;
    const newStatus = body.status ?? ticket.status;
    const note: string | undefined = body.note;

    const historyEntry: TicketNote = {
      timestamp: new Date().toISOString(),
      updatedBy,
      oldStatus,
      newStatus,
      note: note || undefined,
    };

    const updated = await patchTicket(params.id, {
      status:  newStatus,
      history: [...(ticket.history ?? []), historyEntry],
    });

    if (!updated) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    if (oldStatus !== newStatus && ticket.email) {
      const html = ticketStatusUpdateHtml({
        id:          ticket.id,
        name:        ticket.name,
        category:    ticket.category,
        description: ticket.description,
        oldStatus,
        newStatus,
        updatedBy,
        note,
      });
      sendEmail({
        to:      ticket.email,
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
