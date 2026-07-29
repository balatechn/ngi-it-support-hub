"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets, mockSLAPolicies } from "@/lib/mockData";
import { statusConfig, priorityConfig, formatDateTime, getHoursRemaining } from "@/lib/utils";
import type { SLATier, TicketPriority } from "@/lib/types";
import { AlertTriangle, Clock, CheckCircle, ArrowUp, Bell } from "lucide-react";
import Link from "next/link";

function SLATierCard({ tier, color }: { tier: SLATier; color: string }) {
  const policies = mockSLAPolicies.filter((p) => p.tier === tier);
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-3" style={{ background: `${color}12`, borderBottom: `2px solid ${color}` }}>
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <h3 className="text-[13px] font-bold" style={{ color }}>{tierLabel} SLA</h3>
        <span className="ml-auto text-[11px] font-medium" style={{ color }}>
          {tier === "gold" ? "Exec / Critical Systems" : tier === "silver" ? "General Staff" : "Non-critical / Low priority"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="px-5 py-2.5 text-left text-[10px]">Priority</th>
              <th className="px-3 py-2.5 text-left text-[10px]">Response</th>
              <th className="px-3 py-2.5 text-left text-[10px]">Resolution</th>
              <th className="px-5 py-2.5 text-left text-[10px]">Escalation</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => {
              const pConf = priorityConfig[p.priority];
              return (
                <tr key={p.id}>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pConf.color} ${pConf.bg}`}>
                      {pConf.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[13px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>
                      {p.responseTimeHours < 1 ? `${p.responseTimeHours * 60}m` : `${p.responseTimeHours}h`}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[13px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>
                      {p.resolutionTimeHours >= 24 ? `${p.resolutionTimeHours / 24}d` : `${p.resolutionTimeHours}h`}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-[13px] font-semibold tabular" style={{ color: "var(--text-primary)" }}>
                      {p.escalationTimeHours >= 24 ? `${p.escalationTimeHours / 24}d` : `${p.escalationTimeHours}h`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SLAPage() {
  const openTickets = mockTickets.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const breachedTickets = openTickets.filter((t) => t.slaBreached);
  const atRiskTickets = openTickets.filter((t) => !t.slaBreached && getHoursRemaining(t.dueAt) < 4);
  const onTrackTickets = openTickets.filter((t) => !t.slaBreached && getHoursRemaining(t.dueAt) >= 4);

  return (
    <AppLayout title="SLA Monitor" breadcrumbs={[{ label: "SLA Monitor" }]}>
      {/* Alert banner for breached */}
      {breachedTickets.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl mb-5 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-red-700">
            {breachedTickets.length} ticket{breachedTickets.length !== 1 ? "s have" : " has"} breached SLA — escalation notifications sent
          </p>
          <Bell className="ml-auto w-4 h-4 text-red-500" />
        </div>
      )}

      {/* SLA health tiles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "SLA Breached", count: breachedTickets.length, icon: AlertTriangle, color: "#DC2626", bg: "#FEF2F2" },
          { label: "At Risk (< 4h)", count: atRiskTickets.length, icon: Clock, color: "#D97706", bg: "#FFFBEB" },
          { label: "On Track", count: onTrackTickets.length, icon: CheckCircle, color: "#16A34A", bg: "#F0FDF4" },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-3xl font-bold tabular" style={{ color: "var(--text-primary)" }}>{count}</p>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breached & at-risk tickets */}
      {(breachedTickets.length > 0 || atRiskTickets.length > 0) && (
        <div className="card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
              Requires Attention
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left">Ticket</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Priority</th>
                  <th className="px-3 py-3 text-left">Assigned To</th>
                  <th className="px-3 py-3 text-left">Due</th>
                  <th className="px-3 py-3 text-left">SLA Status</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...breachedTickets, ...atRiskTickets].map((ticket) => {
                  const isBreached = ticket.slaBreached;
                  const hoursLeft = getHoursRemaining(ticket.dueAt);
                  const pConf = priorityConfig[ticket.priority];

                  return (
                    <tr key={ticket.id} className={`priority-stripe-${ticket.priority}`}>
                      <td className="px-5 py-3.5">
                        <Link href={`/tickets/${ticket.id}`} className="font-mono text-[12px] font-semibold" style={{ color: "#0078D4" }}>
                          {ticket.id}
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 max-w-[220px]">
                        <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{ticket.title}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ticket.requesterName}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pConf.color} ${pConf.bg}`}>
                          {pConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-[12px]" style={{ color: "var(--text-primary)" }}>
                        {ticket.assignedToName ?? <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>{formatDateTime(ticket.dueAt)}</p>
                        {!isBreached && (
                          <p className="text-[11px] text-amber-600">
                            {hoursLeft < 1 ? `${Math.round(hoursLeft * 60)}m remaining` : `${hoursLeft.toFixed(1)}h remaining`}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {isBreached ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                            <AlertTriangle className="w-3 h-3" />Breached
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                            <Clock className="w-3 h-3" />At risk
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors text-red-700 bg-red-50 hover:bg-red-100">
                          <ArrowUp className="w-3 h-3" />
                          Escalate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLA Policy tables */}
      <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-primary)" }}>SLA Policies</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SLATierCard tier="gold" color="#D97706" />
        <SLATierCard tier="silver" color="#6B7280" />
        <SLATierCard tier="bronze" color="#92400E" />
      </div>
    </AppLayout>
  );
}
