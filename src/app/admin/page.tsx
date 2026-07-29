"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import {
  Users, Monitor, Shield, Package, RefreshCw, CheckCircle,
  AlertTriangle, Cloud, Key, Lock, ExternalLink, Loader2,
} from "lucide-react";

interface GraphStats {
  userCount: number | null;
  groupCount: number | null;
  deviceCount: number | null;
  compliantDevices: number | null;
  licensesAssigned: number | null;
  skus: { name: string; consumed: number; total: number }[];
}

interface GraphMe {
  id: string;
  displayName: string;
  userPrincipalName: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
  assignedLicenses: { skuId: string }[];
}

const SKU_LABELS: Record<string, string> = {
  SPE_E3: "Microsoft 365 E3",
  SPE_E5: "Microsoft 365 E5",
  ENTERPRISEPREMIUM: "Office 365 E5",
  ENTERPRISEPACK: "Office 365 E3",
  BUSINESS_PREMIUM: "Microsoft 365 Business Premium",
  POWER_BI_PRO: "Power BI Pro",
  INTUNE_A: "Microsoft Intune",
  AAD_PREMIUM_P2: "Entra ID P2",
};

function prettySku(name: string) {
  return SKU_LABELS[name] ?? name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminPage() {
  const [stats, setStats]     = useState<GraphStats | null>(null);
  const [me, setMe]           = useState<GraphMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [statsRes, meRes] = await Promise.all([
      fetch("/api/graph/stats"),
      fetch("/api/graph/me"),
    ]);

    if (statsRes.status === 401 || meRes.status === 401) {
      setError("No Microsoft Graph token found in your session. Sign in via Device Code or Microsoft SSO with Graph permissions, then return here.");
      setLoading(false);
      return;
    }

    if (statsRes.ok) setStats(await statsRes.json());
    if (meRes.ok)   setMe(await meRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout title="Entra ID Admin" breadcrumbs={[{ label: "Admin · Entra ID / Graph" }]}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 rounded-2xl mb-6"
        style={{ background: "linear-gradient(135deg, #071629 0%, #0C2D4E 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-[14px]">Microsoft Entra ID / Graph</p>
            <p className="text-white/50 text-[12px]">Live tenant data via Microsoft Graph API</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="w-5 h-5 animate-spin" /> Loading from Microsoft Graph…
        </div>
      )}

      {error && (
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-[15px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Graph token required
          </h2>
          <p className="text-[13px] mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/login"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors"
            >
              Sign in with Device Code
            </a>
            <button
              onClick={load}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border text-[13px] font-medium"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Entra ID Users"
              value={stats.userCount ?? "—"}
              icon={Users}
              iconColor="#0078D4"
              iconBg="#EFF6FF"
            />
            <StatCard
              label="Groups"
              value={stats.groupCount ?? "—"}
              icon={Shield}
              iconColor="#6264A7"
              iconBg="#F3F0FF"
            />
            <StatCard
              label="Intune Devices"
              value={stats.deviceCount ?? "—"}
              icon={Monitor}
              iconColor="#16A34A"
              iconBg="#F0FDF4"
            />
            <StatCard
              label="Licenses Assigned"
              value={stats.licensesAssigned ?? "—"}
              icon={Key}
              iconColor="#D97706"
              iconBg="#FFFBEB"
            />
          </div>

          {/* Compliance + Licenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Device compliance */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-4 h-4" style={{ color: "#0078D4" }} />
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Intune Device Compliance
                </h3>
                <a
                  href="https://intune.microsoft.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                </a>
              </div>
              {stats.deviceCount !== null ? (
                <div className="space-y-3">
                  {[
                    {
                      label: "Compliant",
                      count: stats.compliantDevices ?? 0,
                      total: stats.deviceCount,
                      color: "#16A34A",
                      bg: "#F0FDF4",
                      icon: CheckCircle,
                    },
                    {
                      label: "Non-Compliant",
                      count: Math.max(0, (stats.deviceCount ?? 0) - (stats.compliantDevices ?? 0)),
                      total: stats.deviceCount,
                      color: "#DC2626",
                      bg: "#FEF2F2",
                      icon: AlertTriangle,
                    },
                  ].map(({ label, count, total, color, bg, icon: Icon }) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
                          </div>
                          <span className="text-[13px] font-semibold tabular" style={{ color }}>
                            {count} <span className="text-[11px] font-normal" style={{ color: "var(--text-muted)" }}>({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  DeviceManagementManagedDevices.Read.All permission required
                </p>
              )}
            </div>

            {/* License breakdown */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4" style={{ color: "#6264A7" }} />
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  License Subscriptions
                </h3>
                <a
                  href="https://admin.microsoft.com/Adminportal/Home#/licenses"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                </a>
              </div>
              {stats.skus.length > 0 ? (
                <div className="space-y-3">
                  {stats.skus.slice(0, 6).map((sku) => {
                    const pct = sku.total > 0 ? Math.round((sku.consumed / sku.total) * 100) : 0;
                    const isHigh = pct > 90;
                    return (
                      <div key={sku.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium truncate pr-4" style={{ color: "var(--text-primary)" }}>
                            {prettySku(sku.name)}
                          </span>
                          <span className="text-[11px] tabular flex-shrink-0" style={{ color: isHigh ? "#DC2626" : "var(--text-muted)" }}>
                            {sku.consumed}/{sku.total}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: isHigh ? "#DC2626" : "#6264A7" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  No license data returned — check permissions
                </p>
              )}
            </div>
          </div>

          {/* Current user (Graph /me) */}
          {me && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" style={{ color: "#0078D4" }} />
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Authenticated User (Graph /me)
                </h3>
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  Live from Entra ID
                </span>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-azure-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {(me.displayName ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 flex-1">
                  {[
                    { label: "Display Name",    value: me.displayName },
                    { label: "UPN",             value: me.userPrincipalName },
                    { label: "Job Title",       value: me.jobTitle || "—" },
                    { label: "Department",      value: me.department || "—" },
                    { label: "Office",          value: me.officeLocation || "—" },
                    { label: "Licenses",        value: `${me.assignedLicenses?.length ?? 0} assigned` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
