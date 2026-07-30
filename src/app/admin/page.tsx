"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets, mockUsers, mockSLAPolicies, mockDashboardStats, mockEngineerStats } from "@/lib/mockData";
import { LayoutDashboard, Ticket, Users, ShieldCheck, Settings, AlertTriangle, CheckCircle2, Clock, TrendingUp, ChevronDown } from "lucide-react";
import type { Ticket as TicketType } from "@/lib/types";

type Tab = "overview" | "tickets" | "users" | "sla" | "settings";

const S_COLORS: Record<string, string> = {
  open: "#3B82F6", in_progress: "#F59E0B", pending: "#8B5CF6", resolved: "#10B981", closed: "#6B7280",
};
const P_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#CA8A04", low: "#16A34A",
};
const R_COLORS: Record<string, string> = {
  admin: "#C49020", manager: "#8B5CF6", engineer: "#3B82F6", employee: "#6B7280",
};

function fmtDt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function StatusPill({ status }: { status: string }) {
  const c = S_COLORS[status] ?? "#6B7280";
  return <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${c}18`, color: c, whiteSpace: "nowrap" }}>{status.replace("_", " ")}</span>;
}
function PriorityPill({ priority }: { priority: string }) {
  const c = P_COLORS[priority] ?? "#6B7280";
  return <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${c}18`, color: c, whiteSpace: "nowrap" }}>{priority}</span>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [tickets, setTickets] = useState<TicketType[]>(mockTickets);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const stats = mockDashboardStats;
  const engineers = mockUsers.filter(u => u.role === "engineer" || u.role === "admin");

  function assignTicket(ticketId: string, engineerName: string) {
    setTickets(prev => prev.map(t => t.id === ticketId
      ? { ...t, assignedToName: engineerName, status: "in_progress" as const }
      : t
    ));
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard style={{ width: 14, height: 14 }} /> },
    { id: "tickets", label: "Tickets", icon: <Ticket style={{ width: 14, height: 14 }} /> },
    { id: "users", label: "Users", icon: <Users style={{ width: 14, height: 14 }} /> },
    { id: "sla", label: "SLA Policies", icon: <ShieldCheck style={{ width: 14, height: 14 }} /> },
    { id: "settings", label: "Settings", icon: <Settings style={{ width: 14, height: 14 }} /> },
  ];

  return (
    <AppLayout title="Admin Panel">
      <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em" }}>Admin Panel</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 2 }}>Manage tickets, users, and platform settings for National Group India IT Support.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s",
                background: tab === t.id ? "var(--brand)" : "transparent",
                color: tab === t.id ? "#fff" : "var(--text-2)",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Total Open",      val: stats.totalOpen,           icon: <Ticket style={{ width: 18, height: 18 }} />,       color: "#3B82F6" },
                { label: "In Progress",     val: stats.inProgress,          icon: <Clock style={{ width: 18, height: 18 }} />,         color: "#F59E0B" },
                { label: "Resolved Today",  val: stats.resolvedToday,       icon: <CheckCircle2 style={{ width: 18, height: 18 }} />,  color: "#10B981" },
                { label: "SLA Compliance",  val: `${stats.slaCompliance}%`, icon: <ShieldCheck style={{ width: 18, height: 18 }} />,   color: "#8B5CF6" },
                { label: "Critical Open",   val: stats.criticalOpen,        icon: <AlertTriangle style={{ width: 18, height: 18 }} />, color: "#EF4444" },
                { label: "This Week",       val: stats.totalThisWeek,       icon: <TrendingUp style={{ width: 18, height: 18 }} />,    color: "#C49020" },
              ].map(k => (
                <div key={k.label} style={{ background: "var(--surface)", borderRadius: 14, padding: "16px 14px", border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>{k.icon}</div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{k.val}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginTop: 2 }}>{k.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#EF4444", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle style={{ width: 14, height: 14 }} /> SLA Breached
                </p>
                {tickets.filter(t => t.slaBreached).length === 0
                  ? <p style={{ fontSize: 13, color: "var(--text-3)" }}>No SLA breaches — great work!</p>
                  : tickets.filter(t => t.slaBreached).map(t => (
                    <div key={t.id} style={{ padding: "10px 12px", background: "#EF444408", borderRadius: 8, border: "1px solid #EF444425", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{t.id} — {t.title}</p>
                        <PriorityPill priority={t.priority} />
                      </div>
                      <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>Due: {fmtDt(t.dueAt)} · {t.assignedToName ?? "Unassigned"}</p>
                    </div>
                  ))
                }
              </div>
              <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#F59E0B", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <Users style={{ width: 14, height: 14 }} /> Unassigned Tickets
                </p>
                {tickets.filter(t => !t.assignedToId && t.status !== "resolved" && t.status !== "closed").map(t => (
                  <div key={t.id} style={{ padding: "10px 12px", background: "#F59E0B08", borderRadius: 8, border: "1px solid #F59E0B25", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.id} — {t.title}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{t.branch} · {fmtDt(t.createdAt)}</p>
                    </div>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <select onChange={e => assignTicket(t.id, e.target.value)} defaultValue=""
                        style={{ padding: "5px 28px 5px 10px", borderRadius: 7, border: "1.5px solid var(--border-2)", background: "var(--surface-2)", color: "var(--text-1)", fontSize: 12, cursor: "pointer", appearance: "none" }}>
                        <option value="" disabled>Assign…</option>
                        {engineers.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                      </select>
                      <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                    </div>
                  </div>
                ))}
                {tickets.filter(t => !t.assignedToId && t.status !== "resolved" && t.status !== "closed").length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-3)" }}>All tickets are assigned.</p>
                )}
              </div>
            </div>

            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 14 }}>Engineer Performance</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-1)" }}>
                      {["Engineer","Branch","Resolved","Avg Time","SLA","Open","Rating"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockEngineerStats.map((e, i) => {
                      const u = mockUsers.find(u => u.id === e.id);
                      return (
                        <tr key={e.id} style={{ borderBottom: "1px solid var(--border-1)" }}>
                          <td style={{ padding: "10px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${i*80}deg,55%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                {e.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{e.name}</p>
                                <p style={{ fontSize: 11, color: "var(--text-3)" }}>{u?.role}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "10px 10px", fontSize: 12, color: "var(--text-2)" }}>{u?.branch}</td>
                          <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{e.resolved}</td>
                          <td style={{ padding: "10px 10px", fontSize: 13, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{e.avgTime}h</td>
                          <td style={{ padding: "10px 10px" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: e.slaCompliance>=95 ? "#10B981" : e.slaCompliance>=90 ? "#F59E0B" : "#EF4444" }}>{e.slaCompliance}%</span>
                          </td>
                          <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{e.open}</td>
                          <td style={{ padding: "10px 10px", fontSize: 13, color: "#C49020", fontWeight: 700 }}>★ {e.rating}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TICKETS ── */}
        {tab === "tickets" && (
          <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border-1)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-1)" }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>All Tickets <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 400 }}>({tickets.length})</span></p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border-1)" }}>
                    {["ID","Title","Requester","Status","Priority","Branch","Due","Assign To"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border-1)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 8px", borderRadius: 5 }}>{t.id}</span>
                      </td>
                      <td style={{ padding: "10px 12px", maxWidth: 220 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</p>
                        <p style={{ fontSize: 11, color: "var(--text-3)" }}>{t.category}</p>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-2)", whiteSpace: "nowrap" }}>{t.requesterName}</td>
                      <td style={{ padding: "10px 12px" }}><StatusPill status={t.status} /></td>
                      <td style={{ padding: "10px 12px" }}><PriorityPill priority={t.priority} /></td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-2)", whiteSpace: "nowrap" }}>{t.branch}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: t.slaBreached ? "#EF4444" : "var(--text-2)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtDt(t.dueAt)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {t.status === "resolved" || t.status === "closed"
                          ? <span style={{ fontSize: 11, color: "var(--text-3)" }}>{t.assignedToName ?? "—"}</span>
                          : (
                            <div style={{ position: "relative" }}>
                              <select value={t.assignedToName ?? ""} onChange={e => assignTicket(t.id, e.target.value)}
                                style={{ padding: "4px 24px 4px 8px", borderRadius: 6, border: "1.5px solid var(--border-2)", background: "var(--surface-2)", color: "var(--text-1)", fontSize: 12, cursor: "pointer", appearance: "none", width: "100%", minWidth: 120 }}>
                                <option value="">Unassigned</option>
                                {engineers.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                              </select>
                              <ChevronDown style={{ width: 11, height: 11, position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                            </div>
                          )
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {mockUsers.map((u, i) => (
              <div key={u.id} style={{ background: "var(--surface)", borderRadius: 14, padding: 18, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `hsl(${i*50}deg,55%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {u.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: u.isOnline ? "#10B981" : "#9CA3AF", border: "2px solid var(--surface)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{u.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${R_COLORS[u.role]}18`, color: R_COLORS[u.role] }}>{u.role}</span>
                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border-1)" }}>{u.department}</span>
                    <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: 11, background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border-1)" }}>{u.branch}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SLA ── */}
        {tab === "sla" && (
          <div>
            {(["gold","silver","bronze"] as const).map(tier => (
              <div key={tier} style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border-1)", marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-1)", background: tier === "gold" ? "rgba(196,144,32,0.08)" : tier === "silver" ? "rgba(156,163,175,0.08)" : "rgba(180,130,70,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck style={{ width: 16, height: 16, color: tier === "gold" ? "#C49020" : tier === "silver" ? "#9CA3AF" : "#B48246" }} />
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", textTransform: "capitalize" }}>{tier} Tier</p>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-1)" }}>
                        {["Priority","First Response","Resolution Time","Escalation At"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockSLAPolicies.filter(p => p.tier === tier).map(p => (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border-1)" }}>
                          <td style={{ padding: "10px 16px" }}><PriorityPill priority={p.priority} /></td>
                          <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{p.responseTimeHours}h</td>
                          <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{p.resolutionTimeHours}h</td>
                          <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{p.escalationTimeHours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border-1)" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 16 }}>Notification Settings</p>
              {[
                { label: "Email alerts for SLA breaches", on: true },
                { label: "WhatsApp ticket confirmation", on: true },
                { label: "Daily digest email to admins", on: false },
                { label: "Slack notification on new ticket", on: true },
                { label: "Critical ticket escalation alerts", on: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-1)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-1)" }}>{s.label}</span>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: s.on ? "var(--brand)" : "var(--border-2)", position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: s.on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: ".2s" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border-1)" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 16 }}>Platform Configuration</p>
              {[
                { label: "WhatsApp number", placeholder: "+91 98765 43210", type: "tel" },
                { label: "Alert email (CC all)", placeholder: "it-alerts@nationalgroupindia.com", type: "email" },
                { label: "AI model", placeholder: "gpt-4o-mini", type: "text" },
                { label: "Default SLA tier", placeholder: "silver", type: "text" },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border-2)", background: "var(--surface-2)", color: "var(--text-1)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500); }}
                style={{ marginTop: 4, padding: "9px 20px", background: settingsSaved ? "#10B981" : "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background .3s", width: "100%" }}>
                {settingsSaved ? "✓ Settings Saved" : "Save Changes"}
              </button>
            </div>

            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border-1)", gridColumn: "1 / -1" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 16 }}>Audit Log</p>
              {[
                { time: "2026-07-30 09:15", user: "Bala",            action: "Assigned INC-10233 to James Chen",                   type: "assign" },
                { time: "2026-07-30 08:50", user: "Sarah Mitchell",  action: "Closed INC-10227 (network issue resolved)",           type: "close" },
                { time: "2026-07-29 17:30", user: "James Chen",      action: "Commented on INC-10234 — pushed Intune fix",          type: "comment" },
                { time: "2026-07-29 15:00", user: "Bala",            action: "Updated SLA: Gold Critical response 4h → 2h",         type: "config" },
                { time: "2026-07-29 11:00", user: "Omar Al-Hassan",  action: "Resolved INC-10230 — Adobe license activated",        type: "resolve" },
                { time: "2026-07-29 09:30", user: "Bala",            action: "Added user Lucas Fernandez (Dubai / Sales)",          type: "user" },
              ].map((e, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < arr.length-1 ? "1px solid var(--border-1)" : "none", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{e.time}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{e.user}</span>
                  <span style={{ fontSize: 13, color: "var(--text-1)", flex: 1 }}>{e.action}</span>
                  <span style={{ padding: "1px 8px", borderRadius: 99, fontSize: 11, flexShrink: 0, background: e.type === "assign" ? "#3B82F615" : e.type === "resolve" ? "#10B98115" : e.type === "close" ? "#6B728015" : e.type === "config" ? "#C4902015" : "#8B5CF615", color: e.type === "assign" ? "#3B82F6" : e.type === "resolve" ? "#10B981" : e.type === "close" ? "#6B7280" : e.type === "config" ? "#C49020" : "#8B5CF6" }}>{e.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
