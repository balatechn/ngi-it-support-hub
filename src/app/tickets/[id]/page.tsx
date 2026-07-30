"use client";
import { use } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets } from "@/lib/mockData";
import Link from "next/link";
import { ArrowLeft, Clock, User, Tag, MapPin, AlertTriangle, CheckCircle2, MessageSquare, Paperclip } from "lucide-react";

const S_COLORS: Record<string, string> = {
  open: "#3B82F6", in_progress: "#F59E0B", pending: "#8B5CF6", resolved: "#10B981", closed: "#6B7280",
};
const P_COLORS: Record<string, string> = {
  critical: "#EF4444", high: "#F97316", medium: "#CA8A04", low: "#16A34A",
};

function fmtDt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = mockTickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <AppLayout title="Ticket Not Found">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
          <AlertTriangle style={{ width: 48, height: 48, color: "var(--text-3)" }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Ticket not found</p>
          <p style={{ color: "var(--text-2)" }}>Ticket {id} doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/tickets" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--brand)", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Tickets
          </Link>
        </div>
      </AppLayout>
    );
  }

  const sColor = S_COLORS[ticket.status] ?? "#6B7280";
  const pColor = P_COLORS[ticket.priority] ?? "#6B7280";

  const slaElapsed = ticket.status === "resolved" ? 100 :
    Math.min(100, Math.round((Date.now() - new Date(ticket.createdAt).getTime()) /
      (new Date(ticket.dueAt).getTime() - new Date(ticket.createdAt).getTime()) * 100));

  return (
    <AppLayout title={ticket.id}>
      <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
        {/* Back */}
        <Link href="/tickets" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)", textDecoration: "none", fontSize: 13, marginBottom: 20 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Tickets
        </Link>

        {/* Header */}
        <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)", background: "var(--surface-2)", padding: "3px 10px", borderRadius: 6, border: "1px solid var(--border-1)" }}>{ticket.id}</span>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: `${sColor}15`, color: sColor }}>
                  {ticket.status.replace("_", " ")}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: `${pColor}15`, color: pColor }}>
                  {ticket.priority} priority
                </span>
                {ticket.slaBreached && (
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#EF444415", color: "#DC2626" }}>SLA Breached</span>
                )}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 8 }}>{ticket.title}</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{ticket.description}</p>
            </div>
          </div>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { icon: <User style={{ width: 13, height: 13 }} />, label: "Requester", val: ticket.requesterName },
              { icon: <Tag style={{ width: 13, height: 13 }} />, label: "Category", val: ticket.category },
              { icon: <MapPin style={{ width: 13, height: 13 }} />, label: "Branch", val: ticket.branch },
              { icon: <User style={{ width: 13, height: 13 }} />, label: "Assignee", val: ticket.assignedToName ?? "Unassigned" },
              { icon: <Clock style={{ width: 13, height: 13 }} />, label: "Created", val: fmtDt(ticket.createdAt) },
              { icon: <Clock style={{ width: 13, height: 13 }} />, label: "Due", val: fmtDt(ticket.dueAt) },
            ].map(m => (
              <div key={m.label} style={{ padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10, border: "1px solid var(--border-1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)", marginBottom: 4 }}>
                  {m.icon}
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* SLA bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>SLA Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ticket.slaBreached ? "#EF4444" : slaElapsed > 80 ? "#F59E0B" : "#10B981" }}>
                {slaElapsed}% {ticket.slaBreached ? "— Breached" : "elapsed"}
              </span>
            </div>
            <div className="sla-bar" style={{ height: 6 }}>
              <div className="sla-fill" style={{ width: `${slaElapsed}%`, background: ticket.slaBreached ? "#EF4444" : slaElapsed > 80 ? "#F59E0B" : "#10B981" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          {/* Comments */}
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <MessageSquare style={{ width: 16, height: 16, color: "var(--gold)" }} />
              <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Comments</p>
              <span style={{ padding: "1px 8px", borderRadius: 99, fontSize: 11, background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border-1)" }}>{ticket.comments.length}</span>
            </div>

            {ticket.comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-3)" }}>
                <MessageSquare style={{ width: 28, height: 28, opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 14 }}>No comments yet. The IT team will update this ticket shortly.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ticket.comments.map(c => (
                  <div key={c.id} style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A2B40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#C49020", flexShrink: 0 }}>
                      {c.authorName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{c.authorName}</span>
                        <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "rgba(196,144,32,0.1)", color: "#C49020" }}>{c.authorRole}</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{fmtDt(c.createdAt)}</span>
                        {c.isInternal && <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#F59E0B15", color: "#D97706" }}>Internal</span>}
                      </div>
                      <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "4px 12px 12px 12px", border: "1px solid var(--border-1)", fontSize: 14, color: "var(--text-1)", lineHeight: 1.6 }}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ticket.status !== "resolved" && ticket.status !== "closed" && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-1)" }}>
                <textarea placeholder="Add a reply…" rows={3}
                  style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: "1.5px solid var(--border-2)", borderRadius: 10, fontSize: 14, color: "var(--text-1)", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                <button style={{ marginTop: 8, padding: "9px 18px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Send Reply
                </button>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Paperclip style={{ width: 15, height: 15, color: "var(--gold)" }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>Attachments</p>
              </div>
              {ticket.attachments.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>No attachments</p>
              ) : ticket.attachments.map(a => (
                <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border-1)", marginBottom: 8 }}>
                  <Paperclip style={{ width: 13, height: 13, color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{a.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)" }}>{(a.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status timeline */}
            <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20, border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", marginBottom: 14 }}>Timeline</p>
              {[
                { label: "Ticket opened", time: ticket.createdAt, color: "#3B82F6", done: true },
                { label: "Assigned to engineer", time: ticket.updatedAt, color: "#F59E0B", done: !!ticket.assignedToName },
                { label: "Resolved", time: ticket.resolvedAt ?? "", color: "#10B981", done: !!ticket.resolvedAt },
                { label: "Closed", time: "", color: "#6B7280", done: ticket.status === "closed" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < 3 ? 14 : 0, position: "relative" }}>
                  {i < 3 && <div style={{ position: "absolute", left: 9, top: 20, bottom: 0, width: 1.5, background: "var(--border-1)" }} />}
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.done ? t.color : "var(--surface-2)", border: `2px solid ${t.done ? t.color : "var(--border-2)"}`, flexShrink: 0, zIndex: 1 }}>
                    {t.done && <CheckCircle2 style={{ width: "100%", height: "100%", color: "#fff" }} />}
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: t.done ? 600 : 400, color: t.done ? "var(--text-1)" : "var(--text-3)" }}>{t.label}</p>
                    {t.time && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{fmtDt(t.time)}</p>}
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
