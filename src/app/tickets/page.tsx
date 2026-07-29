"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets } from "@/lib/mockData";
import { statusConfig, priorityConfig, categoryLabels, formatRelativeTime, getSLAStatus } from "@/lib/utils";
import type { TicketStatus, TicketPriority, TicketCategory } from "@/lib/types";
import Link from "next/link";
import {
  Filter, SortAsc, Search, Plus, AlertTriangle, Clock,
  MessageSquare, Paperclip, ChevronDown,
} from "lucide-react";

const ALL = "all";

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<string>(ALL);
  const [search, setSearch] = useState("");

  const filtered = mockTickets.filter((t) => {
    if (statusFilter !== ALL && t.status !== statusFilter) return false;
    if (priorityFilter !== ALL && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts: Record<string, number> = { all: mockTickets.length };
  mockTickets.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1;
  });

  return (
    <AppLayout title="Tickets" breadcrumbs={[{ label: "Tickets" }]}>
      {/* Quick stats strip */}
      <div className="flex items-center gap-4 mb-5 overflow-x-auto">
        {(["all", "open", "in_progress", "pending", "resolved", "closed"] as const).map((s) => {
          const conf = s === ALL ? null : statusConfig[s as TicketStatus];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium border transition-all"
              style={{
                border: isActive ? "1px solid #0078D4" : "1px solid var(--border)",
                background: isActive ? "#EFF6FF" : "var(--bg-card)",
                color: isActive ? "#0078D4" : "var(--text-secondary)",
              }}
            >
              {conf && <span className={`w-2 h-2 rounded-full ${conf.dot}`} />}
              <span>{s === ALL ? "All" : conf?.label}</span>
              <span className="tabular text-xs opacity-70">{statusCounts[s] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* Main card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <input
              type="search"
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-[13px] outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-[13px] outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
            >
              <option value={ALL}>All Priorities</option>
              {(["critical", "high", "medium", "low"] as TicketPriority[]).map((p) => (
                <option key={p} value={p}>{priorityConfig[p].label}</option>
              ))}
            </select>

            <Link
              href="/tickets/new"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Ticket
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left w-[100px]">ID</th>
                <th className="px-3 py-3 text-left">Title / Requester</th>
                <th className="px-3 py-3 text-left w-[100px]">Category</th>
                <th className="px-3 py-3 text-left w-[90px]">Priority</th>
                <th className="px-3 py-3 text-left w-[110px]">Status</th>
                <th className="px-3 py-3 text-left w-[130px]">Assigned To</th>
                <th className="px-3 py-3 text-left w-[80px]">SLA</th>
                <th className="px-5 py-3 text-left w-[110px]">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No tickets match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => {
                  const sConf = statusConfig[ticket.status];
                  const pConf = priorityConfig[ticket.priority];
                  const sla = getSLAStatus(ticket.dueAt, ticket.resolvedAt);

                  return (
                    <tr key={ticket.id} className={`priority-stripe-${ticket.priority}`}>
                      <td className="px-5 py-3.5">
                        <Link href={`/tickets/${ticket.id}`} className="font-mono text-[12px] font-semibold hover:underline" style={{ color: "#0078D4" }}>
                          {ticket.id}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ticket.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                              <MessageSquare className="w-2.5 h-2.5" />{ticket.comments.length}
                            </span>
                          )}
                          {ticket.attachments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                              <Paperclip className="w-2.5 h-2.5" />{ticket.attachments.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 max-w-[260px]">
                        <Link href={`/tickets/${ticket.id}`} className="text-[13px] font-medium leading-tight hover:underline block truncate" style={{ color: "var(--text-primary)" }}>
                          {ticket.title}
                        </Link>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {ticket.requesterName} · {ticket.department}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                          {categoryLabels[ticket.category]}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pConf.color} ${pConf.bg}`}>
                          {pConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${sConf.color} ${sConf.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />
                          {sConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {ticket.assignedToName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-azure-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                              {ticket.assignedToName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-[12px] truncate" style={{ color: "var(--text-primary)" }}>
                              {ticket.assignedToName.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {sla === "breached" && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                            <AlertTriangle className="w-3 h-3" />Breached
                          </span>
                        )}
                        {sla === "warning" && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                            <Clock className="w-3 h-3" />At risk
                          </span>
                        )}
                        {sla === "safe" && (
                          <span className="text-[11px] text-emerald-600">On track</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeTime(ticket.updatedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
            Showing {filtered.length} of {mockTickets.length} tickets
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border text-[12px] disabled:opacity-40" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }} disabled>
              Previous
            </button>
            <span className="text-[12px] px-2" style={{ color: "var(--text-muted)" }}>Page 1</span>
            <button className="px-3 py-1 rounded border text-[12px]" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              Next
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
