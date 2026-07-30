"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Ticket, Plus, Bot, BookOpen, BarChart3,
  ShieldCheck, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Megaphone,
} from "lucide-react";

const NAV_MAIN = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tickets",        icon: Ticket,          label: "My Tickets" },
  { href: "/tickets/new",    icon: Plus,            label: "New Request", accent: true },
  { href: "/chat",           icon: Bot,             label: "AI Assistant" },
  { href: "/knowledge-base", icon: BookOpen,        label: "Knowledge Base" },
];

const NAV_ADMIN = [
  { href: "/admin",     icon: ShieldCheck, label: "Admin Panel" },
  { href: "/analytics", icon: BarChart3,   label: "Analytics" },
  { href: "/team",      icon: Users,       label: "Team" },
];

const NGILogo = () => (
  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
      <path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

const AV_COLORS = ["#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#C49020","#1A2B40"];
function avColor(name: string) { return AV_COLORS[(name.charCodeAt(0) ?? 0) % AV_COLORS.length]; }

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = (user as { role?: string } | null | undefined)?.role === "admin";
  const userName = user?.name ?? "User";

  const isActive = (href: string) => {
    if (href === "/tickets") return pathname === "/tickets";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: collapsed ? 62 : 240,
      flexShrink: 0,
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      transition: "width 0.25s cubic-bezier(0.16,1,0.3,1)",
      overflow: "hidden",
      boxShadow: "2px 0 20px rgba(0,0,0,0.25)",
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 14px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <NGILogo />
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: "nowrap" }}>IT Support Hub</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, whiteSpace: "nowrap" }}>National Group India</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {/* Main items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_MAIN.map(({ href, icon: Icon, label, accent }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}
                className="sidebar-nav-item"
                style={{
                  background: accent && !active
                    ? "rgba(196,144,32,0.12)"
                    : active ? "rgba(196,144,32,0.15)" : undefined,
                  borderLeftColor: accent || active ? "#C49020" : undefined,
                  color: active ? "#FFFFFF" : accent ? "rgba(255,255,255,0.8)" : undefined,
                  justifyContent: collapsed ? "center" : undefined,
                  padding: collapsed ? "9px" : undefined,
                }}>
                <Icon className="nav-icon" style={{ width: 17, height: 17, flexShrink: 0, color: active ? "#C49020" : accent ? "#C49020" : undefined }} />
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Announcements */}
        <div style={{ margin: "8px 0 2px", padding: "0 4px" }}>
          <Link href="/announcements"
            className="sidebar-nav-item"
            style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "9px" : undefined }}>
            <Megaphone className="nav-icon" style={{ width: 17, height: 17, flexShrink: 0 }} />
            {!collapsed && <span>Announcements</span>}
          </Link>
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div style={{ marginTop: 16 }}>
            {!collapsed && (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 8px 6px", whiteSpace: "nowrap" }}>
                Admin
              </p>
            )}
            {collapsed && <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 4px" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_ADMIN.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    className="sidebar-nav-item"
                    style={{
                      background: active ? "rgba(196,144,32,0.15)" : undefined,
                      borderLeftColor: active ? "#C49020" : undefined,
                      color: active ? "#FFFFFF" : undefined,
                      justifyContent: collapsed ? "center" : undefined,
                      padding: collapsed ? "9px" : undefined,
                    }}>
                    <Icon className="nav-icon" style={{ width: 17, height: 17, flexShrink: 0, color: active ? "#C49020" : undefined }} />
                    {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 4px 10px" }} />
          <Link href="/settings"
            className="sidebar-nav-item"
            style={{ justifyContent: collapsed ? "center" : undefined, padding: collapsed ? "9px" : undefined }}>
            <Settings className="nav-icon" style={{ width: 17, height: 17, flexShrink: 0 }} />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* User + collapse */}
      <div style={{ padding: "10px 8px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, marginBottom: 4, overflow: "hidden" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: avColor(userName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials(userName)}
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email ?? ""}</p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "9px" : "8px 10px", background: "none", border: "none", cursor: "pointer", borderRadius: 8, color: "rgba(255,255,255,0.35)", fontSize: 13, transition: "all 0.15s", justifyContent: collapsed ? "center" : undefined }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}>
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button onClick={onToggle}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: collapsed ? "9px" : "8px 10px", background: "none", border: "none", cursor: "pointer", borderRadius: 8, color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 2, transition: "color 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; }}>
          {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <><ChevronLeft style={{ width: 14, height: 14 }} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
