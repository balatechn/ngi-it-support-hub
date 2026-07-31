"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, ChevronUp, Shield, Zap, Users, Globe, Eye, EyeOff } from "lucide-react";

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
    <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
    <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
    <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const NGILogo = ({ size = 36 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} viewBox="0 0 22 22" fill="none">
      <path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: "AI-Powered Support", desc: "Instant answers from your company knowledge base" },
  { icon: <Shield className="w-5 h-5" />, title: "Enterprise Security", desc: "Microsoft 365 SSO with zero-trust access controls" },
  { icon: <Users className="w-5 h-5" />, title: "Real-time Tracking", desc: "Live ticket status with SLA monitoring & alerts" },
  { icon: <Globe className="w-5 h-5" />, title: "Multi-channel Alerts", desc: "Instant WhatsApp & email notifications" },
];

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDevCode, setShowDevCode] = useState(false);
  const [devStep, setDevStep] = useState<"init" | "polling" | "error">("init");
  const [deviceUrl, setDeviceUrl] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [devError, setDevError] = useState("");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const handleMicrosoft = async () => {
    setLoading(true);
    try {
      await signIn("azure-ad", { callbackUrl: "/tickets/new" });
    } catch {
      setLoading(false);
    }
  };

  const startDeviceCode = async () => {
    setDevStep("polling");
    setDevError("");
    try {
      const r = await fetch("/api/auth/devicecode");
      if (!r.ok) throw new Error("Failed to start device code flow");
      const d = await r.json();
      setDeviceUrl(d.verification_uri);
      setDeviceCode(d.user_code);
      const interval = setInterval(async () => {
        try {
          const poll = await fetch(`/api/auth/devicepoll?device_code=${d.device_code}`);
          const pd = await poll.json();
          if (pd.access_token) {
            clearInterval(interval);
            const me = await fetch("https://graph.microsoft.com/v1.0/me", {
              headers: { Authorization: `Bearer ${pd.access_token}` },
            });
            const meData = await me.json();
            const result = await signIn("device-code", {
              redirect: false,
              access_token: pd.access_token,
              name: meData.displayName,
              email: meData.userPrincipalName,
              userId: meData.id,
              jobTitle: meData.jobTitle,
            });
            if (result?.ok) router.replace("/tickets/new");
            else { clearInterval(interval); setDevError("Authentication failed. Please try again."); setDevStep("error"); }
          }
        } catch { /* still polling */ }
      }, 5000);
      setTimeout(() => { clearInterval(interval); setDevStep("error"); setDevError("Code expired. Please try again."); }, 120000);
    } catch (err: unknown) {
      setDevError(err instanceof Error ? err.message : "An error occurred");
      setDevStep("error");
    }
  };

  if (status === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--page-bg)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gold)" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "inherit" }}>

      {/* ── Left Brand Panel (desktop only) ── */}
      <div className="hidden lg:flex" style={{ flexDirection: "column", justifyContent: "space-between", padding: "48px", background: "linear-gradient(160deg, #1A2B40 0%, #0F1D2E 60%, #0A1628 100%)", position: "relative", overflow: "hidden", width: "44%" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,144,32,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,120,180,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <NGILogo size={42} />
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.2 }}>IT Support Hub</p>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>National Group India</p>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Enterprise IT<br />support,{" "}
            <span style={{ color: "#C49020" }}>reimagined.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            Raise tickets, track progress, and get AI-powered answers — all in one intelligent platform built for National Group India.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="anim-fade-up" style={{ display: "flex", alignItems: "flex-start", gap: 14, animationDelay: `${0.1 + i * 0.08}s` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(196,144,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C49020", flexShrink: 0, border: "1px solid rgba(196,144,32,0.2)" }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{f.title}</p>
                  <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 12, position: "relative" }}>
          © 2026 National Group India · All rights reserved
        </p>
      </div>

      {/* ── Right Auth Panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: "var(--page-bg)" }}>
        <div className="flex lg:hidden" style={{ alignItems: "center", gap: 10, marginBottom: 40 }}>
          <NGILogo size={36} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>IT Support Hub</p>
            <p style={{ color: "var(--text-3)", fontSize: 11 }}>National Group India</p>
          </div>
        </div>

        <div className="anim-fade-up" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ background: "var(--surface)", borderRadius: 24, padding: "40px 36px", boxShadow: "var(--sh-xl)", border: "1px solid var(--border-1)" }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome back</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.5 }}>
                Sign in with your National Group India Microsoft account to continue.
              </p>
            </div>

            <button onClick={handleMicrosoft} disabled={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "15px 24px", background: "#0078D4", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.18s ease", boxShadow: "0 2px 12px rgba(0,120,212,0.28)", marginBottom: 16 }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MicrosoftIcon />}
              {loading ? "Signing in…" : "Sign in with Microsoft"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
              <span style={{ color: "var(--text-3)", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border-1)" }} />
            </div>

            <button onClick={() => { setShowDevCode(v => !v); if (!showDevCode) { setDevStep("init"); setDevError(""); }}}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", color: "var(--text-2)", fontSize: 13, fontWeight: 500 }}>
              <span>Admin / Device Code sign-in</span>
              {showDevCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDevCode && (
              <div className="anim-scale" style={{ marginTop: 12, padding: "20px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border-2)" }}>
                {devStep === "init" && (
                  <>
                    <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                      For devices without a browser or for elevated admin access. You&apos;ll get a code to enter at Microsoft&apos;s device login page.
                    </p>
                    <button onClick={startDeviceCode} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", color: "var(--text-1)", fontSize: 13, fontWeight: 500 }}>
                      Start Device Code Flow
                    </button>
                  </>
                )}
                {devStep === "polling" && deviceCode && (
                  <div style={{ textAlign: "center" }}>
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#C49020", marginBottom: 12 }} />
                    <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 16 }}>
                      Go to <strong style={{ color: "var(--text-1)" }}>{deviceUrl}</strong> and enter:
                    </p>
                    <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                      <div style={{ background: "#0F1D2E", color: "#fff", borderRadius: 10, padding: "12px 28px", fontFamily: "monospace", fontSize: 30, fontWeight: 700, letterSpacing: "0.2em" }}>
                        {showCode ? deviceCode : "••• •••"}
                      </div>
                      <button onClick={() => setShowCode(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
                        {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p style={{ color: "var(--text-3)", fontSize: 12 }}>Waiting for authentication…</p>
                  </div>
                )}
                {devStep === "error" && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{devError}</p>
                    <button onClick={() => setDevStep("init")} style={{ padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", color: "var(--text-1)", fontSize: 13 }}>
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )}

            <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 12, marginTop: 24 }}>
              Having trouble?{" "}
              <a href="mailto:it-support@nationalgroupindia.com" style={{ color: "#C49020", textDecoration: "none", fontWeight: 500 }}>
                Contact IT Support
              </a>
            </p>
          </div>

          <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 12, marginTop: 24 }}>
            By signing in you agree to NGI&apos;s{" "}
            <a href="#" style={{ color: "var(--text-2)", textDecoration: "none" }}>Acceptable Use Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
