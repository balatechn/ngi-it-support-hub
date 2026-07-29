"use client";
import { use, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockTickets } from "@/lib/mockData";
import { statusConfig, priorityConfig, categoryLabels, formatDateTime, formatRelativeTime, getSLAStatus } from "@/lib/utils";
import {
  Paperclip, MessageSquare, Clock, AlertTriangle, User,
  Tag, Building2, MapPin, Video, Send, Lock, UserPlus,
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = mockTickets.find((t) => t.id === id);
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  if (!ticket) notFound();

  const sConf = statusConfig[ticket.status];
  const pConf = priorityConfig[ticket.priority];
  const sla = getSLAStatus(ticket.dueAt, ticket.resolvedAt);

  return (
    <AppLayout
      title={ticket.id}
      breadcrumbs={[
        { label: "Tickets", href: "/tickets" },
        { label: ticket.id },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket header card */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${pConf.border.replace("border-", "bg-")}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-[12px] font-semibold" style={{ color: "#0078D4" }}>{ticket.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${sConf.color} ${sConf.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />{sConf.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pConf.color} ${pConf.bg}`}>
                    {pConf.label}
                  </span>
                  {sla === "breached" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-red-700 bg-red-50">
                      <AlertTriangle className="w-3 h-3" />SLA Breached
                    </span>
                  )}
                </div>
                <h1 className="text-[18px] font-bold leading-snug mb-3" style={{ color: "var(--text-primary)" }}>
                  {ticket.title}
                </h1>
                <div
                  className="text-[14px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {ticket.description}
                </div>
              </div>
            </div>

            {/* Tags */}
            {ticket.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                {ticket.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "var(--bg-base)", color: "var(--text-secondary)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Attachments */}
            {ticket.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px]" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      <Paperclip className="w-3.5 h-3.5" />
                      {att.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <MessageSquare className="w-4 h-4" style={{ color: "#0078D4" }} />
              <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
                Activity ({ticket.comments.length})
              </h2>
            </div>

            {ticket.comments.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>No comments yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {ticket.comments.map((comment) => (
                  <div key={comment.id} className="px-5 py-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-azure-600 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
                      {comment.authorName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{comment.authorName}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded font-medium capitalize" style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}>{comment.authorRole}</span>
                        {comment.isInternal && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5" />Internal note
                          </span>
                        )}
                        <span className="ml-auto text-[11px]" style={{ color: "var(--text-muted)" }}>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="border-t px-5 py-4" style={{ borderColor: "var(--border)", background: "var(--bg-base)" }}>
              <textarea
                rows={3}
                placeholder="Add a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-[13px] outline-none resize-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="w-3.5 h-3.5 accent-amber-500" />
                  <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Internal note (visible to IT team only)</span>
                </label>
                <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="card p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>Ticket Details</h3>
            <div className="space-y-3.5">
              {[
                { icon: User, label: "Requester", value: `${ticket.requesterName}\n${ticket.requesterEmail}` },
                { icon: UserPlus, label: "Assigned To", value: ticket.assignedToName ?? "Unassigned" },
                { icon: Tag, label: "Category", value: categoryLabels[ticket.category] },
                { icon: Building2, label: "Department", value: ticket.department },
                { icon: MapPin, label: "Branch", value: ticket.branch },
                { icon: Clock, label: "Created", value: formatDateTime(ticket.createdAt) },
                { icon: Clock, label: "SLA Due", value: formatDateTime(ticket.dueAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-[12px] whitespace-pre-line" style={{ color: "var(--text-primary)" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors">
                {ticket.status === "open" ? "Accept & Start Work" : "Mark as Resolved"}
              </button>
              <button className="w-full px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors hover:bg-[var(--bg-base)]" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Re-assign Ticket
              </button>
              <Link href="/teams" className="flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg text-white text-[13px] font-medium transition-colors" style={{ background: "#6264A7" }}>
                <Video className="w-3.5 h-3.5" />
                Start Teams Session
              </Link>
            </div>
          </div>

          {/* SLA indicator */}
          <div
            className="rounded-xl p-4"
            style={{
              background: sla === "breached" ? "#FEF2F2" : sla === "warning" ? "#FFFBEB" : "#F0FDF4",
              border: `1px solid ${sla === "breached" ? "#FECACA" : sla === "warning" ? "#FDE68A" : "#BBF7D0"}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {sla === "breached" ? <AlertTriangle className="w-4 h-4 text-red-500" /> : sla === "warning" ? <Clock className="w-4 h-4 text-amber-500" /> : <Clock className="w-4 h-4 text-emerald-500" />}
              <p className="text-[13px] font-semibold" style={{ color: sla === "breached" ? "#DC2626" : sla === "warning" ? "#D97706" : "#16A34A" }}>
                SLA {sla === "breached" ? "Breached" : sla === "warning" ? "At Risk" : "On Track"}
              </p>
            </div>
            <p className="text-[11px]" style={{ color: sla === "breached" ? "#DC2626" : "#6B7280" }}>
              {ticket.slaTier.toUpperCase()} tier · Due {formatDateTime(ticket.dueAt)}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
