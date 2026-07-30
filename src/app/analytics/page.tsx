"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockDashboardStats, mockChartData, mockEngineerStats, mockTickets } from "@/lib/mockData";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Users, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const CATEGORY_DATA = [
  { name: "Email",    value: 28, color: "#F59E0B" },
  { name: "VPN",      value: 22, color: "#EF4444" },
  { name: "Hardware", value: 18, color: "#8B5CF6" },
  { name: "Software", value: 15, color: "#10B981" },
  { name: "Network",  value: 10, color: "#3B82F6" },
  { name: "Printer",  value: 7,  color: "#6B7280" },
];

const BRANCH_DATA = [
  { branch: "London HQ",  open: 14, resolved: 42 },
  { branch: "Manchester", open: 6,  resolved: 18 },
  { branch: "Dubai",      open: 3,  resolved: 11 },
  { branch: "Singapore",  open: 1,  resolved: 7 },
];

export default function AnalyticsPage() {
  const stats = mockDashboardStats;
  const eng = mockEngineerStats;

  return (
    <AppLayout title="Analytics">
      <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics & Reporting</h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Real-time overview of IT support performance metrics</p>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total This Week",  val: stats.totalThisWeek,          icon: <TrendingUp className="w-5 h-5" />,  color: "#3B82F6", suffix: "" },
            { label: "SLA Compliance",   val: `${stats.slaCompliance}%`,     icon: <CheckCircle2 className="w-5 h-5" />, color: "#10B981", suffix: "" },
            { label: "Avg Resolution",   val: `${stats.avgResolutionHours}h`, icon: <Clock className="w-5 h-5" />,       color: "#F59E0B", suffix: "" },
            { label: "Critical Open",    val: stats.criticalOpen,             icon: <AlertTriangle className="w-5 h-5" />,color: "#EF4444", suffix: "" },
            { label: "Active Engineers", val: eng.length,                     icon: <Users className="w-5 h-5" />,       color: "#8B5CF6", suffix: "" },
          ].map(k => (
            <div key={k.label} style={{ background: "var(--surface)", borderRadius: 14, padding: "18px 16px", border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{k.val}</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginTop: 2 }}>{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Trend chart */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 16 }}>Ticket Trend – This Week</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  {[["blue","#3B82F6"],["green","#10B981"]].map(([k,c]) => (
                    <linearGradient key={k} id={`ag-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3}/><stop offset="95%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="open" name="Open" stroke="#3B82F6" fill="url(#ag-blue)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" fill="url(#ag-green)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 8 }}>By Category</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {CATEGORY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
              {CATEGORY_DATA.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* By branch */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 16 }}>Tickets by Branch</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={BRANCH_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="open" name="Open" fill="#3B82F6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Engineer performance */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 16 }}>Engineer Performance</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {eng.map((e, i) => (
                <div key={e.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${(i * 60) % 360},60%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {e.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{e.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-3)" }}>{e.resolved} resolved · {e.avgTime}h avg</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: e.slaCompliance >= 95 ? "#10B981" : e.slaCompliance >= 90 ? "#F59E0B" : "#EF4444" }}>{e.slaCompliance}%</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>SLA</p>
                    </div>
                  </div>
                  <div className="sla-bar">
                    <div className="sla-fill" style={{ width: `${e.slaCompliance}%`, background: e.slaCompliance >= 95 ? "#10B981" : e.slaCompliance >= 90 ? "#F59E0B" : "#EF4444" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
