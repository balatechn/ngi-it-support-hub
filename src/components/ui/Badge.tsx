import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "status" | "priority" | "default";
  color?: string;
  bg?: string;
  className?: string;
}

export function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

export function StatusDot({ color }: { color: string }) {
  return <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", color)} />;
}
