function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const HEADER = `
  <div style="background:#1A2B40;padding:18px 24px;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="width:36px;height:36px;background:#C49020;border-radius:8px;text-align:center;vertical-align:middle;">
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 19V3L19 19V3" stroke="#FFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </td>
      <td style="padding-left:10px;">
        <p style="margin:0;color:#fff;font-weight:700;font-size:14px;line-height:1.2;">IT Support Hub</p>
        <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">National Group India</p>
      </td>
    </tr></table>
  </div>`;

const CTA = `
  <div style="text-align:center;margin:28px 0 8px;">
    <a href="https://itsupport.nationalgroupindia.com/teams"
      style="display:inline-block;background:#1A2B40;color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:600;font-size:14px;">
      Open IT Support Hub →
    </a>
  </div>`;

function footer(toEmail: string) {
  return `<div style="text-align:center;padding:20px 24px 28px;color:#B0A898;font-size:11px;line-height:1.6;">
    Sent to ${esc(toEmail)} · National Group India IT Support Hub<br>You receive this because you are the IT Support admin.
  </div>`;
}

function wrap(body: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4F1;font-family:system-ui,-apple-system,sans-serif;">
${HEADER}<div style="max-width:560px;margin:0 auto;padding:28px 20px 8px;">${body}${CTA}</div>`;
}

type Payload =
  | { type: "chat";         channelName: string; teamName: string; messages: { sender: string; time: string; content: string }[] }
  | { type: "screen_share"; userName: string }
  | { type: "session_code"; userName: string; code: string };

export async function POST(req: Request) {
  const apiKey  = process.env.RESEND_API_KEY;
  if (!apiKey)  return Response.json({ skipped: "RESEND_API_KEY not set" }, { status: 200 });

  const toEmail = process.env.NOTIFY_EMAIL ?? "bala@nationalgroupindia.com";
  const payload = await req.json() as Payload;

  let subject = "";
  let html    = "";

  if (payload.type === "chat") {
    const { channelName, teamName, messages } = payload;
    if (!messages?.length) return Response.json({ ok: true });
    const count = messages.length;
    subject = `[IT Support] ${count} new message${count > 1 ? "s" : ""} in #${channelName}`;
    html = wrap(`
      <h1 style="margin:0 0 4px;color:#1A2B40;font-size:18px;font-weight:700;">
        ${count} new message${count > 1 ? "s" : ""} in <span style="color:#C49020;">#${esc(channelName)}</span>
      </h1>
      <p style="margin:0 0 24px;color:#6A7588;font-size:13px;">${esc(teamName ?? "Microsoft Teams")}</p>
      ${messages.map(m => `
      <div style="background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:10px;border-left:3px solid #C49020;box-shadow:0 1px 4px rgba(26,43,64,0.07);">
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;"><tr>
          <td style="font-weight:600;color:#1A2B40;font-size:14px;">${esc(m.sender)}</td>
          <td style="padding-left:10px;color:#B0A898;font-size:12px;">${esc(m.time)}</td>
        </tr></table>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.55;">${esc(m.content)}</p>
      </div>`).join("")}
    `) + footer(toEmail) + `</body></html>`;

  } else if (payload.type === "screen_share") {
    const { userName } = payload;
    subject = `[IT Support] ${userName} is sharing their screen`;
    html = wrap(`
      <div style="text-align:center;padding:12px 0 24px;">
        <div style="width:56px;height:56px;background:#1A2B40;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C49020" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/>
          </svg>
        </div>
        <h1 style="margin:0 0 8px;color:#1A2B40;font-size:20px;font-weight:700;">${esc(userName)} is sharing their screen</h1>
        <p style="margin:0 0 20px;color:#6A7588;font-size:14px;line-height:1.5;">
          A user has started a screen sharing session and needs your assistance.<br>
          Open IT Support Hub to connect with them now.
        </p>
      </div>
    `) + footer(toEmail) + `</body></html>`;

  } else if (payload.type === "session_code") {
    const { userName, code } = payload;
    subject = `[IT Support] Remote session requested — Code: ${code}`;
    html = wrap(`
      <div style="text-align:center;padding:12px 0 8px;">
        <h1 style="margin:0 0 6px;color:#1A2B40;font-size:20px;font-weight:700;">${esc(userName)} needs remote assistance</h1>
        <p style="margin:0 0 24px;color:#6A7588;font-size:14px;">Enter this code in the IT Support Hub agent panel to connect.</p>
        <div style="background:#0F1D2E;border-radius:14px;padding:20px 32px;display:inline-block;margin-bottom:20px;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:1px;text-transform:uppercase;">Session Code</p>
          <p style="margin:0;font-family:monospace;font-size:36px;font-weight:800;letter-spacing:0.22em;color:#F0F9FF;">${esc(code)}</p>
        </div>
        <p style="margin:0 0 4px;color:#B0A898;font-size:12px;">Code expires in 10 minutes.</p>
        <p style="margin:0 0 24px;color:#6A7588;font-size:13px;">
          Open IT Support Hub → <strong>Screen tab</strong> → enter the code above to match the session.
        </p>
      </div>
    `) + footer(toEmail) + `</body></html>`;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM ?? "IT Support Hub <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html,
    }),
  });

  return Response.json(await res.json(), { status: res.ok ? 200 : res.status });
}
