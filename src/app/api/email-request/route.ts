import { NextResponse } from "next/server";
import { sendEmail, ticketCreatedHtml } from "@/lib/email";
import {
  saveTicket, genTicketId,
  isRemote, remoteSaveTicket,
} from "@/lib/ticketStore";
import type { TicketRecord } from "@/lib/ticketStore";

const ADMIN_EMAIL = "bala@nationalgroupindia.com";

const TYPE_LABELS: Record<string, string> = {
  new_email:      "New Email ID Creation",
  password_reset: "Password Reset",
  email_renewal:  "Email Renewal / Reactivation",
  rename_profile: "Rename / Update Profile Name",
  other:          "Other Email Request",
};

const FIELD_LABELS: Record<string, string> = {
  requesterName:  "Requested By",
  requesterEmail: "Requester Email",
  department:     "Department",
  location:       "Location",
  phone:          "Phone / WhatsApp",
  newEmpName:     "New Employee Name",
  designation:    "Designation / Job Title",
  managerName:    "Manager Name",
  managerEmail:   "Manager Email",
  startDate:      "Joining / Start Date",
  targetEmail:    "Email Address",
  resetReason:    "Reason",
  renewalEmail:   "Email Address",
  renewalPeriod:  "Renewal Period",
  renewalReason:  "Reason",
  currentEmail:   "Current Email Address",
  currentName:    "Current Display Name",
  newName:        "New Display Name",
  renameReason:   "Reason for Change",
  otherEmail:     "Email Address (if applicable)",
  otherDetails:   "Request Details",
};

const TYPE_ACCENT: Record<string, string> = {
  new_email:      "#3B82F6",
  password_reset: "#EF4444",
  email_renewal:  "#F59E0B",
  rename_profile: "#8B5CF6",
  other:          "#6B7280",
};

function buildDescription(data: Record<string, string>): string {
  const skip = new Set(["requestType", "requesterName", "requesterEmail", "department", "location", "phone"]);
  const lines = Object.entries(data)
    .filter(([k, v]) => !skip.has(k) && v?.trim())
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
      return `${label}: ${v}`;
    });
  return lines.join("\n");
}

function emailRequestHtml(data: Record<string, string>, ticketId: string) {
  const typeLabel = TYPE_LABELS[data.requestType] ?? data.requestType;
  const accent    = TYPE_ACCENT[data.requestType] ?? "#C49020";

  const skip = new Set(["requestType"]);
  const rows = Object.entries(data)
    .filter(([k, v]) => !skip.has(k) && v?.trim())
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
      return `
      <tr>
        <td style="padding:9px 12px;font-size:12px;color:#8A9BB0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:38%;background:#f7f8fa;">${label}</td>
        <td style="padding:9px 12px;font-size:13px;color:#0F1D2E;font-weight:500;background:#fff;">${v}</td>
      </tr>`;
    });

  return `
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:580px;margin:0 auto;background:#f5f6fa;padding:24px;">
  <div style="background:#1A2B40;border-radius:12px 12px 0 0;padding:24px 28px;display:flex;align-items:center;gap:12px;">
    <div style="width:36px;height:36px;border-radius:8px;background:#C49020;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:#fff;font-weight:900;font-size:18px;">N</span>
    </div>
    <div>
      <p style="color:#fff;font-weight:700;font-size:16px;margin:0;">IT Support Hub</p>
      <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">National Group India — Email Account Request</p>
    </div>
  </div>

  <div style="background:#fff;border-radius:0 0 12px 12px;padding:28px;">
    <div style="display:flex;align-items:center;gap:10;margin-bottom:14px;">
      <div style="display:inline-block;padding:5px 14px;border-radius:99px;background:${accent}18;border:1px solid ${accent}40;margin-right:10px;">
        <span style="font-size:12px;font-weight:700;color:${accent};">${typeLabel}</span>
      </div>
      <span style="font-family:monospace;font-size:12px;color:#8A9BB0;background:#f0f1f5;padding:4px 10px;border-radius:6px;">${ticketId}</span>
    </div>
    <h2 style="color:#0F1D2E;font-size:18px;margin:0 0 6px;">New Email Account Request</h2>
    <p style="color:#4A5D72;font-size:14px;margin:0 0 22px;">Submitted via NGI IT Support Portal. This request is now in the <strong>Ticket Inbox</strong> — update its status there to notify the user.</p>

    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e8edf3;margin-bottom:20px;">
      ${rows.join("")}
    </table>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="color:#92400e;font-size:13px;margin:0;">
        ⚡ Please complete this request within <strong>24 hours</strong>. Update the ticket status in the IT Support Portal to notify the requester automatically.
      </p>
    </div>

    <div style="border-top:1px solid #e8edf3;padding-top:18px;">
      <p style="color:#8A9BB0;font-size:11px;margin:0;">Submitted on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST</p>
    </div>
  </div>
  <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px;">© 2026 National Group India · IT Support Hub</p>
</div>`;
}

export async function POST(req: Request) {
  try {
    const data: Record<string, string> = await req.json();
    const typeLabel = TYPE_LABELS[data.requestType] ?? data.requestType;
    const id  = genTicketId();
    const now = new Date().toISOString();

    // Build description from request-specific fields
    const description = `[${typeLabel}]\n${buildDescription(data)}`;

    // Priority mapping
    const priorityMap: Record<string, string> = {
      password_reset: "high",
      new_email:      "medium",
      email_renewal:  "medium",
      rename_profile: "low",
      other:          "low",
    };

    // Create ticket so it appears in the Ticket Inbox
    const ticket: TicketRecord = {
      id,
      name:        data.requesterName  ?? "Unknown",
      email:       data.requesterEmail ?? "",
      location:    data.location       ?? "",
      department:  data.department     ?? "",
      contact:     data.phone          ?? "",
      ticketType:  "request",
      category:    "email",
      priority:    priorityMap[data.requestType] ?? "medium",
      description,
      status:      "open",
      createdAt:   now,
      updatedAt:   now,
    };

    // Save ticket to inbox — best-effort, never blocks the email
    try {
      if (isRemote) {
        await remoteSaveTicket(ticket);
      } else {
        saveTicket(ticket);
      }
    } catch (ticketErr) {
      console.error("Ticket save error (non-fatal):", ticketErr);
    }

    // Send detailed email to IT admin — this is the primary action
    const adminHtml = emailRequestHtml(data, id);
    await sendEmail({
      to:      ADMIN_EMAIL,
      subject: `[${id}] Email Request: ${typeLabel} — ${data.requesterName ?? "User"}`,
      html:    adminHtml,
    });

    // Send confirmation to requester (fire-and-forget)
    if (data.requesterEmail && data.requesterEmail !== ADMIN_EMAIL) {
      const userHtml = ticketCreatedHtml(ticket);
      sendEmail({
        to:      data.requesterEmail,
        subject: `[${id}] Your Email Request received — ${typeLabel}`,
        html:    userHtml,
      }).catch(err => console.error("User confirmation email error:", err));
    }

    return NextResponse.json({ ok: true, ticketId: id });
  } catch (err) {
    console.error("Email request error:", err);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
