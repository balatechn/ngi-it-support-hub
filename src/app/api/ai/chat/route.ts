const SYSTEM_PROMPT = `You are the NGI IT Support AI Assistant for National Group India.
You help employees solve IT issues quickly, clearly, and step-by-step.
Be concise, friendly, and professional.
Format responses with markdown: use ## headings, - bullet lists, **bold** for key terms, numbered steps.
If you cannot solve the issue, suggest raising a ticket at /tickets/new.
Keep responses under 400 words unless the issue requires more detail.

KNOWLEDGE BASE:
- VPN: GlobalProtect client. Download from IT portal. Error 789 = certificate issue, reinstall. Error 690 = credential issue, reset password at aka.ms/sspr.
- Password Reset: Go to aka.ms/sspr. MFA required. Self-service 24/7. Min 12 chars, uppercase + lowercase + number, no reuse of last 10.
- Outlook sync: After Windows updates → File > Account Settings > Repair. If fails: remove + re-add account. OAuth token breaks on major updates.
- MFA Setup: Download Microsoft Authenticator. Go to aka.ms/mfasetup. Scan QR code. Backup: SMS or hardware token. Lost phone → email security@nationalgroupindia.com urgently.
- Intune Enrollment: Settings > Accounts > Access work or school > Connect. BYOD: install Company Portal app. Mac/iOS/Android: Company Portal from App Store / Play Store.
- Printer offline: Check cables/power, clear print queue (services.msc > Print Spooler > Stop, delete C:\\Windows\\System32\\spool\\PRINTERS, Start). Reinstall driver if needed.
- Teams: Remote support via screen share or Quick Assist (Win + Ctrl + Q). Available on iOS, Android, Web, Desktop.
- Software licenses: Request at /tickets/new → category: Software. Include name, version, business justification. Standard: 1-2 days. Licensed (Adobe CC): 3-5 days with manager approval.
- New device setup: Submit ticket. Allow 2-3 business days for Intune enrollment and software installation.
- Security: Never share passwords. Phishing → report to security@nationalgroupindia.com or use the Outlook report button.
- Wi-Fi issues: Forget network and reconnect. Check if other devices affected. Corporate SSID: NGI-Corporate. Guest: NGI-Guest (no internal access).
- SharePoint / OneDrive: Sync issues → restart OneDrive from system tray. Right-click → Settings → Account → unlink + relink.`;

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: Array<{ role: string; content: string }> };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiContents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiContents,
            generationConfig: { maxOutputTokens: 1500, temperature: 0.4 },
          }),
        }
      );

      if (res.ok && res.body) {
        const encoder = new TextEncoder();
        const upstream = res.body.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            let buf = "";
            while (true) {
              const { done, value } = await upstream.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split("\n");
              buf = lines.pop() ?? "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const raw = line.slice(6).trim();
                if (!raw || raw === "[DONE]") continue;
                try {
                  const json = JSON.parse(raw);
                  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                } catch { /* skip malformed chunks */ }
              }
            }
            // flush remainder
            if (buf.startsWith("data: ")) {
              const raw = buf.slice(6).trim();
              if (raw && raw !== "[DONE]") {
                try {
                  const json = JSON.parse(raw);
                  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                } catch { /* ignore */ }
              }
            }
            controller.close();
          },
          cancel() { upstream.cancel(); },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          },
        });
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      /* fall through to mock */
    }
  }

  // ── Smart mock fallback (used when GEMINI_API_KEY is not set) ──
  await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
  const mock = smartMock(messages);
  return Response.json(mock);
}

// ── Mock responses for local dev without API key ──────────────
function smartMock(messages: Array<{ role: string; content: string }>) {
  const q = messages[messages.length - 1]?.content?.toLowerCase() ?? "";

  if (q.includes("vpn") || (q.includes("connect") && q.includes("network"))) return MOCKS.vpn;
  if (q.includes("password") || q.includes("reset") || q.includes("sspr")) return MOCKS.password;
  if (q.includes("outlook") || q.includes("email") || q.includes("sync")) return MOCKS.outlook;
  if (q.includes("mfa") || q.includes("authenticator") || q.includes("two-factor") || q.includes("2fa")) return MOCKS.mfa;
  if (q.includes("printer") || q.includes("print") || q.includes("offline")) return MOCKS.printer;
  if (q.includes("teams") || q.includes("screen share") || q.includes("remote")) return MOCKS.teams;
  if (q.includes("intune") || q.includes("enroll") || q.includes("device")) return MOCKS.intune;
  if (q.includes("license") || q.includes("software") || q.includes("adobe") || q.includes("install")) return MOCKS.software;

  return {
    content: `I can help with that!\n\n1. **Check the Knowledge Base** — search at [/knowledge-base](/knowledge-base)\n2. **Try the basics** — restart the affected app or device\n3. **Check for updates** — outdated software causes many common issues\n\nIf the problem persists, [raise a support ticket](/tickets/new) with details and a screenshot.\n\nWhat specific issue are you facing?`,
    sources: [],
  };
}

