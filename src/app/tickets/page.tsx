"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import { Search, Plus, RefreshCw, Loader2 } from "lucide-react";

const S_COLORS: Record<string, string> = {
  open: "#3B82F6", in_progress: "#F59E0B", pending: "#8B5CF6", resolved: "#10B981", closed: "#6B7280",
};
const P_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#CA8A04", low: "#16A34A",
};

interface Ticket {
  id: string;
  name: string;
  email: string;
  location: string;
  department: string;
  ticketType: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "open",        label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending",     label: "Pending" },
  { value: "resolved",    label: "Resolved" },
  { value: "closed",      label: "Closed" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data: Ticket[] = await res.json();
        // Only show this user's own tickets
        setAllTickets(data.filter(t => t.email === userEmail));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userEmail) load(); }, [userEmail]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allTickets.length };
    allTickets.forEach(t => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [allTickets]);

  const visible = useMemo(() => {
    let list = [...allTickets];
    if (statusFilter !== "all") list = list.filter(t => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.ticketType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTickets, statusFilter, search]);

  return (
    <AppLayout title="My Requests">
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 3 }}>My Requests</h2>
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>{allTickets.length} ticket{allTickets.length !== 1 ? "s" : ""} raised by you</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
            </button>
            <Link href="/tickets/new"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#C49020", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
              <Plus style={{ width: 14, height: 14 }} /> New Request
            </Link>
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
          {STATUS_TABS.map(({ value, label }) => {
            const active = statusFilter === value;
            const count = counts[value] ?? 0;
            return (
              <button key={value} onClick={() => setStatus(value)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${active ? "#C49020" : "var(--border-2)"}`, background: active ? "rgba(196,144,32,0.08)" : "var(--surface)", color: active ? "#C49020" : "var(--text-2)", fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                {label}
                <span style={{ background: active ? "rgba(196,144,32,0.2)" : "var(--surface-2)", color: active ? "#C49020" : "var(--text-3)", borderRadius: 99, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
          <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
            style={{ width: "100%", padding: "9px 12px 9px 34px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", outline: "none" }}
            onFocus={e => { e.target.style.borderColor = "#C49020"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }} />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "var(--text-3)" }}>
            <Loader2 style={{ width: 22, height: 22, animation: "spin 1s linear infinite", marginRight: 10 }} /> Loading your tickets…
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border-1)" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
              {allTickets.length === 0 ? "No requests raised yet" : "No tickets match your filters"}
            </p>
            {allTickets.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>
                Click <strong>+ New Request</strong> to raise your first support ticket.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map(t => {
              const sc = S_COLORS[t.status] ?? "#6B7280";
              const pc = P_COLORS[t.priority] ?? "#6B7280";
              return (
                <div key={t.id} style={{ background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: 12, padding: "14px 18px", display: "grid", gridTemplateColumns: "120px 1fr 110px 80px 80px 90px", gap: 12, alignItems: "center", cursor: "default", boxShadow: "var(--sh-xs)" }}>

                  {/* ID */}
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border-1)", whiteSpace: "nowrap" }}>
                    {t.id}
                  </span>

                  {/* Description + meta */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.description || `${t.category} ${t.ticketType}`}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {t.category} · {t.department} · {t.location}
                    </p>
                  </div>

                  {/* Status */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${sc}18`, color: sc, whiteSpace: "nowrap" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                    {t.status.replace("_", " ")}
                  </span>

                  {/* Priority */}
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${pc}18`, color: pc, textAlign: "center" }}>
                    {t.priority}
                  </span>

                  {/* Type */}
                  <span style={{ fontSize: 11, color: "var(--text-3)", textTransform: "capitalize" }}>{t.ticketType}</span>

                  {/* Date */}
                  <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>{fmt(t.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
