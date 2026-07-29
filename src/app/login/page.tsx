"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, ChevronRight, Monitor, Clock, BarChart2, Video } from "lucide-react";

const features = [
  { icon: Monitor, label: "Ticket Management", desc: "Submit, track & resolve IT requests" },
  { icon: Video, label: "Teams Integration", desc: "Remote support via Microsoft Teams" },
  { icon: Clock, label: "SLA Monitoring", desc: "Real-time SLA tracking & escalations" },
  { icon: BarChart2, label: "Power BI Analytics", desc: "Live dashboards & performance reports" },
];

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState("engineer");
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

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
      {/* Left panel – brand & feature highlights */}
      <div
        className="hidden lg:flex flex-col w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: "var(--bg-sidebar)" }}
      >
        {/* Decorative background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0078D4 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6264A7 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-azure-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">IT Support Hub</p>
              <p className="text-white/40 text-xs">Contoso · Enterprise</p>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold leading-snug mb-3" style={{ textWrap: "balance" }}>
            Your organisation's IT command centre
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
          Secured by Microsoft Entra ID · Azure AD SSO
        </p>
      </div>

      {/* Right panel – sign in form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-azure-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>IT Support Hub</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Contoso</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Sign in
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Use your Contoso Microsoft account to access IT Support Hub.
          </p>

          {/* Microsoft SSO button */}
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              border: "1px solid var(--border-strong)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            {/* Microsoft logo SVG */}
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none" className="flex-shrink-0">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span className="flex-1 text-left">Continue with Microsoft</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </button>

          {/* Demo mode */}
          {isDemoMode && (
            <div className="mt-6">
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

          <p className="mt-8 text-xs text-center" style={{ color: "var(--text-muted)" }}>
            By signing in you agree to Contoso&apos;s IT Acceptable Use Policy.
            <br />
            Your session will expire after 8 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