const MOCKS: Record<string, { content: string; sources: string[] }> = {
  vpn: {
    content: `## Connecting to the Company VPN\n\n**Client:** GlobalProtect VPN\n\n### Steps for Windows:\n1. Download **GlobalProtect** from the IT portal\n2. Install and restart your computer\n3. Open GlobalProtect from the system tray\n4. Enter: \`vpn.nationalgroupindia.com\`\n5. Sign in with your Microsoft 365 credentials\n\n### Common errors:\n- **Error 789** – Certificate issue → Uninstall & reinstall GlobalProtect\n- **Error 690** – Wrong credentials → Reset password at aka.ms/sspr\n\nStill not working? [Raise a support ticket](/tickets/new) → category **VPN**.`,
    sources: ["VPN Setup Guide", "GlobalProtect FAQ"],
  },
  password: {
    content: `## Resetting Your Microsoft 365 Password\n\n### Self-service (24/7):\n1. Go to **aka.ms/sspr**\n2. Enter your work email\n3. Verify via Microsoft Authenticator, SMS, or backup email\n4. Create a new strong password (min. 12 characters)\n\n### Password rules:\n- Minimum 12 characters\n- Must include uppercase, lowercase, and a number\n- Cannot reuse last 10 passwords\n\n### If self-service fails:\n[Raise a ticket](/tickets/new) — IT can reset it manually during business hours.`,
    sources: ["Password Reset Guide"],
  },
  outlook: {
    content: `## Fixing Outlook Sync Issues After Windows Update\n\n### Quick fix:\n1. Open Outlook → **File → Account Settings → Repair**\n2. Follow the wizard and re-enter your password\n3. Restart Outlook\n\n### If that doesn't work:\n1. **File → Account Settings → Remove** your account\n2. Restart Outlook\n3. Re-add your company email — wait 5–10 minutes for sync\n\nStill stuck? [Raise a ticket](/tickets/new) — IT can push a fix via Intune.`,
    sources: ["Outlook Sync Fix"],
  },
  mfa: {
    content: `## Setting Up Multi-Factor Authentication\n\n1. Go to **aka.ms/mfasetup** and sign in\n2. Click **+ Add sign-in method** → choose **Authenticator app**\n3. Download **Microsoft Authenticator** on your phone\n4. In the app: **+** → **Work or school account** → **Scan QR code**\n5. Scan the code shown on screen and enter the 6-digit verification code\n\n### Backup methods:\n- **SMS** — enter your mobile number as backup\n- **Hardware token** — request from IT if no smartphone\n\n**Lost your phone?** Contact IT immediately at security@nationalgroupindia.com.`,
    sources: ["MFA Setup Guide"],
  },
  printer: {
    content: `## Printer Offline — Troubleshooting\n\n### Step 1: Basic checks\n- Printer is powered on and no error lights\n- Cable/network connection is secure\n\n### Step 2: Clear the print queue\n1. Press **Win + R**, type \`services.msc\`\n2. Find **Print Spooler** → right-click → **Stop**\n3. Go to \`C:\\Windows\\System32\\spool\\PRINTERS\` and delete all files\n4. **Start** Print Spooler again\n5. Try printing\n\n### Step 3: Reinstall driver\n- **Settings → Printers & scanners** → Remove → Add device\n\n[Raise a ticket](/tickets/new) with the printer asset tag if still not working.`,
    sources: ["Printer Troubleshooting Guide"],
  },
  teams: {
    content: `## Microsoft Teams Remote Support\n\n### Screen share in a call:\n1. Start a call with the IT engineer\n2. Click the **Share** icon in call controls\n3. Choose your screen or a specific window\n\n### Quick Assist (remote control):\n1. Press **Windows + Ctrl + Q**\n2. The IT engineer provides a 6-digit code\n3. Enter the code → click **Share screen** → Allow remote control\n\n### Teams on mobile:\n- Download Microsoft Teams from App Store / Google Play\n- Sign in with your work account\n\n[Raise a ticket](/tickets/new) to schedule a remote session.`,
    sources: ["Remote Support Guide"],
  },
  intune: {
    content: `## Enrolling a Device in Microsoft Intune\n\n### Windows:\n1. **Settings → Accounts → Access work or school → Connect**\n2. Enter your work email\n3. Follow the prompts — device enrolled automatically\n\n### Mac / iOS / Android:\n1. Download **Microsoft Intune Company Portal**\n2. Sign in with your work account\n3. Follow the enrollment wizard\n\n### What gets installed:\n- Microsoft Defender (security)\n- Required company apps\n- Compliance policies (screen lock, encryption)\n\nPersonal files remain private. [Questions? Raise a ticket](/tickets/new).`,
    sources: ["Intune Enrollment Guide"],
  },
  software: {
    content: `## Requesting a Software License\n\n1. Go to [New Support Request](/tickets/new)\n2. Select category: **Software**\n3. Include:\n   - Software name and version\n   - Business justification\n   - Number of licenses\n   - Preferred timeline\n\n### Approval timeline:\n- **Standard software** (Office, Zoom): Auto-approved, 1–2 days\n- **Licensed software** (Adobe CC): Manager approval, 3–5 days\n- **Enterprise software**: IT + Finance approval, up to 10 days`,
    sources: ["Software Request Process"],
  },
};
