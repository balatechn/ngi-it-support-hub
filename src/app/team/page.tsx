"use client";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockUsers, mockEngineerStats } from "@/lib/mockData";
import { Users, Shield, Briefcase, User as UserIcon, Mail, Building2, MapPin } from "lucide-react";

const roleConfig = {
  admin: { label: "Admin", color: "#DC2626", bg: "#FEF2F2" },
  engineer: { label: "IT Engineer", color: "#0078D4", bg: "#EFF6FF" },
  manager: { label: "IT Manager", color: "#6264A7", bg: "#F3F0FF" },
  employee: { label: "Employee", color: "#6B7280", bg: "#F9FAFB" },
};

export default function TeamPage() {
  const itTeam = mockUsers.filter((u) => u.role !== "employee");

  return (
    <AppLayout title="Team Members" breadcrumbs={[{ label: "Team Members" }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {itTeam.map((user) => {
          const roleConf = roleConfig[user.role];
          const stats = mockEngineerStats.find((e) => e.id === user.id);
          const initials = user.name.split(" ").map((n) => n[0]).join("");

          return (
            <div key={user.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-azure-600 flex items-center justify-center text-white text-[14px] font-bold">
                    {initials}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: user.isOnline ? "#16A34A" : "#9CA3AF" }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5" style={{ background: roleConf.bg, color: roleConf.color }}>
                    {roleConf.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { icon: Mail, value: user.email },
                  { icon: Building2, value: user.department },
                  { icon: MapPin, value: user.branch },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {stats && (
                <div className="pt-3 border-t grid grid-cols-3 gap-2 text-center" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-[15px] font-bold tabular" style={{ color: "var(--text-primary)" }}>{stats.resolved}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Resolved</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold tabular" style={{ color: "var(--text-primary)" }}>{stats.avgTime}h</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Avg Time</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold tabular" style={{ color: "#16A34A" }}>{stats.slaCompliance}%</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>SLA</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
