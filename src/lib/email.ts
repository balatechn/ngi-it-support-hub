import { getGraphToken } from "@/lib/graph";

const SENDER = process.env.SMTP_USER ?? "connect@nationalgroupindia.com";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const token  = await getGraphToken();
  const toList = (Array.isArray(to) ? to : [to]).map(addr => ({
    emailAddress: { address: addr },
  }));

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${SENDER}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          from: { emailAddress: { address: SENDER, name: "NGI IT Support" } },
          toRecipients: toList,
        },
        saveToSentItems: false,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail ${res.status}: ${text}`);
  }
}

export function ticketCreatedHtml(ticket: {
  id: string;
  name: string;
  location: string;
  department: string;
  contact: string;
  ticketType: string;
  category: string;
  priority: string;
  description: string;
}) {
  return `
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f6fa;padding:24px;">
  <div style="background:#1A2B40;border-radius:12px 12px 0 0;padding:24px 28px;display:flex;align-items:center;gap:12px;">
    <div style="width:36px;height:36px;border-radius:8px;background:#C49020;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:#fff;font-weight:900;font-size:18px;">N</span>
    </div>
    <div>
      <p style="color:#fff;font-weight:700;font-size:16px;margin:0;">IT Support Hub</p>
      <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0;">National Group India</p>
    </div>
  </div>
  <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px;">
    <h2 style="color:#0F1D2E;font-size:18px;margin:0 0 6px;">Ticket Raised Successfully</h2>
    <p style="color:#4A5D72;font-size:14px;margin:0 0 20px;">Hi ${ticket.name}, your support ticket has been received. Our team will be in touch shortly.</p>

    <div style="background:#0F1D2E;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="color:rgba(255,255,255,0.4);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Ticket ID</p>
      <p style="color:#F0F9FF;font-family:monospace;font-size:24px;font-weight:800;letter-spacing:0.06em;margin:0;">${ticket.id}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      ${[
        ["Type", ticket.ticketType.charAt(0).toUpperCase() + ticket.ticketType.slice(1)],
        ["Category", ticket.category],
        ["Priority", ticket.priority],
        ["Location", ticket.location],
        ["Department", ticket.department],
        ["Contact", ticket.contact],
      ].map(([l, v], i) => `
      <tr style="background:${i % 2 === 0 ? "#f7f8fa" : "#fff"};">
        <td style="padding:9px 12px;font-size:12px;color:#8A9BB0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:38%;">${l}</td>
        <td style="padding:9px 12px;font-size:13px;color:#0F1D2E;font-weight:500;">${v}</td>
      </tr>`).join("")}
    </table>

    <div style="background:#f0f9f4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="color:#166534;font-size:13px;font-weight:500;margin:0;">
        ✅ You will receive updates by email as the ticket progresses. Average response time: <strong>2–4 hours</strong>.
      </p>
    </div>

    <p style="color:#8A9BB0;font-size:12px;margin:0 0 24px;">
      If you have additional details to add, please reply to this email quoting your Ticket ID.
    </p>

    <div style="border-top:1px solid #e8edf3;padding-top:18px;margin-top:4px;">
      <p style="color:#4A5D72;font-size:13px;margin:0 0 2px;">Regards,</p>
      <p style="color:#0F1D2E;font-size:14px;font-weight:600;margin:0 0 6px;">Balasubramanian</p>
      <p style="color:#8A9BB0;font-size:11px;margin:0;">IT Support · National Group India</p>
    </div>
  </div>
  <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px;">© 2026 National Group India · IT Support Hub</p>
</div>`;
}

export function ticketStatusUpdateHtml(ticket: {
  id: string;
  name: string;
  category: string;
  description: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
  note?: string;
}) {
  const statusColors: Record<string, string> = {
    open: "#3B82F6",
    in_progress: "#F59E0B",
    pending: "#8B5CF6",
    resolved: "#10B981",
    closed: "#6B7280",
  };
  const color = statusColors[ticket.newStatus] ?? "#3B82F6";
  const label = ticket.newStatus.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

  return `
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f5f6fa;padding:24px;">
  <div style="background:#1A2B40;border-radius:12px 12px 0 0;padding:24px 28px;">
    <p style="color:#fff;font-weight:700;font-size:16px;margin:0;">IT Support Hub — National Group India</p>
  </div>
  <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px;">
    <h2 style="color:#0F1D2E;font-size:18px;margin:0 0 6px;">Ticket Status Updated</h2>
    <p style="color:#4A5D72;font-size:14px;margin:0 0 20px;">Hi ${ticket.name}, your ticket <strong>${ticket.id}</strong> has been updated.</p>

    <div style="display:flex;gap:12px;align-items:center;background:#f7f8fa;border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="text-align:center;flex:1;">
        <p style="font-size:11px;color:#8A9BB0;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Previous</p>
        <span style="font-size:13px;font-weight:600;color:#6B7280;">${ticket.oldStatus.replace("_", " ")}</span>
      </div>
      <div style="font-size:20px;color:#C49020;">→</div>
      <div style="text-align:center;flex:1;">
        <p style="font-size:11px;color:#8A9BB0;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">New Status</p>
        <span style="display:inline-block;padding:4px 14px;border-radius:99px;font-size:13px;font-weight:700;background:${color}20;color:${color};">${label}</span>
      </div>
    </div>

    ${ticket.note ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="color:#92400e;font-size:13px;font-weight:600;margin:0 0 4px;">Note from IT Support:</p>
      <p style="color:#78350f;font-size:13px;margin:0;">${ticket.note}</p>
    </div>` : ""}

    <p style="color:#4A5D72;font-size:13px;margin:0 0 4px;">Updated by: <strong>${ticket.updatedBy}</strong></p>
    <p style="color:#8A9BB0;font-size:12px;margin:0 0 24px;">Category: ${ticket.category}</p>

    <div style="border-top:1px solid #e8edf3;padding-top:18px;margin-top:4px;">
      <p style="color:#4A5D72;font-size:13px;margin:0 0 2px;">Regards,</p>
      <p style="color:#0F1D2E;font-size:14px;font-weight:600;margin:0 0 6px;">Balasubramanian</p>
      <p style="color:#8A9BB0;font-size:11px;margin:0;">IT Support · National Group India</p>
    </div>
  </div>
  <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px;">© 2026 National Group India · IT Support Hub</p>
</div>`;
}
