"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Shield, ChevronRight, Monitor, Clock, BarChart2, Video,
  Copy, Check, Loader2, AlertCircle, Terminal, RefreshCw,
} from "lucide-react";

const features = [
  { icon: Monitor,   label: "Ticket Management",  desc: "Submit, track & resolve IT requests" },
  { icon: Video,     label: "Teams Integration",  desc: "Remote support via Microsoft Teams" },
  { icon: Clock,     label: "SLA Monitoring",     desc: "Real-time SLA tracking & escalations" },
  { icon: BarChart2, label: "Power BI Analytics", desc: "Live dashboards & performance reports" },
];

// ── Device-code flow state machine ───────────────────────────
type DCState = "idle" | "loading" | "pending" | "success" | "error";

interface DCData {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  message: string;
}

function DeviceCodePanel({ onSuccess }: { onSuccess: () => void }) {
  const [state, setState] = useState<DCState>("idle");
  const [dc, setDc] = useState<DCData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (pollRef.current)  clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => clearTimers(), []);

  const initiateFlow = async () => {
    setState("loading");
    setErrorMsg("");

    const res = await fetch("/api/auth/devicecode", { method: "POST" });
    const data = await res.json();

    if (!res.ok || data.error) {
      setErrorMsg(data.error ?? "Failed to start device code flow. Check Azure AD configuration.");
      setState("error");
      return;
    }

    setDc(data);
    setSecondsLeft(data.expires_in);
    setState("pending");

    // Countdown timer
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimers();
          setState("error");
          setErrorMsg("Code expired. Please request a new one.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Poll for token every `interval` seconds
    pollRef.current = setInterval(async () => {
      const pollRes = await fetch("/api/auth/devicepoll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_code: data.device_code }),
      });
      const pollData = await pollRes.json();

      if (pollData.error === "authorization_pending" || pollData.error === "slow_down") {
        return; // still waiting
      }

      if (pollData.error) {
        clearTimers();
        setErrorMsg(pollData.error_description ?? pollData.error);
        setState("error");
        return;
      }

      // Success — sign in via NextAuth credentials provider
      clearTimers();
      setState("success");
      const result = await signIn("device-code", {
        access_token: pollData.access_token,
        name:         pollData.user?.name ?? "",
        email:        pollData.user?.email ?? "",
        userId:       pollData.user?.id ?? "",
        jobTitle:     pollData.user?.jobTitle ?? "",
        redirect: false,
      });
      if (result?.ok) onSuccess();
      else {
        setState("error");
        setErrorMsg("Sign-in failed after token received. Please try again.");
      }
    }, (data.interval ?? 5) * 1000);
  };

  const copyCode = () => {
    if (dc) {
      navigator.clipboard.writeText(dc.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mt-4">
      {state === "idle" && (
        <button
          onClick={initiateFlow}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-md"
          style={{ border: "1px solid var(--border-strong)", background: "var(--bg-card)", color: "var(--text-primary)" }}
        >
          <Terminal className="w-4 h-4 flex-shrink-0" style={{ color: "#6264A7" }} />
          <span className="flex-1 text-left">Sign in with Device Code / Admin CLI</span>
          <ChevronRight className="w-4 h-4 opacity-40" />
        </button>
      )}

      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Contacting Azure AD…
        </div>
      )}

      {state === "pending" && dc && (
        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: "#1E3048", background: "#040E1C" }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#1E3048" }}>
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-2 text-[11px] font-mono" style={{ color: "#4A6080" }}>
              az login --use-device-code
            </span>
            <span className="ml-auto text-[11px] font-mono tabular" style={{ color: secondsLeft < 120 ? "#EF4444" : "#4A6080" }}>
              {minutes}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <div className="px-5 py-5 font-mono">
            {/* Step-by-step */}
            <p className="text-[12px] mb-1" style={{ color: "#64748B" }}>$ To sign in, open:</p>
            <a
              href={dc.verification_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] underline decoration-dotted"
              style={{ color: "#38BDF8" }}
            >
              {dc.verification_uri}
            </a>

            <p className="text-[12px] mt-4 mb-2" style={{ color: "#64748B" }}>and enter the code:</p>

            {/* Big code display */}
            <div className="flex items-center gap-3">
              <span
                className="text-3xl font-bold tracking-[0.25em] select-all"
                style={{ color: "#F0F9FF", letterSpacing: "0.25em" }}
              >
                {dc.user_code}
              </span>
              <button
                onClick={copyCode}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                style={{ background: copied ? "#064E3B" : "#0F2D4A", color: copied ? "#34D399" : "#94A3B8" }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Polling indicator */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t" style={{ borderColor: "#1E3048" }}>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#0078D4", animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </span>
              <span className="text-[11px]" style={{ color: "#4A6080" }}>
                Waiting for authentication…
              </span>
            </div>
          </div>
        </div>
      )}

      {state === "success" && (
        <div className="flex items-center gap-2 py-4 text-sm text-emerald-600">
          <Check className="w-4 h-4" />
          Authenticated — redirecting…
        </div>
      )}

      {state === "error" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => { setState("idle"); setDc(null); setErrorMsg(""); }}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#0078D4" }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main login page ───────────────────────────────────────────
export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState("engineer");
  const [tab, setTab] = useState<"sso" | "device">("sso");
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasAzure = Boolean(process.env.NEXT_PUBLIC_DEMO_MODE || process.env.AZURE_AD_CLIENT_ID);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const handleSuccess = () => router.replace("/dashboard");

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    await signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await signIn("demo", { role: demoRole, callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: "var(--bg-sidebar)" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #0078D4 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #6264A7 0%, transparent 70%)", transform: "translate(-20%,20%)" }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-azure-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">IT Support Hub</p>
              <p className="text-white/40 text-xs">National Group India · Enterprise</p>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold leading-snug mb-3" style={{ textWrap: "balance" }}>
            Your organisation&apos;s IT command centre
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Unified platform for support tickets, remote assistance, asset tracking, and real-time SLA monitoring — integrated with Microsoft 365.
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{label}</p>
                  <p className="text-white/40 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs mt-8">
          Secured by Microsoft Entra ID · Azure AD SSO · Device Code Flow
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-azure-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>IT Support Hub</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>National Group India</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Sign in</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Use your <strong>@nationalgroupindia.com</strong> Microsoft account.
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden border mb-5" style={{ borderColor: "var(--border)" }}>
            {(["sso", "device"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 text-[13px] font-medium transition-colors"
                style={{
                  background: tab === t ? "#0078D4" : "var(--bg-card)",
                  color:      tab === t ? "#fff"    : "var(--text-secondary)",
                }}
              >
                {t === "sso" ? "SSO / Browser" : "Device Code / CLI"}
              </button>
            ))}
          </div>

          {/* SSO tab */}
          {tab === "sso" && (
            <>
              <button
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: "1px solid var(--border-strong)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              >
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none" className="flex-shrink-0">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                <span className="flex-1 text-left">Continue with Microsoft</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>

              {isDemoMode && (
                <div className="mt-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Demo mode</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    >
                      <option value="admin">Admin – Sarah Mitchell</option>
                      <option value="engineer">Engineer – James Chen</option>
                      <option value="manager">Manager – Emma Thompson</option>
                      <option value="employee">Employee – David Park</option>
                    </select>
                    <button
                      onClick={handleDemoLogin}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-azure-600 hover:bg-azure-700 transition-colors disabled:opacity-60"
                    >
                      Go
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Device code tab */}
          {tab === "device" && (
            <>
              <div className="mb-4 px-4 py-3 rounded-xl text-[12px] leading-relaxed" style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}>
                <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>When to use Device Code sign-in:</p>
                <ul className="space-y-1 list-disc list-inside" style={{ color: "var(--text-secondary)" }}>
                  <li>Shared kiosk or TV displays with no keyboard</li>
                  <li>Admin CLI / Azure CLI (<code className="font-mono text-[11px]">az login</code>) sessions</li>
                  <li>Devices where opening a browser isn&apos;t possible</li>
                  <li>Service account or elevated admin authentication</li>
                </ul>
              </div>
              <DeviceCodePanel onSuccess={handleSuccess} />
            </>
          )}

          <p className="mt-8 text-xs text-center" style={{ color: "var(--text-muted)" }}>
            By signing in you agree to National Group India&apos;s IT Acceptable Use Policy.
            <br />Admin: bala@nationalgroupindia.com · Session expires after 8 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
