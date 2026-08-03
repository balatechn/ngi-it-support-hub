import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail({
      to:      "bala@nationalgroupindia.com",
      subject: "[TEST] NGI IT Support email check",
      html:    "<p>This is a test email from the NGI IT Support Portal. If you received this, email delivery is working correctly.</p>",
    });
    return NextResponse.json({ ok: true, message: "Test email sent successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
