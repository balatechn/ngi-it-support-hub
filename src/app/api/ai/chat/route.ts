const KB_CONTEXT = `
You are the NGI IT Support AI Assistant for National Group India.
You help employees solve IT issues quickly and clearly.
Always give step-by-step instructions when applicable.
Be concise, friendly, and professional.
If you cannot solve the issue, suggest raising a ticket at /tickets/new.

KNOWLEDGE BASE SUMMARY:
- VPN: GlobalProtect VPN client. Download from company portal. Error 789 = certificate issue, reinstall client. Error 690 = credential issue, reset password.
- Password Reset: Go to aka.ms/sspr or call IT helpdesk. MFA required. Self-service available 24/7.
- Outlook sync: After Windows updates, go to File > Account Settings > Repair. If issue persists, remove and re-add account. OAuth token issue common after major updates.
- MFA Setup: Download Microsoft Authenticator app. Go to aka.ms/mfasetup. Scan QR code. Backup: use SMS or hardware token.
- Intune Enrollment: Settings > Accounts > Access work or school > Connect. Enter company email. Follow prompts. BYOD requires Company Portal app.
- Printer offline: Check physical connections, restart printer, delete print queue (services.msc > Print Spooler > restart), reinstall driver.
- Teams: Available on iOS, Android, Web, Desktop. Remote support via Teams screen share or Quick Assist (Windows key + Ctrl + Q).
- Software licenses: Request via IT portal at /tickets/new, category: Software. Include software name, version, business justification.
- New device setup: Submit request ticket. Allow 2-3 business days for Intune enrollment and software installation.
- Security: Never share passwords. Phishing emails should be reported to security@nationalgroupindia.com. Use built-in email reporting button.
`;

const MOCK_ANSWERS: Record<string, { content: string; sources: string[] }> = {
  vpn: {
    content: `## Connecting to the Company VPN

**Client:** GlobalProtect VPN

### Steps for Windows:
1. Download **GlobalProtect** from the IT portal (IT → Downloads)
2. Install and restart your computer
3. Open GlobalProtect from the system tray
4. Enter: \`vpn.nationalgroupindia.com\`
5. Sign in with your Microsoft 365 credentials

### Common errors:
- **Error 789** – Certificate issue → Uninstall & reinstall GlobalProtect
- **Error 690** – Wrong credentials → Reset your password at aka.ms/sspr
- **Firewall blocking** → Temporarily disable third-party firewall and retry

### For Mac:
Same steps — download the macOS version from the portal.

Still not working? Raise a [support ticket](/tickets/new) and select category **VPN**.`,
    sources: ["VPN Setup Guide", "GlobalProtect FAQ"],
  },
  password: {
    content: `## Resetting Your Microsoft 365 Password

### Self-service (24/7 — no IT required):
1. Go to **aka.ms/sspr** in your browser
2. Enter your work email address
3. Verify your identity via:
   - Microsoft Authenticator app notification
   - SMS to your registered number
   - Backup email
4. Create a new strong password (min. 12 characters)
5. Sign in to all devices with the new password

### Password requirements:
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Cannot reuse last 10 passwords

### If self-service fails:
Contact the IT helpdesk at **+44 20 XXXX XXXX** (business hours) or raise a [ticket](/tickets/new).`,
    sources: ["Password Reset Guide", "Microsoft 365 Self-Service"],
  },
  outlook: {
    content: `## Fixing Outlook Sync Issues After Windows Update

This is a known issue where Windows updates can break OAuth tokens.

### Quick fix (5 minutes):
1. Open Outlook
2. Go to **File → Account Settings → Account Settings**
3. Select your account → click **Repair**
4. Follow the wizard and re-enter your password
5. Restart Outlook

### If that doesn't work:
1. Remove the account: **File → Account Settings → Remove**
2. Restart Outlook
3. Re-add your account using your company email
4. Wait 5–10 minutes for full sync

### Registry fix (advanced):
Run this in PowerShell as admin:
\`Remove-Item "HKCU:\\Software\\Microsoft\\Office\\16.0\\Outlook\\AutoDiscover" -Recurse -Force\`

Still stuck? The IT team can push a fix via Intune remotely — [raise a ticket](/tickets/new).`,
    sources: ["Outlook Sync Fix", "Windows Update Known Issues"],
  },
  mfa: {
    content: `## Setting Up Multi-Factor Authentication (MFA)

### Step-by-step setup:
1. Go to **aka.ms/mfasetup** (sign in with your work account)
2. Click **+ Add sign-in method**
3. Choose **Authenticator app** (recommended)
4. Download **Microsoft Authenticator** on your phone (iOS/Android)
5. In the app: tap **+** → **Work or school account** → **Scan QR code**
6. Scan the QR code shown on your computer
7. Enter the 6-digit code to verify

### Backup methods:
- **SMS** – enter your mobile number as backup
- **Hardware token** – request one from IT if no smartphone available

### Lost your phone?
Contact IT immediately: security@nationalgroupindia.com or raise an [urgent ticket](/tickets/new) marked Critical.`,
    sources: ["MFA Setup Guide", "Microsoft Authenticator FAQ"],
  },
  printer: {
    content: `## Printer Offline — Troubleshooting Steps

### Step 1: Basic checks
- Confirm the printer is powered on and no error lights
- Check network/USB cable connection
- Try printing a test page from the printer itself

### Step 2: Clear the print queue
1. Press **Windows + R**, type \`services.msc\`, press Enter
2. Find **Print Spooler** → right-click → **Stop**
3. Navigate to \`C:\\Windows\\System32\\spool\\PRINTERS\`
4. Delete all files in this folder
5. Back in Services, **Start** the Print Spooler
6. Try printing again

### Step 3: Reinstall driver
1. Open **Settings → Bluetooth & devices → Printers & scanners**
2. Select the printer → **Remove**
3. Click **Add device** and let Windows find it
4. Or download the driver from the manufacturer's website

Still offline? [Raise a ticket](/tickets/new) with printer asset tag, floor, and room number.`,
    sources: ["Printer Troubleshooting Guide"],
  },
};

