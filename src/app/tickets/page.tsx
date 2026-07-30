"use client";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets } from "@/lib/mockData";
import type { TicketStatus, TicketPriority } from "@/lib/types";
import Link from "next/link";
import { Search, Plus, Filter, ChevronUp, ChevronDown, SlidersHorizontal } from "lucide-react";

const S_COLORS: Record<string, string> = {
  open: "#3B82F6", in_progress: "#F59E0B", pending: "#8B5CF6", resolved: "#10B981", closed: "#6B7280",
};
const P_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#CA8A04", low: "#16A34A",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_TABS: Array<{ value: TicketStatus | "all"; label: string }> = [
  { value: "all",         label: "All" },
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending",     label: "Pending" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

type SortField = "id" | "title" | "priority" | "status" | "updatedAt";

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mockTickets.length };
    mockTickets.forEach(t => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, []);

  const tickets = useMemo(() => {
    let list = [...mockTickets];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter);
    if (priorityFilter !== "all") list = list.filter(t => t.priority === priorityFilter);
    list.sort((a, b) => {
      let av: string = String(a[sortField as keyof typeof a] ?? "");
      let bv: string = String(b[sortField as keyof typeof b] ?? "");
      if (sortField === "priority") {
        const ord = { critical: 0, high: 1, medium: 2, low: 3 };
        av = String(ord[a.priority]);
        bv = String(ord[b.priority]);
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [search, statusFilter, priorityFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp style={{ width: 12, height: 12, opacity: 0.3 }} />;
    return sortDir === "asc" ? <ChevronUp style={{ width: 12, height: 12, color: "var(--gold)" }} /> : <ChevronDown style={{ width: 12, height: 12, color: "var(--gold)" }} />;
  };

  return (
    <AppLayout title="Tickets">
      <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>Support Tickets</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>{mockTickets.length} total tickets across all categories</p>
          </div>
          <Link href="/tickets/new"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "var(--gold)", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none", boxShadow: "0 2px 8px rgba(196,144,32,0.3)", flexShrink: 0 }}>
            <Plus style={{ width: 16, height: 16 }} /> New Request
          </Link>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {STATUS_TABS.map(({ value, label }) => {
            const active = statusFilter === value;
            const count = counts[value] ?? 0;
            return (
              <button key={value} onClick={() => setStatusFilter(value)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${active ? "var(--gold)" : "var(--border-2)"}`, background: active ? "var(--gold-pale)" : "var(--surface)", color: active ? "var(--gold)" : "var(--text-2)", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s ease" }}>
                {label}
                <span style={{ background: active ? "rgba(196,144,32,0.2)" : "var(--surface-2)", color: active ? "var(--gold)" : "var(--text-3)", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, subject, requester…"
              style={{ width: "100%", padding: "10px 14px 10px 36px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "var(--gold)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }} />
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: showFilters ? "var(--gold-pale)" : "var(--surface)", border: `1.5px solid ${showFilters ? "var(--gold)" : "var(--border-2)"}`, borderRadius: 10, cursor: "pointer", color: showFilters ? "var(--gold)" : "var(--text-2)", fontWeight: 500, fontSize: 13 }}>
            <SlidersHorizontal style={{ width: 14, height: 14 }} /> Filters {priorityFilter !== "all" && <span style={{ background: "var(--gold)", color: "#fff", borderRadius: 99, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>1</span>}
          </button>
        </div>

        {showFilters && (
          <div className="anim-scale" style={{ display: "flex", gap: 12, marginBottom: 16, padding: "16px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border-1)", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter style={{ width: 13, height: 13, color: "var(--text-3)" }} />
              <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Priority</span>
            </div>
            {(["all","critical","high","medium","low"] as const).map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${priorityFilter === p ? (p === "all" ? "var(--gold)" : P_COLORS[p]) : "var(--border-2)"}`, background: priorityFilter === p ? `${p === "all" ? "var(--gold)" : P_COLORS[p]}18` : "var(--surface-2)", color: priorityFilter === p ? (p === "all" ? "var(--gold)" : P_COLORS[p]) : "var(--text-2)", transition: "all 0.12s" }}>
                {p === "all" ? "All priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th><button onClick={() => toggleSort("id")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>ID <SortIcon field="id" /></button></th>
                  <th><button onClick={() => toggleSort("title")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>Subject <SortIcon field="title" /></button></th>
                  <th>Requester</th>
                  <th><button onClick={() => toggleSort("status")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>Status <SortIcon field="status" /></button></th>
                  <th><button onClick={() => toggleSort("priority")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>Priority <SortIcon field="priority" /></button></th>
                  <th>Assignee</th>
                  <th>SLA</th>
                  <th><button onClick={() => toggleSort("updatedAt")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>Updated <SortIcon field="updatedAt" /></button></th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}>No tickets match your filters.</td></tr>
                ) : tickets.map(t => (
                  <tr key={t.id} onClick={() => window.location.href = `/tickets/${t.id}`}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border-1)" }}>{t.id}</span>
                    </td>
                    <td style={{ maxWidth: 300 }}>
                      <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{t.title}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{t.category} · {t.branch}</p>
                    </td>
                    <td>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{t.requesterName}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)" }}>{t.department}</p>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${S_COLORS[t.status]}15`, color: S_COLORS[t.status] }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: S_COLORS[t.status] }} />
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${P_COLORS[t.priority]}15`, color: P_COLORS[t.priority] }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-2)" }}>
                      {t.assignedToName ?? <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>Unassigned</span>}
                    </td>
                    <td>
                      {t.slaBreached
                        ? <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444", background: "#EF444415", padding: "2px 8px", borderRadius: 99 }}>Breached</span>
                        : <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "#10B98115", padding: "2px 8px", borderRadius: 99 }}>On Track</span>}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>{fmt(t.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-1)", color: "var(--text-3)", fontSize: 13 }}>
            Showing {tickets.length} of {mockTickets.length} tickets
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
