"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockAssets } from "@/lib/mockData";
import { assetTypeLabels, assetStatusConfig, formatDate } from "@/lib/utils";
import type { AssetType, AssetStatus } from "@/lib/types";
import { Monitor, Laptop, Printer, Smartphone, Server, Package, Search, Plus, Filter, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

const typeIcons: Record<AssetType, React.ReactNode> = {
  laptop: <Laptop className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  monitor: <Monitor className="w-4 h-4" />,
  printer: <Printer className="w-4 h-4" />,
  mobile: <Smartphone className="w-4 h-4" />,
  server: <Server className="w-4 h-4" />,
  network: <Server className="w-4 h-4" />,
  software_license: <Package className="w-4 h-4" />,
  peripheral: <Package className="w-4 h-4" />,
};

export default function AssetsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockAssets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.assetTag.toLowerCase().includes(search.toLowerCase()) && !(a.assignedToName ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalAssets = mockAssets.length;
  const assigned = mockAssets.filter((a) => a.status === "assigned").length;
  const inStock = mockAssets.filter((a) => a.status === "in_stock").length;
  const inRepair = mockAssets.filter((a) => a.status === "in_repair").length;

  const warrantySoon = mockAssets.filter((a) => {
    const days = Math.ceil((new Date(a.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days < 90 && days > 0;
  }).length;

  return (
    <AppLayout title="Asset Management" breadcrumbs={[{ label: "Asset Management" }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Assets" value={totalAssets} icon={Package} iconColor="#0078D4" iconBg="#EFF6FF" />
        <StatCard label="Assigned" value={assigned} icon={Monitor} iconColor="#6264A7" iconBg="#F3F0FF" />
        <StatCard label="In Stock" value={inStock} icon={Package} iconColor="#16A34A" iconBg="#F0FDF4" />
        <StatCard label="In Repair" value={inRepair} delta={warrantySoon > 0 ? `${warrantySoon} warranties expiring soon` : undefined} deltaDirection="down" icon={AlertCircle} iconColor="#D97706" iconBg="#FFFBEB" />
      </div>

      {/* Main card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            <input
              type="search"
              placeholder="Search assets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border text-[13px] outline-none w-52"
              style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-[13px] outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Types</option>
            {(Object.entries(assetTypeLabels) as [AssetType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-[13px] outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <option value="all">All Statuses</option>
            {(["assigned", "in_stock", "in_repair", "retired", "lost"] as AssetStatus[]).map((s) => (
              <option key={s} value={s}>{assetStatusConfig[s].label}</option>
            ))}
          </select>

          <div className="ml-auto">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[13px] font-medium bg-azure-600 hover:bg-azure-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left">Asset Tag</th>
                <th className="px-3 py-3 text-left">Name / Model</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">Serial Number</th>
                <th className="px-3 py-3 text-left">Assigned To</th>
                <th className="px-3 py-3 text-left">Branch</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Warranty</th>
                <th className="px-5 py-3 text-left">Last Audit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No assets found
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => {
                  const sConf = assetStatusConfig[asset.status];
                  const warrantyDays = Math.ceil((new Date(asset.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const warrantyExpired = warrantyDays < 0;
                  const warrantySoonFlag = warrantyDays < 90 && warrantyDays >= 0;

                  return (
                    <tr key={asset.id} className="cursor-pointer">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] font-semibold" style={{ color: "#0078D4" }}>
                          {asset.assetTag}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{asset.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{asset.brand}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                          <span className="w-5 h-5 flex items-center justify-center opacity-70">{typeIcons[asset.type]}</span>
                          <span className="text-[12px]">{assetTypeLabels[asset.type]}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-mono text-[11px]" style={{ color: "var(--text-secondary)" }}>
                          {asset.serialNumber}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {asset.assignedToName ? (
                          <div>
                            <p className="text-[13px]" style={{ color: "var(--text-primary)" }}>{asset.assignedToName}</p>
                            {asset.department && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{asset.department}</p>}
                          </div>
                        ) : (
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {asset.branch}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${sConf.color} ${sConf.bg}`}>
                          {sConf.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[12px] ${warrantyExpired ? "text-red-600" : warrantySoonFlag ? "text-amber-600" : ""}`} style={!warrantyExpired && !warrantySoonFlag ? { color: "var(--text-secondary)" } : {}}>
                          {warrantyExpired ? "Expired" : formatDate(asset.warrantyExpiry)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {formatDate(asset.lastAuditDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t text-[12px]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Showing {filtered.length} of {mockAssets.length} assets
        </div>
      </div>
    </AppLayout>
  );
}
