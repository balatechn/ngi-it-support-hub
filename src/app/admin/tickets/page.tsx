"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RefreshCw, CheckCircle, Clock, AlertCircle, XCircle, Loader2, Send, Search } from "lucide-react";

interface Ticket {
  id: string;
  name: string;
  email: string;
  location: string;
  department: string;
  contact: string;
  ticketType: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUSES = [
  { value: "open",        label: "Open",        color: "#3B82F6", icon: AlertCircle },
  { value: "in_progress", label: "In Progress",  color: "#F59E0B", icon: Clock },
  { value: "pending",     label: "Pending",      color: "#8B5CF6", icon: Clock },
  { value: "resolved",    label: "Resolved",     color: "#10B981", icon: CheckCircle },
  { value: "closed",      label: "Closed",       color: "#6B7280", icon: XCircle },
];

const P_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#CA8A04", low: "#16A34A",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending",     label: "Pending" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets]         = useState<Ticket[]>([]);
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState<string | null>(null);
  const [statusMap, setStatusMap]     = useState<Record<string, string>>({});
  const [noteMap, setNoteMap]         = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg]       = useState("");
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data: Ticket[] = await res.json();
        setTickets(data);
        const map: Record<string, string> = {};
        data.forEach(t => { map[t.id] = t.status; });
        setStatusMap(map);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const update = async (ticketId: string) => {
    const newStatus = statusMap[ticketId];
    const note = noteMap[ticketId] ?? "";
    setUpdating(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: note || undefined }),
      });
      if (res.ok) {
        const updated: Ticket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        setNoteMap(prev => ({ ...prev, [ticketId]: "" }));
        showToast(`✅ ${ticketId} updated to "${newStatus.replace("_", " ")}" — email sent to ${updated.email}`);
        setExpanded(null);
      } else {
        showToast("❌ Failed to update ticket.");
      }
    } finally {
      setUpdating(null);
    }
  };

  const statusInfo = (s: string) => STATUSES.find(x => x.value === s) ?? STATUSES[0];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length };
    tickets.forEach(t => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [tickets]);

  const visible = useMemo(() => {
    let list = [...tickets];
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, statusFilter, search]);

  return (
    <AppLayout title="Ticket Inbox">
      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} · Update status to notify user by email
          </p>
          <button onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
          {STATUS_TABS.map(({ value, label }) => {
            const active = statusFilter === value;
            const count = counts[value] ?? 0;
            return (
              <button key={value} onClick={() => setStatusFilter(value)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${active ? "#C49020" : "var(--border-2)"}`, background: active ? "rgba(196,144,32,0.08)" : "var(--surface)", color: active ? "#C49020" : "var(--text-2)", fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {label}
                <span style={{ background: active ? "rgba(196,144,32,0.2)" : "var(--surface-2)", color: active ? "#C49020" : "var(--text-3)", borderRadius: 99, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16, maxWidth: 420 }}>
          <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, category…"
            style={{ width: "100%", padding: "9px 12px 9px 34px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", outline: "none" }}
            onFocus={e => { e.target.style.borderColor = "#C49020"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }} />
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "var(--text-3)" }}>
            <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", marginRight: 10 }} /> Loading tickets…
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
              {tickets.length === 0 ? "No tickets yet" : "No tickets match your filters"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              {tickets.length === 0 ? "Tickets submitted via the portal will appear here." : "Try a different status or clear the search."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map(t => {
              const si = statusInfo(t.status);
              const isExpanded = expanded === t.id;
              const currentStatus = statusMap[t.id] ?? t.status;
              const changed = currentStatus !== t.status;

              return (
                <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--sh-xs)" }}>

                  {/* Row summary */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : t.id)}
                    style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px 90px 80px 90px", gap: 12, padding: "14px 18px", alignItems: "center", cursor: "pointer" }}
                  >
                    {/* ID */}
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border-1)", whiteSpace: "nowrap" }}>
                      {t.id}
                    </span>

                    {/* Name + category */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{t.email} · {t.category} · {t.location}</p>
                    </div>

                    {/* Status badge */}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${si.color}18`, color: si.color, whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: si.color, flexShrink: 0 }} />
                      {si.label}
                    </span>

                    {/* Priority */}
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${P_COLORS[t.priority] ?? "#6B7280"}18`, color: P_COLORS[t.priority] ?? "#6B7280" }}>
                      {t.priority}
                    </span>

                    {/* Type */}
                    <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "capitalize" }}>{t.ticketType}</span>

                    {/* Date */}
                    <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </div>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border-1)", padding: "16px 18px", background: "var(--surface-2)" }}>

                      {/* Description */}
                      {t.description && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</p>
                          <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.6, background: "var(--surface)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-1)" }}>{t.description}</p>
                        </div>
                      )}

                      {/* Details grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                        {[
                          ["Department", t.department],
                          ["Location", t.location],
                          ["Contact", t.contact],
                          ["Category", t.category],
                          ["Priority", t.priority],
                          ["Raised", fmt(t.createdAt)],
                        ].map(([l, v]) => (
                          <div key={l} style={{ background: "var(--surface)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-1)" }}>
                            <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l}</p>
                            <p style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Status update */}
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <div style={{ flex: "0 0 auto" }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Update Status</p>
                          <select
                            value={currentStatus}
                            onChange={e => setStatusMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                            style={{ padding: "8px 12px", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", background: "var(--surface)", cursor: "pointer", outline: "none", minWidth: 160 }}
                          >
                            {STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ flex: 1, minWidth: 200 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Note to user <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
                          <input
                            value={noteMap[t.id] ?? ""}
                            onChange={e => setNoteMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                            placeholder="e.g. We've escalated this to the network team…"
                            style={{ width: "100%", padding: "8px 12px", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", background: "var(--surface)", outline: "none" }}
                            onFocus={e => { e.target.style.borderColor = "var(--gold)"; }}
                            onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }}
                          />
                        </div>

                        <button
                          onClick={() => update(t.id)}
                          disabled={!changed || updating === t.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "9px 18px", borderRadius: 8, border: "none", cursor: changed ? "pointer" : "not-allowed",
                            background: changed ? "#C49020" : "var(--surface-3)",
                            color: changed ? "#fff" : "var(--text-3)",
                            fontSize: 13, fontWeight: 600, transition: "all 0.15s", flexShrink: 0,
                          }}
                        >
                          {updating === t.id
                            ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                            : <Send style={{ width: 14, height: 14 }} />
                          }
                          {updating === t.id ? "Sending…" : "Update & Email"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#0F1D2E", color: "#fff", padding: "12px 22px", borderRadius: 10,
          fontSize: 13, fontWeight: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          zIndex: 9999, whiteSpace: "nowrap",
        }}>
          {toastMsg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
