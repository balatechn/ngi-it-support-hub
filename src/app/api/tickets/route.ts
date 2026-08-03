import { NextResponse } from "next/server";
import {
  ticketStore, saveTicket, genTicketId,
  isRemote, remoteSaveTicket, remoteListTickets,
} from "@/lib/ticketStore";
import type { TicketRecord } from "@/lib/ticketStore";
import { sendEmail, ticketCreatedHtml } from "@/lib/email";

const ADMIN_EMAIL = "bala@nationalgroupindia.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id  = genTicketId();
    const now = new Date().toISOString();

    const ticket: TicketRecord = {
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
      status:      "open",
      createdAt:   now,
      updatedAt:   now,
    };

    if (isRemote) {
      await remoteSaveTicket(ticket);
    } else {
      saveTicket(ticket);
    }

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
  try {
    if (isRemote) {
      const tickets = await remoteListTickets();
      return NextResponse.json(tickets);
    }
    const tickets = Array.from(ticketStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(tickets);
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
