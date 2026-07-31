"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets, mockDashboardStats, mockChartData, mockKBArticles } from "@/lib/mockData";
import Link from "next/link";
import {
  Ticket, Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
  Plus, Bot, BookOpen, ArrowRight, ExternalLink, Megaphone,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  open: "#3B82F6", in_progress: "#F59E0B", pending: "#8B5CF6", resolved: "#10B981", closed: "#6B7280",
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#22C55E",
};

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STAT_CARDS = [
  { key: "totalOpen",        label: "Open Tickets",    icon: Ticket,        cls: "stat-gradient-blue",   suffix: "" },
  { key: "inProgress",       label: "In Progress",     icon: Clock,         cls: "stat-gradient-gold",   suffix: "" },
  { key: "resolvedToday",    label: "Resolved Today",  icon: CheckCircle2,  cls: "stat-gradient-green",  suffix: "" },
  { key: "slaCompliance",    label: "SLA Compliance",  icon: TrendingUp,    cls: "stat-gradient-purple", suffix: "%" },
];

const ANNOUNCEMENTS = [
  { title: "Scheduled Maintenance – 2 Aug 02:00–04:00 IST", body: "Email servers will be offline for patching. Users should save drafts locally before the window.", badge: "Maintenance", color: "#F59E0B" },
  { title: "New VPN Client Available – GlobalProtect 6.2", body: "Updated client improves connection speed and adds split-tunnel support for Microsoft 365.", badge: "Update", color: "#3B82F6" },
  { title: "Phishing Alert: Fake IT Password Reset Emails", body: "Disregard emails from 'it-noreply@national-group.net'. These are phishing. Do not click any links.", badge: "Security", color: "#EF4444" },
];

const QUICK_ACTIONS = [
  { href: "/tickets/new", icon: Plus,    label: "Raise a Ticket",    desc: "Report an issue or request" },
  { href: "/chat",        icon: Bot,     label: "Ask AI Assistant",  desc: "Get instant answers" },
  { href: "/knowledge-base", icon: BookOpen, label: "Knowledge Base", desc: "Browse guides & FAQs" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  useEffect(() => {
    if (!isAdmin) router.replace("/tickets/new");
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  const name = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const stats = mockDashboardStats;
  const recentTickets = mockTickets.slice(0, 6);

  return (
    <AppLayout title="Dashboard">
      <div style={{ padding: "28px 24px 40px", maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Greeting ── */}
        <div className="anim-fade-up" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            {greeting}, {name}! 👋
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Here&apos;s what&apos;s happening across your IT support platform today.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="anim-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28, animationDelay: "0.06s" }}>
          {STAT_CARDS.map(({ key, label, icon: Icon, cls, suffix }) => {
            const val = stats[key as keyof typeof stats];
            return (
              <div key={key} style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", display: "flex", gap: 14, alignItems: "center" }}>
                <div className={cls} style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", lineHeight: 1, marginBottom: 4, letterSpacing: "-0.02em" }}>
                    {typeof val === "number" && suffix === "%" ? val.toFixed(1) : val}{suffix}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Recent Tickets */}
            <div className="anim-fade-up card" style={{ animationDelay: "0.1s", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-1)" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Recent Tickets</p>
                <Link href="/tickets" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>
                  View all <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map(t => (
                      <tr key={t.id} onClick={() => window.location.href = `/tickets/${t.id}`}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 4 }}>{t.id}</span>
                        </td>
                        <td style={{ maxWidth: 280 }}>
                          <p style={{ fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{t.title}</p>
                          <p style={{ fontSize: 11, color: "var(--text-3)" }}>{t.department} · {t.branch}</p>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${STATUS_COLORS[t.status]}18`, color: STATUS_COLORS[t.status] }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLORS[t.status] }} />
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${PRIORITY_COLORS[t.priority]}18`, color: PRIORITY_COLORS[t.priority] }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--text-2)" }}>{t.assignedToName ?? <span style={{ color: "var(--text-3)" }}>Unassigned</span>}</td>
                        <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{fmtRelative(t.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ticket volume chart */}
            <div className="anim-fade-up card" style={{ padding: 20, animationDelay: "0.14s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Ticket Volume – This Week</p>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-3)" }}>
                  {[["#3B82F6","Open"],["#10B981","Resolved"],["#EF4444","Breached"]].map(([c,l]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 10, height: 3, borderRadius: 99, background: c, display: "inline-block" }} />{l}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    {[["blue","#3B82F6"],["green","#10B981"],["red","#EF4444"]].map(([k,c]) => (
                      <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="open" stroke="#3B82F6" fill="url(#g-blue)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="url(#g-green)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="breached" stroke="#EF4444" fill="url(#g-red)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Quick actions */}
            <div className="anim-fade-up card" style={{ padding: 20, animationDelay: "0.08s" }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 14 }}>Quick Actions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 12, textDecoration: "none", border: "1px solid var(--border-1)", transition: "all 0.15s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--gold-pale)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-1)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"; }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(196,144,32,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 17, height: 17, color: "var(--gold)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 1 }}>{label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{desc}</p>
                    </div>
                    <ArrowRight style={{ width: 14, height: 14, color: "var(--text-3)" }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div className="anim-fade-up card" style={{ padding: 20, animationDelay: "0.12s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Megaphone style={{ width: 16, height: 16, color: "var(--gold)" }} />
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>IT Announcements</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ANNOUNCEMENTS.map((a, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${a.color}`, paddingLeft: 12 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: `${a.color}18`, color: a.color, letterSpacing: "0.04em" }}>{a.badge}</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 3, lineHeight: 1.4 }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{a.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured KB articles */}
            <div className="anim-fade-up card" style={{ padding: 20, animationDelay: "0.16s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Popular Guides</p>
                <Link href="/knowledge-base" style={{ fontSize: 12, color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}>See all</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {mockKBArticles.filter(a => a.featured).map(a => (
                  <Link key={a.id} href={`/knowledge-base?article=${a.id}`}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", transition: "background 0.12s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "none"; }}>
                    <BookOpen style={{ width: 14, height: 14, color: "var(--text-3)", flexShrink: 0 }} />
                    <p style={{ flex: 1, fontSize: 13, color: "var(--text-1)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                    <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>{a.views.toLocaleString()} views</span>
                    <ExternalLink style={{ width: 11, height: 11, color: "var(--text-3)", flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
