"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Shield, Bell, Users, Globe, Zap, Database, ChevronRight } from "lucide-react";

const sections = [
  {
    icon: Users,
    label: "User Management",
    desc: "Manage users, roles, and permissions via Microsoft Entra ID",
    badge: "Microsoft Entra ID",
    color: "#0078D4",
  },
  {
    icon: Bell,
    label: "Notifications & Alerts",
    desc: "Configure email, Teams, and SMS notification rules for tickets and SLA alerts",
    color: "#D97706",
  },
  {
    icon: Zap,
    label: "Power Automate Flows",
    desc: "Manage automated workflows for ticket assignment, approvals, and escalations",
    badge: "Power Automate",
    color: "#6264A7",
  },
  {
    icon: Globe,
    label: "Microsoft 365 Integration",
    desc: "Configure SharePoint, Teams, Intune, and Lists integration settings",
    badge: "M365",
    color: "#0078D4",
  },
  {
    icon: Shield,
    label: "Security & Compliance",
    desc: "Audit logs, data retention, and Microsoft Purview compliance settings",
    color: "#DC2626",
  },
  {
    icon: Database,
    label: "Data & Storage",
    desc: "SharePoint Lists configuration, Power BI workspace, and backup settings",
    color: "#16A34A",
  },
];

export default function SettingsPage() {
  return (
    <AppLayout title="Settings" breadcrumbs={[{ label: "Settings" }]}>
      <div className="max-w-2xl">
        <p className="text-[13px] mb-6" style={{ color: "var(--text-secondary)" }}>
          Platform configuration for administrators. Changes apply across all branches.
        </p>
        <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
          {sections.map(({ icon: Icon, label, desc, badge, color }) => (
            <button key={label} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--bg-base)] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                  {badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>{badge}</span>
                  )}
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
