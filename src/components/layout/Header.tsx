"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Bell, Sun, Moon, Plus, X, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const QUICK_LINKS = [
  { label: "New ticket", href: "/tickets/new" },
  { label: "AI Assistant", href: "/chat" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "My tickets", href: "/tickets" },
  { label: "Analytics", href: "/analytics" },
];

function initials(name: string) {
  return (name || "?").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";
}

interface HeaderProps {
  title?: string;
  onMobileMenu?: () => void;
}

export function Header({ title, onMobileMenu }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = session?.user?.name ?? "User";
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ngi-theme", next);
    setTheme(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/knowledge-base?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  return (
    <header style={{
      height: 58,
      flexShrink: 0,
      background: "var(--header-bg)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border-1)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 20px",
      position: "sticky",
      top: 0,
      zIndex: 30,
    }}>
      {/* Mobile menu */}
      <button onClick={onMobileMenu} className="flex lg:hidden btn btn-icon btn-ghost" style={{ flexShrink: 0 }}>
        <Menu style={{ width: 18, height: 18 }} />
      </button>

      {/* Page title */}
      {title && (
        <h1 style={{ fontWeight: 700, fontSize: 17, color: "var(--text-1)", whiteSpace: "nowrap", letterSpacing: "-0.01em" }} className="hidden sm:block">
          {title}
        </h1>
      )}

      {/* Search bar (desktop) */}
      <div className="hidden md:flex" style={{ flex: 1, maxWidth: 420 }}>
        <form onSubmit={handleSearch} style={{ width: "100%", position: "relative" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            ref={searchRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search tickets, knowledge base…"
            style={{ width: "100%", padding: "8px 12px 8px 36px", background: "var(--surface-2)", border: "1.5px solid var(--border-1)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px rgba(196,144,32,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-1)"; e.target.style.boxShadow = "none"; }}
          />
          {searchQ && (
            <button type="button" onClick={() => setSearchQ("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0 }}>
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </form>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Mobile search toggle */}
        <button onClick={() => setSearchOpen(v => !v)} className="flex md:hidden btn btn-icon btn-ghost">
          <Search style={{ width: 17, height: 17 }} />
        </button>

        {/* New ticket shortcut */}
        <Link href="/tickets/new"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--gold)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 0.15s ease", boxShadow: "0 2px 8px rgba(196,144,32,0.25)" }}
          className="hidden sm:flex">
          <Plus style={{ width: 14, height: 14 }} />
          New Request
        </Link>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn btn-icon btn-ghost" title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark"
            ? <Sun style={{ width: 17, height: 17 }} />
            : <Moon style={{ width: 17, height: 17 }} />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setNotifOpen(v => !v)} className="btn btn-icon btn-ghost" style={{ position: "relative" }}>
            <Bell style={{ width: 17, height: 17 }} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#EF4444", border: "1.5px solid var(--header-bg)" }} />
          </button>

          {notifOpen && (
            <div className="anim-scale" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 14, boxShadow: "var(--sh-lg)", zIndex: 50, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>Notifications</p>
                <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}><X style={{ width: 14, height: 14 }} /></button>
              </div>
              {[
                { title: "INC-10233 needs attention", desc: "Critical VPN ticket unassigned for 2h", time: "2h ago", dot: "#EF4444" },
                { title: "SLA breach warning", desc: "INC-10229 SLA breached – laptop overheating", time: "4h ago", dot: "#F97316" },
                { title: "Ticket resolved", desc: "INC-10227 network shares issue resolved", time: "Yesterday", dot: "#10B981" },
              ].map((n, i) => (
                <button key={i} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: i < 2 ? "1px solid var(--border-1)" : "none", transition: "background 0.12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)", marginBottom: 2 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>{n.desc}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{n.time}</p>
                    </div>
                  </div>
                </button>
              ))}
              <div style={{ padding: "10px 16px" }}>
                <button style={{ fontSize: 13, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ width: 33, height: 33, borderRadius: "50%", background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, cursor: "default" }}>
          {initials(userName)}
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="flex md:hidden anim-fade-up" style={{ position: "absolute", top: "100%", left: 0, right: 0, padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border-1)", zIndex: 40 }}>
          <form onSubmit={handleSearch} style={{ width: "100%", position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--text-3)" }} />
            <input ref={searchRef} value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search…"
              style={{ width: "100%", padding: "10px 36px", background: "var(--surface-2)", border: "1.5px solid var(--border-2)", borderRadius: 10, fontSize: 14, color: "var(--text-1)", outline: "none" }} />
          </form>
        </div>
      )}

      {/* Quick links dropdown (search suggestions) */}
      {!searchQ && searchOpen && (
        <div className="hidden md:block" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--surface)", borderBottom: "1px solid var(--border-1)", padding: "8px 16px 12px", zIndex: 40 }}>
          <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Quick links</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {QUICK_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setSearchOpen(false)}
                style={{ padding: "5px 12px", background: "var(--surface-2)", borderRadius: 99, fontSize: 13, color: "var(--text-2)", textDecoration: "none", border: "1px solid var(--border-1)", transition: "all 0.12s" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
