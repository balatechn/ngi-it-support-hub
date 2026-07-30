"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockAssets } from "@/lib/mockData";
import { assetTypeLabels, assetStatusConfig, formatDate } from "@/lib/utils";
import type { AssetType } from "@/lib/types";
import { Monitor, Laptop, Printer, Smartphone, Server, Package, Search } from "lucide-react";

const typeIcons: Record<AssetType, React.ReactNode> = {
  laptop:           <Laptop className="w-5 h-5" />,
  desktop:          <Monitor className="w-5 h-5" />,
  monitor:          <Monitor className="w-5 h-5" />,
  printer:          <Printer className="w-5 h-5" />,
  mobile:           <Smartphone className="w-5 h-5" />,
  server:           <Server className="w-5 h-5" />,
  network:          <Server className="w-5 h-5" />,
  software_license: <Package className="w-5 h-5" />,
  peripheral:       <Package className="w-5 h-5" />,
};

const TYPE_COLORS: Record<AssetType, string> = {
  laptop:           "#1A2B40",
  desktop:          "#0078D4",
  monitor:          "#6264A7",
  printer:          "#8B5CF6",
  mobile:           "#059669",
  server:           "#DC2626",
  network:          "#C49020",
  software_license: "#0891B2",
  peripheral:       "#78716C",
};

export default function QuickAssetsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockAssets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !a.assetTag.toLowerCase().includes(q) && !(a.assignedToName ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const summary = {
    total:    mockAssets.length,
    assigned: mockAssets.filter(a => a.status === "assigned").length,
    stock:    mockAssets.filter(a => a.status === "in_stock").length,
    repair:   mockAssets.filter(a => a.status === "in_repair").length,
  };

  return (
    <AppLayout title="Quick Assets" breadcrumbs={[{ label: "Quick Assets" }]}>
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",    value: summary.total,    color: "#1A2B40" },
          { label: "Assigned", value: summary.assigned, color: "#C49020" },
          { label: "In Stock", value: summary.stock,    color: "#059669" },
          { label: "In Repair",value: summary.repair,   color: "#DC2626" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl px-5 py-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-[26px] font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + type filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="search"
            placeholder="Search name, tag, or user…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-[13px] outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: typeFilter === "all" ? "#1A2B40" : "var(--bg-card)", color: typeFilter === "all" ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)" }}
          >All</button>
          {(["laptop", "desktop", "mobile", "printer", "server"] as AssetType[]).map(t => (
            <button key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{ background: typeFilter === t ? "#1A2B40" : "var(--bg-card)", color: typeFilter === t ? "#fff" : "var(--text-secondary)", border: "1px solid var(--border)" }}
            >{assetTypeLabels[t]}</button>
          ))}
        </div>
      </div>

      {/* Asset cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[14px]" style={{ color: "var(--text-muted)" }}>
          <Package className="w-8 h-8 mb-3 opacity-30" />
          No assets match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(asset => {
            const sc = assetStatusConfig[asset.status];
            const warrantyDays = Math.ceil((new Date(asset.warrantyExpiry).getTime() - Date.now()) / 86400000);
            const color = TYPE_COLORS[asset.type];

            return (
              <div key={asset.id} className="rounded-xl p-4 transition-shadow hover:shadow-md cursor-default"
                style={{ background: "#fff", border: "1px solid var(--border)" }}>
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
                    {typeIcons[asset.type]}
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: "var(--bg-base)", color: "#0078D4" }}>
                    {asset.assetTag}
                  </span>
                </div>

                {/* Name + brand */}
                <p className="text-[13px] font-semibold leading-snug mb-0.5" style={{ color: "var(--text-primary)" }}>{asset.name}</p>
                <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>{asset.brand} · {asset.serialNumber}</p>

                {/* Assigned to */}
                <p className="text-[12px] truncate mb-3" style={{ color: "var(--text-secondary)" }}>
                  {asset.assignedToName ?? <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.color} ${sc.bg}`}>
                    {sc.label}
                  </span>
                  <span className={`text-[11px] ${warrantyDays < 0 ? "text-red-500" : warrantyDays < 90 ? "text-amber-500" : ""}`}
                    style={warrantyDays >= 90 ? { color: "var(--text-muted)" } : {}}>
                    {warrantyDays < 0 ? "Expired" : `Warranty ${formatDate(asset.warrantyExpiry)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-[12px]" style={{ color: "var(--text-muted)" }}>
        Showing {filtered.length} of {mockAssets.length} assets
      </p>
    </AppLayout>
  );
}
