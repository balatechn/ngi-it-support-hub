"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockKBArticles } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import {
  Search, Star, Eye, ThumbsUp, BookOpen, Wifi,
  Shield, Printer, Monitor, Mail, Globe, Key, ChevronRight, ExternalLink,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  "Account & Access": <Key className="w-5 h-5" />,
  "Network & VPN": <Wifi className="w-5 h-5" />,
  "Remote Support": <Globe className="w-5 h-5" />,
  "Device Management": <Monitor className="w-5 h-5" />,
  "Email & Outlook": <Mail className="w-5 h-5" />,
  "Security": <Shield className="w-5 h-5" />,
  "Hardware": <Printer className="w-5 h-5" />,
  "Software": <BookOpen className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  "Account & Access": "#6264A7",
  "Network & VPN": "#0078D4",
  "Remote Support": "#16A34A",
  "Device Management": "#D97706",
  "Email & Outlook": "#0078D4",
  "Security": "#DC2626",
  "Hardware": "#7C3AED",
  "Software": "#0891B2",
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(mockKBArticles.map((a) => a.category)));

  const filtered = mockKBArticles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCat = !activeCategory || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = mockKBArticles.filter((a) => a.featured);

  return (
    <AppLayout title="Knowledge Base" breadcrumbs={[{ label: "Knowledge Base" }]}>
      {/* Hero search */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071629 0%, #0C2D4E 100%)" }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0078D4 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-2">Self-Service Portal</p>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ textWrap: "balance" }}>
          How can we help?
        </h1>
        <p className="text-white/50 text-sm mb-6">Search {mockKBArticles.length} articles, guides, and SOPs</p>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="search"
            placeholder="Search for VPN setup, password reset, printer issues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
          />
        </div>
      </div>

      {!search && (
        <>
          {/* Category grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {categories.map((cat) => {
              const count = mockKBArticles.filter((a) => a.category === cat).length;
              const color = categoryColors[cat] ?? "#0078D4";
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className="card p-4 text-left transition-all hover:shadow-card-hover"
                  style={isActive ? { borderColor: color, boxShadow: `0 0 0 2px ${color}30` } : {}}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, color }}>
                    {categoryIcons[cat] ?? <BookOpen className="w-5 h-5" />}
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{cat}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{count} article{count !== 1 ? "s" : ""}</p>
                </button>
              );
            })}
          </div>

          {/* Featured articles */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: "#D97706" }} />
              <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((article) => {
                const color = categoryColors[article.category] ?? "#0078D4";
                return (
                  <div key={article.id} className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold leading-snug" style={{ color: "var(--text-primary)", textWrap: "balance" }}>
                      {article.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                          <Eye className="w-3 h-3" />{article.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                          <ThumbsUp className="w-3 h-3" />{article.helpful}%
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" style={{ color: "#0078D4" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Article list */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {search ? `Results for "${search}"` : activeCategory ?? "All Articles"}
          </h2>
          <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{filtered.length} articles</span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              No articles found. <button className="underline" style={{ color: "#0078D4" }} onClick={() => setSearch("")}>Clear search</button>
            </div>
          ) : (
            filtered.map((article) => {
              const color = categoryColors[article.category] ?? "#0078D4";
              return (
                <div key={article.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-base)] cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                    {categoryIcons[article.category] ?? <BookOpen className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {article.title}
                      </p>
                      {article.featured && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[12px] truncate" style={{ color: "var(--text-secondary)" }}>{article.excerpt}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                        {article.category}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <Eye className="w-3 h-3" />{article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <ThumbsUp className="w-3 h-3" />{article.helpful}%
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        Updated {formatDate(article.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
