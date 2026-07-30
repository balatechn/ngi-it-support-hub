"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Video, Monitor, ChevronDown, LogOut } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const NAV = [
  { label: "Teams & Remote", href: "/teams",  icon: Video },
  { label: "Quick Assets",   href: "/assets", icon: Monitor },
];

export function TopNav() {
  const pathname          = usePathname();
  const { data: session } = useSession();
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header
      className="flex items-center flex-shrink-0"
      style={{ background: "#1A2B40", height: 52, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo */}
      <Link href="/teams" className="flex items-center gap-2.5 px-5 h-full border-r flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#C49020" }}>
          <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
            <path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-[13px] leading-tight">IT Support Hub</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>National Group India</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex items-center h-full px-4 gap-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className="relative flex items-center gap-2 px-4 h-full text-[13px] font-medium transition-colors"
              style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: "#C49020" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* User */}
      <div ref={ref} className="relative px-4">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: "#C49020" }}>
            {getInitials(session?.user?.name ?? "U")}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-white text-[12px] font-medium leading-tight max-w-[120px] truncate">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-[10px] max-w-[120px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
              {session?.user?.email ?? ""}
            </p>
          </div>
          <ChevronDown className={cn("w-3 h-3 transition-transform ml-1", open && "rotate-180")} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden z-50"
            style={{ background: "#FFFFFF", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(26,43,64,0.18)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-base)" }}>
              <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{session?.user?.name ?? "User"}</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{session?.user?.email ?? ""}</p>
            </div>
            <div className="py-1">
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-[13px] text-red-600 transition-colors hover:bg-red-50">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
