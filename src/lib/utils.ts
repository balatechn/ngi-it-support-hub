import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import type { TicketStatus, TicketPriority, AssetStatus, AssetType, TicketCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
}

export function getSLAStatus(dueAt: string, resolvedAt?: string): "safe" | "warning" | "breached" {
  const now = new Date();
  const due = new Date(dueAt);
  const resolved = resolvedAt ? new Date(resolvedAt) : null;

  if (resolved) {
    return resolved <= due ? "safe" : "breached";
  }

  const hoursRemaining = differenceInHours(due, now);
  if (hoursRemaining < 0) return "breached";
  if (hoursRemaining < 4) return "warning";
  return "safe";
}

export function getHoursRemaining(dueAt: string): number {
  return differenceInHours(new Date(dueAt), new Date());
}

export const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string; dot: string }> = {
  open: {
    label: "Open",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    dot: "bg-amber-500",
  },
  pending: {
    label: "Pending",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    dot: "bg-purple-500",
  },
  resolved: {
    label: "Resolved",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    dot: "bg-slate-400",
  },
};

export const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string; border: string }> = {
  critical: {
    label: "Critical",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-500",
  },
  high: {
    label: "High",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-500",
  },
  medium: {
    label: "Medium",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-400",
  },
  low: {
    label: "Low",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-400",
  },
};

export const categoryLabels: Record<TicketCategory, string> = {
  hardware: "Hardware",
  software: "Software",
  network: "Network",
  account: "Account & Access",
  printer: "Printer",
  email: "Email & Outlook",
  vpn: "VPN",
  security: "Security",
  other: "Other",
};

export const assetTypeLabels: Record<AssetType, string> = {
  laptop: "Laptop",
  desktop: "Desktop",
  monitor: "Monitor",
  printer: "Printer",
  mobile: "Mobile Device",
  server: "Server",
  network: "Network Equipment",
  software_license: "Software License",
  peripheral: "Peripheral",
};

export const assetStatusConfig: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
  in_stock: { label: "In Stock", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  in_repair: { label: "In Repair", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
  retired: { label: "Retired", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  lost: { label: "Lost", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateTicketId(): string {
  return `INC-${Math.floor(Math.random() * 90000) + 10000}`;
}
