import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection = "neutral",
  icon: Icon,
  iconColor = "#0078D4",
  iconBg = "#EFF6FF",
  suffix,
  className,
}: StatCardProps) {
  const deltaColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-slate-500 dark:text-slate-400",
  };

  return (
    <div className={cn("card p-5 animate-fade-in", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular leading-none" style={{ color: "var(--text-primary)" }}>
            {value}
            {suffix && <span className="text-base font-normal ml-1" style={{ color: "var(--text-muted)" }}>{suffix}</span>}
          </p>
          {delta && (
            <p className={cn("mt-1.5 text-xs", deltaColors[deltaDirection])}>
              {deltaDirection === "up" ? "↑" : deltaDirection === "down" ? "↓" : "–"} {delta}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