function smartResponse(messages: Array<{ role: string; content: string }>) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() ?? "";

  if (lastMsg.includes("vpn") || lastMsg.includes("connect") && lastMsg.includes("network")) {
    return MOCK_ANSWERS.vpn;
  }
  if (lastMsg.includes("password") || lastMsg.includes("reset") || lastMsg.includes("sspr")) {
    return MOCK_ANSWERS.password;
  }
  if (lastMsg.includes("outlook") || lastMsg.includes("email") || lastMsg.includes("sync")) {
    return MOCK_ANSWERS.outlook;
  }
  if (lastMsg.includes("mfa") || lastMsg.includes("authenticator") || lastMsg.includes("two-factor") || lastMsg.includes("2fa")) {
    return MOCK_ANSWERS.mfa;
  }
  if (lastMsg.includes("printer") || lastMsg.includes("print") || lastMsg.includes("offline")) {
    return MOCK_ANSWERS.printer;
  }
  if (lastMsg.includes("teams") || lastMsg.includes("screen share") || lastMsg.includes("remote")) {
    return {
      content: `## Microsoft Teams Remote Support

### Starting a screen share:
1. Open a Teams call with the IT support engineer
2. Click the **Share** icon (screen with arrow) in the call controls
3. Select your screen or a specific application window
4. The IT engineer can now see your screen

### Remote control (Quick Assist):
1. Press **Windows + Ctrl + Q** to open Quick Assist
2. The IT engineer will provide a **6-digit code**
3. Enter the code in Quick Assist
4. Click **Share screen** → Allow remote control

### Teams on mobile:
- Download **Microsoft Teams** from App Store / Google Play
- Sign in with your work account
- Tap **Calls** or **Chat** to reach IT support

Need assistance now? [Raise a ticket](/tickets/new) for a scheduled remote session.`,
      sources: ["Remote Support Guide", "Teams Quick Reference"],
    };
  }
  if (lastMsg.includes("intune") || lastMsg.includes("enroll") || lastMsg.includes("device")) {
    return {
      content: `## Enrolling a Device in Microsoft Intune

### Windows device:
1. Go to **Settings → Accounts → Access work or school**
2. Click **Connect**
3. Enter your work email: \`yourname@nationalgroupindia.com\`
4. Follow the prompts — your device will be enrolled automatically

### Mac / iOS / Android:
1. Download **Microsoft Intune Company Portal** from App Store / Play Store
2. Open the app and sign in with your work account
3. Follow the enrollment wizard
4. Install required policies when prompted

### What gets installed:
- Microsoft Defender (security)
- Required company apps
- Compliance policies (screen lock, encryption)

**Note:** IT has visibility into enrolled devices for security purposes. Personal files remain private.

Questions about BYOD? [Raise a ticket](/tickets/new) for clarification.`,
      sources: ["Intune Enrollment Guide", "BYOD Policy"],
    };
  }
  if (lastMsg.includes("license") || lastMsg.includes("software") || lastMsg.includes("adobe") || lastMsg.includes("install")) {
    return {
      content: `## Requesting a Software License

### How to request:
1. Go to [New Support Request](/tickets/new)
2. Select category: **Software**
3. Include:
   - Software name and version required
   - Business justification (why you need it)
   - Number of licenses needed
   - Preferred timeline

### Approval process:
- **Standard software** (MS Office, Zoom): Auto-approved, 1–2 business days
- **Licensed software** (Adobe CC, specialist tools): Requires manager approval, 3–5 days
- **Enterprise software**: IT + Finance approval, up to 10 days

### Free alternatives available:
- **Design:** Canva (company account available)
- **PDF editing:** Microsoft Word, Adobe Acrobat Reader
- **Video:** Microsoft Clipchamp

Check the IT portal for the full approved software catalogue.`,
      sources: ["Software Request Process", "Approved Software List"],
    };
  }

  return {
    content: `I can help you with that! Based on your question, here are some initial steps:

1. **Check the Knowledge Base** — search for your specific issue at [/knowledge-base](/knowledge-base)
2. **Try the basics first** — restart the affected application or device
3. **Check for updates** — outdated software causes many common issues

If the problem persists, I recommend:
- Documenting the exact error message or steps to reproduce
- Taking a screenshot of the issue
- [Raising a support ticket](/tickets/new) so our IT team can investigate

**What specific issue are you experiencing?** Tell me more and I can give you targeted troubleshooting steps.`,
    sources: [],
  };
}

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: Array<{ role: string; content: string }> };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Convert messages to Gemini format (role: "user" | "model")
      const geminiContents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: KB_CONTEXT }] },
            contents: geminiContents,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.4 },
          }),
        }
      );
      if (res.ok) {
        const d = await res.json();
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated.";
        return Response.json({ content: text, sources: [] });
      }
    } catch { /* fall through to mock */ }
  }

  // Smart mock response (used when GEMINI_API_KEY is not set)
  await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
  const mock = smartResponse(messages);
  return Response.json(mock);
}
