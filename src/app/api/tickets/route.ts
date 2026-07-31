import { NextResponse } from "next/server";
import { ticketStore, genTicketId } from "@/lib/ticketStore";
import { sendEmail, ticketCreatedHtml } from "@/lib/email";

const ADMIN_EMAIL = "bala@nationalgroupindia.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = genTicketId();
    const now = new Date().toISOString();

    const ticket = {
      id,
      name:        body.name        ?? "Unknown",
      email:       body.email       ?? "",
      location:    body.location    ?? "",
      department:  body.department  ?? "",
      contact:     body.contact     ?? "",
      ticketType:  body.ticketType  ?? "issue",
      category:    body.category    ?? "other",
      priority:    body.priority    ?? "medium",
      description: body.description ?? "",
      status:      "open" as const,
      createdAt:   now,
      updatedAt:   now,
    };

    ticketStore.set(id, ticket);

    // Send confirmation emails (non-blocking — don't fail the request if email fails)
    const html = ticketCreatedHtml(ticket);
    const recipients = [ADMIN_EMAIL];
    if (ticket.email && ticket.email !== ADMIN_EMAIL) recipients.push(ticket.email);

    sendEmail({
      to: recipients,
      subject: `[${id}] New ${ticket.ticketType} – ${ticket.category} | ${ticket.name}`,
      html,
    }).catch(err => console.error("Email send error:", err));

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tickets error:", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function GET() {
  const tickets = Array.from(ticketStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(tickets);
}
