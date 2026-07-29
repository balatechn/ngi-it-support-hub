"use client";
import { useState } from "react";
import { Search, Bell, Video, Sun, Moon, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header
      className="flex items-center gap-4 px-6 py-3.5 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
    >
      {/* Breadcrumbs / title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-sm hover:text-azure-600 transition-colors" style={{ color: "var(--text-secondary)" }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        )}
      </div>

      {/* Search */}
      <div className={cn("relative transition-all duration-200", searchOpen ? "w-72" : "w-44")}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        <input
          type="search"
          placeholder="Search tickets, articles…"
          className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded-lg border outline-none transition-shadow focus:ring-1 focus:ring-azure-600"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* New ticket shortcut */}
        <Link
          href="/tickets/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Ticket</span>
        </Link>

        {/* Teams remote support */}
        <Link
          href="/teams"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[13px] font-medium transition-colors"
          style={{ background: "var(--teams)" }}
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Teams</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border transition-colors hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg border transition-colors hover:opacity-80"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
