"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import {
  Ticket, CheckCircle, Clock, TrendingUp, AlertTriangle,
  ArrowRight, User, Zap, MessageSquare, ExternalLink,
} from "lucide-react";
import { mockDashboardStats, mockTickets, mockChartData, mockEngineerStats } from "@/lib/mockData";
import { statusConfig, priorityConfig, formatRelativeTime, getSLAStatus } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart,
} from "recharts";

const stats = mockDashboardStats;

function SLAGauge({ value }: { value: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const color = value >= 95 ? "#16A34A" : value >= 85 ? "#D97706" : "#DC2626";
  const dash = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
        <circle cx="68" cy="68" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="68" cy="68" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="-mt-[72px] z-10 text-center">
        <p className="text-3xl font-bold tabular" style={{ color: "var(--text-primary)" }}>
          {value}<span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>%</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>SLA Met</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="card px-3 py-2 text-[12px] shadow-md min-w-[120px]">
      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold tabular" style={{ color: "var(--text-primary)" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const recentTickets = mockTickets.slice(0, 6);

  return (
    <AppLayout title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Open Tickets"
          value={stats.totalOpen}
          delta="3 more than yesterday"
          deltaDirection="down"
          icon={Ticket}
          iconColor="#0078D4"
          iconBg="#EFF6FF"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          delta="2 engineers active"
          deltaDirection="neutral"
          icon={Zap}
          iconColor="#D97706"
          iconBg="#FFFBEB"
        />
        <StatCard
          label="Resolved Today"
          value={stats.resolvedToday}
          delta="up 25% vs last week"
          deltaDirection="up"
          icon={CheckCircle}
          iconColor="#16A34A"
          iconBg="#F0FDF4"
        />
        <StatCard
          label="Critical Open"
          value={stats.criticalOpen}
          delta="requires attention"
          deltaDirection="down"
          icon={AlertTriangle}
          iconColor="#DC2626"
          iconBg="#FEF2F2"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ticket volume chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Ticket Volume — This Week</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stats.totalThisWeek} total · {stats.resolvedToday} resolved today</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={mockChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0078D4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="open" name="Open" stroke="#0078D4" strokeWidth={2} fill="url(#gradOpen)" dot={false} />
              <Area dataKey="resolved" name="Resolved" stroke="#16A34A" strokeWidth={2} fill="url(#gradResolved)" dot={false} />
              <Bar dataKey="breached" name="Breached" fill="#DC2626" radius={[2, 2, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3">
            {[
              { color: "#0078D4", label: "Open" },
              { color: "#16A34A", label: "Resolved" },
              { color: "#DC2626", label: "SLA Breached" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA compliance gauge */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>SLA Compliance</h2>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Rolling 30 days</p>
          <SLAGauge value={stats.slaCompliance} />
          <div className="mt-4 space-y-2.5">
            {[
              { tier: "Gold", val: 96.1, color: "#D97706" },
              { tier: "Silver", val: 94.5, color: "#9CA3AF" },
              { tier: "Bronze", val: 91.8, color: "#92400E" },
            ].map(({ tier, val, color }) => (
              <div key={tier} className="flex items-center gap-3">
                <span className="text-[11px] w-14 font-medium" style={{ color }}>{tier}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                </div>
                <span className="text-[11px] tabular w-10 text-right" style={{ color: "var(--text-secondary)" }}>{val}%</span>
              </div>
            ))}
          </div>
          <Link href="/sla" className="flex items-center gap-1 mt-5 text-xs font-medium" style={{ color: "#0078D4" }}>
            View SLA details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Recent Tickets</h2>
            <Link href="/tickets" className="flex items-center gap-1 text-xs font-medium" style={{ color: "#0078D4" }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Priority</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">SLA</th>
                  <th className="px-5 py-3 text-left">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => {
                  const sStatus = statusConfig[ticket.status];
                  const pStatus = priorityConfig[ticket.priority];
                  const sla = getSLAStatus(ticket.dueAt, ticket.resolvedAt);
                  return (
                    <tr key={ticket.id} className="cursor-pointer">
                      <td className="px-5 py-3">
                        <Link href={`/tickets/${ticket.id}`} className="font-mono text-[11px] font-semibold" style={{ color: "#0078D4" }}>
                          {ticket.id}
                        </Link>
                      </td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <Link href={`/tickets/${ticket.id}`} className="text-sm truncate block hover:underline" style={{ color: "var(--text-primary)" }}>
                          {ticket.title}
                        </Link>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ticket.requesterName}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: pStatus.color.split(" ")[0].replace("text-", ""), background: pStatus.bg.split(" ")[0].replace("bg-", "") }}>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${pStatus.color} ${pStatus.bg}`}>
                            {pStatus.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${sStatus.color} ${sStatus.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sStatus.dot}`} />
                          {sStatus.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {sla === "breached" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Breached
                          </span>
                        )}
                        {sla === "warning" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />At risk
                          </span>
                        )}
                        {sla === "safe" && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />On track
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeTime(ticket.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engineer leaderboard */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Engineer Performance</h2>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>This month</span>
          </div>
          <div className="space-y-4">
            {mockEngineerStats.map((eng, i) => (
              <div key={eng.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: i === 0 ? "#D97706" : "var(--border)", color: i === 0 ? "#fff" : "var(--text-muted)" }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-azure-600 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
                  {eng.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{eng.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full bg-azure-600" style={{ width: `${eng.slaCompliance}%` }} />
                    </div>
                    <span className="text-[10px] tabular" style={{ color: "var(--text-muted)" }}>{eng.slaCompliance}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular" style={{ color: "var(--text-primary)" }}>{eng.resolved}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>resolved</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/analytics" className="flex items-center gap-1 mt-5 text-xs font-medium" style={{ color: "#0078D4" }}>
            Full analytics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
