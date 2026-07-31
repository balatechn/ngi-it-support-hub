"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Bell, Search, ChevronDown, LogOut, Settings, Menu, X, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard" },
];

const NAV_ADMIN = [
  { href: "/admin/tickets", label: "Ticket Inbox" },
];

const MOCK_NOTIFS = [
  { id: 1, text: "Ticket #1042 resolved by Ravi Kumar", time: "2m ago", unread: true },
  { id: 2, text: "SLA breach warning: Ticket #1038", time: "15m ago", unread: true },
  { id: 3, text: "New comment on Ticket #1036", time: "1h ago", unread: false },
];

function initials(name: string) {
  return (name || "U").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "U";
}

const AV_COLORS = ["#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#C49020"];
function avColor(name: string) { return AV_COLORS[(name.charCodeAt(0) ?? 0) % AV_COLORS.length]; }

export function TopNav() {
  const pathname          = usePathname();
  const { data: session } = useSession();
  const user    = session?.user;
  const isAdmin = (user as { role?: string } | undefined)?.role === "admin";

  const [theme, setTheme]         = useState<"light"|"dark">("light");
  const [mobileOpen, setMobile]   = useState(false);
  const [notifOpen, setNotif]     = useState(false);
  const [userOpen, setUser]       = useState(false);
  const [search, setSearch]       = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "light"|"dark"|null;
    if (saved) applyTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  }, []);

  function applyTheme(t: "light"|"dark") {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobile(false); }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/tickets") return pathname === "/tickets" || (pathname.startsWith("/tickets/") && !pathname.startsWith("/tickets/new"));
    return pathname === href || pathname.startsWith(href + "/");
  };

  const unreadCount = MOCK_NOTIFS.filter(n => n.unread).length;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: "0 14px",
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    color: active ? "#FFFFFF" : "rgba(255,255,255,0.58)",
    borderBottom: active ? "2px solid #C49020" : "2px solid transparent",
    transition: "color 0.15s, background 0.15s",
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    position: "relative",
  });

  const allNav = isAdmin ? [...NAV_MAIN, ...NAV_ADMIN] : NAV_MAIN;

  return (
    <>
      <header style={{
        background: "#1A2B40",
        height: 48,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "0 18px 0 16px", height: "100%",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          textDecoration: "none", flexShrink: 0,
        }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 22 22" fill="none">
              <path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>IT Support Hub</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1 }}>National Group India</p>
          </div>
        </Link>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex" style={{ height: "100%", alignItems: "stretch" }}>
          {NAV_MAIN.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={tabStyle(active)}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.58)"; }}}
              >
                {label}
              </Link>
            );
          })}

          {/* New Request — gold accent tab, always visible */}
          <Link href="/tickets/new" style={{
            ...tabStyle(isActive("/tickets/new")),
            color: isActive("/tickets/new") ? "#C49020" : "rgba(196,144,32,0.85)",
            fontWeight: 600,
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C49020"; (e.currentTarget as HTMLElement).style.background = "rgba(196,144,32,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isActive("/tickets/new") ? "#C49020" : "rgba(196,144,32,0.85)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            + New Request
          </Link>

          {isAdmin && (
            <>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "10px 8px", flexShrink: 0 }} />
              {NAV_ADMIN.map(({ href, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} style={tabStyle(active)}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.58)"; }}}
                  >
                    {label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Right: Search + Notif + Theme + User */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: 4, paddingRight: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                paddingLeft: 28, paddingRight: 10,
                height: 28, width: 170,
                fontSize: 12, color: "#FFFFFF",
                outline: "none",
              }}
              onFocus={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(196,144,32,0.5)"; }}
              onBlur={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button onClick={() => { setNotif(v => !v); setUser(false); }}
              style={{ width: 32, height: 32, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Bell style={{ width: 16, height: 16, color: "rgba(255,255,255,0.65)" }} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7, borderRadius: "50%", background: "#EF4444", border: "1.5px solid #1A2B40" }} />
              )}
            </button>
            {notifOpen && (
              <div className="anim-scale" style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                width: 300, borderRadius: 10, overflow: "hidden",
                background: "var(--surface)", border: "1px solid var(--border-2)",
                boxShadow: "var(--sh-lg)",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>Notifications</p>
                  <span style={{ fontSize: 11, color: "var(--gold)", cursor: "pointer" }}>Mark all read</span>
                </div>
                {MOCK_NOTIFS.map(n => (
                  <div key={n.id} style={{
                    padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
                    borderBottom: "1px solid var(--border-1)",
                    background: n.unread ? "var(--gold-pale)" : "transparent",
                  }}>
                    {n.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0, marginTop: 5 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={() => applyTheme(theme === "light" ? "dark" : "light")}
            style={{ width: 32, height: 32, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {theme === "dark"
              ? <Sun style={{ width: 15, height: 15, color: "rgba(255,255,255,0.65)" }} />
              : <Moon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.65)" }} />
            }
          </button>

          {/* User */}
          <div ref={userRef} style={{ position: "relative" }}>
            <button onClick={() => { setUser(v => !v); setNotif(false); }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 8px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: avColor(user?.name ?? "U"),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#FFF", flexShrink: 0,
              }}>
                {initials(user?.name ?? "U")}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(user?.name ?? "User").split(" ")[0]}
              </span>
              <ChevronDown style={{ width: 12, height: 12, color: "rgba(255,255,255,0.4)", transform: userOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>

            {userOpen && (
              <div className="anim-scale" style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                width: 220, borderRadius: 10, overflow: "hidden",
                background: "var(--surface)", border: "1px solid var(--border-2)",
                boxShadow: "var(--sh-lg)",
              }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-1)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{user?.name ?? "User"}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{user?.email ?? ""}</p>
                  {isAdmin && <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600, color: "#C49020", background: "rgba(196,144,32,0.12)", padding: "2px 7px", borderRadius: 4 }}>Admin</span>}
                </div>
                <div style={{ padding: "4px 0" }}>
                  <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 12, color: "var(--text-1)", textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Settings style={{ width: 14, height: 14 }} /> Settings
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", fontSize: 12, color: "#EF4444", width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <LogOut style={{ width: 14, height: 14 }} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="flex md:hidden"
          onClick={() => setMobile(v => !v)}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", marginRight: 8 }}
        >
          {mobileOpen
            ? <X style={{ width: 20, height: 20, color: "#FFF" }} />
            : <Menu style={{ width: 20, height: 20, color: "#FFF" }} />
          }
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="flex md:hidden flex-col" style={{ background: "#0F1D2E", borderBottom: "1px solid rgba(255,255,255,0.08)", zIndex: 99 }}>
          {/* Dashboard */}
          <Link href="/dashboard" style={{ padding: "12px 20px", fontSize: 13, fontWeight: isActive("/dashboard") ? 600 : 400, color: isActive("/dashboard") ? "#FFF" : "rgba(255,255,255,0.6)", borderLeft: isActive("/dashboard") ? "3px solid #C49020" : "3px solid transparent", textDecoration: "none", display: "block" }}>Dashboard</Link>
          {/* New Request */}
          <Link href="/tickets/new" style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "#C49020", borderLeft: isActive("/tickets/new") ? "3px solid #C49020" : "3px solid transparent", textDecoration: "none", display: "block" }}>+ New Request</Link>
          {/* Admin: Ticket Inbox */}
          {isAdmin && (
            <Link href="/admin/tickets" style={{ padding: "12px 20px", fontSize: 13, fontWeight: isActive("/admin/tickets") ? 600 : 400, color: isActive("/admin/tickets") ? "#FFF" : "rgba(255,255,255,0.6)", borderLeft: isActive("/admin/tickets") ? "3px solid #C49020" : "3px solid transparent", textDecoration: "none", display: "block" }}>Ticket Inbox</Link>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: avColor(user?.name ?? "U"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FFF", flexShrink: 0 }}>
              {initials(user?.name ?? "U")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>{user?.name ?? "User"}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user?.email ?? ""}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <LogOut style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
