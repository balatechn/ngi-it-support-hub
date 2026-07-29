"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockUsers, mockTickets } from "@/lib/mockData";
import { statusConfig, formatRelativeTime } from "@/lib/utils";
import {
  Video, Monitor, MessageSquare, Users, Phone, Share2, Shield,
  CheckCircle, Clock, Wifi, PhoneCall, ScreenShare, ChevronRight,
} from "lucide-react";

const engineers = mockUsers.filter((u) => u.role === "engineer" || u.role === "admin");

function Avatar({ name, online }: { name: string; online?: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return (
    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-azure-600 flex items-center justify-center text-white text-[13px] font-semibold">
        {initials}
      </div>
      <span
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
        style={{ background: online ? "#16A34A" : "#9CA3AF" }}
      />
    </div>
  );
}

export default function TeamsPage() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const openTickets = mockTickets.filter((t) => t.status === "open" || t.status === "in_progress");

  return (
    <AppLayout title="Teams & Remote" breadcrumbs={[{ label: "Teams & Remote Assistance" }]}>
      {/* Hero integration badge */}
      <div
        className="flex items-center gap-4 px-6 py-5 rounded-2xl mb-6"
        style={{ background: "linear-gradient(135deg, #4B4D8E 0%, #6264A7 100%)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 2228.833 2073.333" fill="white">
            <path d="M1554.637 777.5h575.713c54.391 0 98.483 44.092 98.483 98.483v524.398c0 198.886-161.093 359.979-359.979 359.979h-1.711c-198.886.028-359.979-161.037-359.979-359.923V828.971a51.478 51.478 0 0151.473-51.471z" />
            <circle cx="1943.75" cy="440.583" r="233.25" />
            <circle cx="1218.083" cy="336.917" r="336.917" />
            <path d="M1667.323 777.5H717.01a51.503 51.503 0 00-51.49 51.664l-.013 756.373c-7.845 387.494 296.605 710.441 684.098 718.286 387.494 7.845 710.441-296.605 718.286-684.098a694.171 694.171 0 00.276-34.188V828.971a51.478 51.478 0 00-51.473-51.471z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-[15px]">Microsoft Teams Integration</p>
          <p className="text-white/60 text-[12px]">Remote assistance, screen sharing, and IT chat — directly from Teams</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
          <Wifi className="w-3.5 h-3.5 text-white/80" />
          <span className="text-white/80 text-[12px] font-medium">Connected</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Remote assistance panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Start remote session */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#6264A710" }}>
                <ScreenShare className="w-5 h-5" style={{ color: "#6264A7" }} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Remote Assistance</h2>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Screen share or full remote control via Quick Assist + Teams</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {[
                { label: "Screen Sharing", icon: Monitor, desc: "View-only screen share session", color: "#0078D4" },
                { label: "Remote Control", icon: Shield, desc: "Full keyboard & mouse control", color: "#6264A7" },
                { label: "Teams Call", icon: PhoneCall, desc: "Voice or video call with IT", color: "#16A34A" },
              ].map(({ label, icon: Icon, desc, color }) => (
                <button
                  key={label}
                  onClick={() => setActiveSession(label)}
                  className="flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all hover:shadow-md"
                  style={{
                    border: activeSession === label ? `1px solid ${color}` : "1px solid var(--border)",
                    background: activeSession === label ? `${color}08` : "var(--bg-base)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {activeSession && (
              <div
                className="rounded-xl px-5 py-4 flex items-center gap-4"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-teams-500/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5" style={{ color: "#6264A7" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    {activeSession} Session Ready
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    A Teams link has been generated. Share it with the user to start the session.
                  </p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium transition-colors" style={{ background: "#6264A7" }}>
                  <Share2 className="w-3.5 h-3.5" />
                  Start in Teams
                </button>
              </div>
            )}
          </div>

          {/* Active tickets needing remote */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" style={{ color: "#0078D4" }} />
                <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Active Tickets – Remote Eligible</h2>
              </div>
              <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{openTickets.length} open</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {openTickets.slice(0, 5).map((ticket) => {
                const sConf = statusConfig[ticket.status];
                return (
                  <div key={ticket.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-base)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-semibold" style={{ color: "#0078D4" }}>{ticket.id}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${sConf.color} ${sConf.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />{sConf.label}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{ticket.title}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{ticket.requesterName} · {formatRelativeTime(ticket.updatedAt)}</p>
                    </div>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors hover:border-teams-500 hover:text-teams-500 flex-shrink-0"
                      style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right col: Engineer availability */}
        <div className="space-y-5">
          {/* Engineer status */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: "#0078D4" }} />
              <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>IT Team Status</h3>
            </div>
            <div className="space-y-3">
              {engineers.map((eng) => (
                <div key={eng.id} className="flex items-center gap-3">
                  <Avatar name={eng.name} online={eng.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{eng.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {eng.branch} · {eng.role.charAt(0).toUpperCase() + eng.role.slice(1)}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: eng.isOnline ? "#F0FDF4" : "var(--bg-base)",
                      color: eng.isOnline ? "#16A34A" : "var(--text-muted)",
                    }}
                  >
                    {eng.isOnline ? "Online" : "Away"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Open IT Support Chat", icon: MessageSquare, href: "https://teams.microsoft.com" },
                { label: "Join IT Help Desk Channel", icon: Users, href: "https://teams.microsoft.com" },
                { label: "Schedule Remote Session", icon: Clock, href: "/tickets/new" },
                { label: "Report Security Incident", icon: Shield, href: "/tickets/new" },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors hover:border-azure-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#0078D4" }} />
                  <span className="text-[13px] flex-1" style={{ color: "var(--text-primary)" }}>{label}</span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-azure-600" />
            <p className="text-[11px] leading-relaxed" style={{ color: "#1D4ED8" }}>
              Remote sessions are encrypted end-to-end via Microsoft Teams. Sessions are recorded and logged for compliance. You will always be asked for consent before a session begins.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
