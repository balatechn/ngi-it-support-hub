"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockChartData, mockEngineerStats, mockTickets, mockBranches } from "@/lib/mockData";
import { StatCard } from "@/components/ui/StatCard";
import { BarChart2, TrendingUp, Clock, Users, Star } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";

const categoryData = [
  { name: "Software", value: 22 },
  { name: "Hardware", value: 18 },
  { name: "Network", value: 14 },
  { name: "Account", value: 11 },
  { name: "Email", value: 9 },
  { name: "VPN", value: 6 },
  { name: "Printer", value: 4 },
  { name: "Other", value: 3 },
];

const COLORS = ["#0078D4", "#6264A7", "#16A34A", "#D97706", "#DC2626", "#0891B2", "#7C3AED", "#9CA3AF"];

const branchData = [
  { branch: "London HQ", open: 14, resolved: 38, breached: 1 },
  { branch: "Manchester", open: 6, resolved: 12, breached: 1 },
  { branch: "Dubai", open: 3, resolved: 9, breached: 0 },
  { branch: "Singapore", open: 1, resolved: 4, breached: 0 },
];

const resolutionData = [
  { label: "< 1h", count: 12 },
  { label: "1–4h", count: 24 },
  { label: "4–8h", count: 18 },
  { label: "8–24h", count: 9 },
  { label: "1–3d", count: 4 },
  { label: "> 3d", count: 0 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="card px-3 py-2 text-[12px] shadow-md">
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

export default function AnalyticsPage() {
  return (
    <AppLayout title="Analytics" breadcrumbs={[{ label: "Analytics" }]}>
      {/* Period selector */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Performance Overview</h2>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Real-time data from all branches · Auto-refreshes every 5 minutes</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {["7D", "30D", "90D", "YTD"].map((p, i) => (
            <button
              key={p}
              className="px-4 py-1.5 text-[12px] font-medium transition-colors"
              style={{
                background: i === 1 ? "#0078D4" : "var(--bg-card)",
                color: i === 1 ? "#fff" : "var(--text-secondary)",
                borderLeft: i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tickets" value="67" delta="↑ 12% vs last month" deltaDirection="up" icon={BarChart2} iconColor="#0078D4" iconBg="#EFF6FF" />
        <StatCard label="Avg Resolution" value="6.4" suffix="hrs" delta="↓ 1.2h improvement" deltaDirection="up" icon={Clock} iconColor="#16A34A" iconBg="#F0FDF4" />
        <StatCard label="SLA Compliance" value="94.2" suffix="%" delta="↑ 2.1% vs last month" deltaDirection="up" icon={TrendingUp} iconColor="#6264A7" iconBg="#F3F0FF" />
        <StatCard label="Avg CSAT" value="4.7" suffix="/ 5" delta="↑ 0.2 pts" deltaDirection="up" icon={Star} iconColor="#D97706" iconBg="#FFFBEB" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Volume trend */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Weekly Ticket Trend</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>Open vs resolved vs SLA breaches</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="aOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0078D4" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area dataKey="open" name="Open" stroke="#0078D4" strokeWidth={2} fill="url(#aOpen)" dot={false} />
              <Area dataKey="resolved" name="Resolved" stroke="#16A34A" strokeWidth={2} fill="url(#aResolved)" dot={false} />
              <Bar dataKey="breached" name="Breached" fill="#DC2626" radius={[2, 2, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Tickets by Category</h3>
          <p className="text-[11px] mb-2" style={{ color: "var(--text-muted)" }}>This month</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tickets`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryData.slice(0, 5).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                <span className="text-[11px] flex-1" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                <span className="text-[11px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Branch breakdown */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Branch Performance</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>Open vs resolved tickets by office</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={branchData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="branch" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="resolved" name="Resolved" fill="#0078D4" radius={[0, 3, 3, 0]} />
              <Bar dataKey="open" name="Open" fill="#94a3b8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution time distribution */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Resolution Time Distribution</h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>How quickly tickets are resolved</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Tickets" fill="#6264A7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engineer leaderboard */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
          <Users className="w-4 h-4" style={{ color: "#0078D4" }} />
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Engineer Performance</h3>
          <span className="ml-auto text-[12px]" style={{ color: "var(--text-muted)" }}>This month</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left">Rank</th>
                <th className="px-3 py-3 text-left">Engineer</th>
                <th className="px-3 py-3 text-right">Resolved</th>
                <th className="px-3 py-3 text-right">Avg Time</th>
                <th className="px-3 py-3 text-left w-[180px]">SLA Compliance</th>
                <th className="px-3 py-3 text-right">Open</th>
                <th className="px-5 py-3 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {mockEngineerStats.map((eng, i) => (
                <tr key={eng.id}>
                  <td className="px-5 py-3.5">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{
                        background: i === 0 ? "#D97706" : i === 1 ? "#9CA3AF" : i === 2 ? "#92400E" : "var(--border)",
                        color: i < 3 ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-azure-600 flex items-center justify-center text-white text-[11px] font-bold">
                        {eng.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{eng.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-[13px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>{eng.resolved}</span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-[13px] tabular" style={{ color: "var(--text-secondary)" }}>{eng.avgTime}h</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width: `${eng.slaCompliance}%`, background: eng.slaCompliance >= 95 ? "#16A34A" : "#D97706" }} />
                      </div>
                      <span className="text-[11px] tabular w-10 text-right" style={{ color: "var(--text-secondary)" }}>{eng.slaCompliance}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <span className="text-[13px] tabular" style={{ color: "var(--text-secondary)" }}>{eng.open}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[13px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>{eng.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            Showing all {mockEngineerStats.length} engineers · Data sourced from ticket system
          </p>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: "#EFF6FF", color: "#0078D4" }}>
            Power BI Export Available
          </span>
        </div>
      </div>
    </AppLayout>
  );
}
