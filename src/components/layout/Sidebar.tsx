"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Monitor,
  Clock,
  BarChart2,
  Video,
  Settings,
  Shield,
  Users,
  ChevronRight,
  Wifi,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/tickets", icon: Ticket, badge: "24" },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "Asset Management", href: "/assets", icon: Monitor },
  { label: "SLA Monitor", href: "/sla", icon: Clock, alert: true },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Teams & Remote", href: "/teams", icon: Video },
];

const secondary = [
  { label: "Team Members",  href: "/team",     icon: Users },
  { label: "Entra ID Admin",href: "/admin",    icon: Shield },
  { label: "Settings",      href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="sidebar flex flex-col h-screen w-64 flex-shrink-0 select-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-azure-600">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">IT Support Hub</p>
          <p className="text-white/40 text-[11px]">National Group India</p>
        </div>
      </div>

      {/* Teams status pill */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-white/5 rounded-md px-3 py-2">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] text-white/60">Teams: Connected</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase text-white/25">
          Navigation
        </p>

        {nav.map(({ label, href, icon: Icon, badge, alert }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link flex items-center gap-3 px-3 py-2 text-sm", isActive && "active")}
            >
              <Icon className="w-4 h-4 flex-shrink-0 opacity-90" />
              <span className="flex-1 truncate">{label}</span>
              {badge && !isActive && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-azure-600 text-white text-[10px] font-semibold tabular">
                  {badge}
                </span>
              )}
              {alert && !isActive && (
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}

        <div className="mt-4 mb-2">
          <div className="border-t border-white/10 mb-3" />
          <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase text-white/25">
            Administration
          </p>
          {secondary.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn("sidebar-link flex items-center gap-3 px-3 py-2 text-sm", isActive && "active")}
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
                <span className="flex-1 truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-azure-600 text-white text-xs font-semibold flex-shrink-0">
            {getInitials(session?.user?.name ?? "User")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-medium truncate">
              {session?.user?.name ?? "Demo User"}
            </p>
            <p className="text-white/40 text-[11px] truncate">
              {session?.user?.email ?? "demo@contoso.com"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
