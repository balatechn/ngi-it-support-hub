"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockKBArticles } from "@/lib/mockData";
import { Search, BookOpen, ThumbsUp, Eye, X, ChevronRight, Star } from "lucide-react";
import type { KBArticle } from "@/lib/types";
import Link from "next/link";

const CATEGORIES = [
  { label: "All", color: "#1A2B40" },
  { label: "Account & Access", color: "#3B82F6" },
  { label: "Network & VPN", color: "#EF4444" },
  { label: "Email & Outlook", color: "#F59E0B" },
  { label: "Security", color: "#8B5CF6" },
  { label: "Hardware", color: "#10B981" },
  { label: "Device Management", color: "#06B6D4" },
  { label: "Remote Support", color: "#EC4899" },
  { label: "Software", color: "#6B7280" },
];

const FULL_CONTENT: Record<string, string> = {
  kb1: `## Resetting Your Microsoft 365 Password

### Option 1 — Self-Service (Recommended, 24/7)
1. Visit **aka.ms/sspr** in any browser
2. Enter your company email address (e.g. \`yourname@nationalgroupindia.com\`)
3. Complete identity verification using one of:
   - Microsoft Authenticator app notification
   - SMS to your registered mobile number
   - Backup email address
4. Enter your new password (see requirements below)
5. Sign in to all your devices with the new password

### Password Requirements
- Minimum **12 characters**
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Cannot reuse any of your last 10 passwords
- Must not contain your name or username

### Option 2 — Contact IT Helpdesk
If self-service is unavailable, call the IT helpdesk with your employee ID ready. Identity verification will be required before a reset is issued.

### After Reset
Update your password on all devices: laptop, mobile, Teams, Outlook. MFA devices will prompt automatically on next sign-in.`,

  kb2: `## GlobalProtect VPN Setup Guide

### Windows Installation
1. Go to the **IT Portal → Downloads** section
2. Download **GlobalProtect for Windows**
3. Run the installer and follow prompts (no configuration needed during install)
4. Restart your computer when prompted
5. Find the GlobalProtect shield icon in the system tray (bottom-right)
6. Enter gateway: \`vpn.nationalgroupindia.com\`
7. Sign in with your Microsoft 365 credentials + MFA

### Mac Installation
Same steps — download the macOS version. After install, approve the system extension in **System Settings → Privacy & Security**.

### Common VPN Error Codes
| Code | Meaning | Fix |
|------|---------|-----|
| 789 | Certificate error | Uninstall & reinstall GlobalProtect |
| 690 | Authentication failed | Reset password at aka.ms/sspr |
| 620 | Portal unreachable | Check internet connection; try on mobile data |
| 748 | Firewall blocking | Temporarily disable third-party antivirus/firewall |

### Split Tunnelling
Company resources route through VPN; general internet traffic goes direct. This is by design for performance.`,

  kb6: `## Setting Up Multi-Factor Authentication (MFA)

### Why MFA?
MFA adds a second layer of security beyond your password. If your password is compromised, attackers still cannot access your account without your MFA device.

### Setup Steps
1. Go to **aka.ms/mfasetup** (sign in with your work account)
2. Click **+ Add sign-in method**
3. Select **Authenticator app** (most secure option)
4. On your phone, download **Microsoft Authenticator** from App Store / Google Play
5. In the app: tap **+** → **Work or school account** → **Scan QR code**
6. Scan the QR code displayed on your computer screen
7. Enter the 6-digit verification code shown in the app to confirm

### Backup Methods (Set Up at Least One)
- **SMS text message** — enter your mobile number
- **Hardware FIDO2 key** — request from IT if you have no smartphone

### Lost or New Phone?
Contact IT immediately: security@nationalgroupindia.com or raise an **urgent ticket** marked Critical. We will issue a temporary bypass code while you set up MFA on your new device. Never share bypass codes with anyone.`,
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<KBArticle | null>(null);

  const filtered = mockKBArticles.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some(t => t.includes(q));
    return matchCat && matchSearch;
  });

  const featured = mockKBArticles.filter(a => a.featured);

  return (
    <AppLayout title="Knowledge Base">
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Hero search */}
        <div style={{ background: "linear-gradient(135deg, #0F1D2E 0%, #1A2B40 60%, #243850 100%)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(196,144,32,0.08)" }} />
          <div style={{ position: "absolute", bottom: -20, left: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(196,144,32,0.05)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(196,144,32,0.9)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Knowledge Base</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>How can we help?</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 20 }}>Search {mockKBArticles.length} articles written by the NGI IT team</p>
            <div style={{ position: "relative", maxWidth: 560 }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles — e.g. VPN, password reset, printer…"
                style={{ width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", backdropFilter: "blur(10px)", boxSizing: "border-box" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured articles (only when no search/filter) */}
        {!search && activeCategory === "All" && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Star style={{ width: 13, height: 13, color: "#C49020" }} /> Featured
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {featured.map(a => (
                <button key={a.id} onClick={() => setSelected(a)}
                  style={{ background: "var(--surface)", borderRadius: 14, padding: "18px 16px", border: "1.5px solid rgba(196,144,32,0.25)", boxShadow: "var(--sh-sm)", textAlign: "left", cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(196,144,32,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(196,144,32,0.25)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#C49020", background: "rgba(196,144,32,0.1)", padding: "2px 8px", borderRadius: 99 }}>{a.category}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-3)" }}>
                      <Eye style={{ width: 11, height: 11 }} />{a.views.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 6, lineHeight: 1.4 }}>{a.title}</p>
                  <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{a.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, color: "var(--text-3)", fontSize: 11 }}>
                    <ThumbsUp style={{ width: 10, height: 10 }} /> {a.helpful}% helpful · {a.author}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {CATEGORIES.map(c => (
            <button key={c.label} onClick={() => setActiveCategory(c.label)}
              style={{ padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1.5px solid", cursor: "pointer", transition: "all .15s",
                borderColor: activeCategory === c.label ? c.color : "var(--border-2)",
                background: activeCategory === c.label ? `${c.color}15` : "var(--surface)",
                color: activeCategory === c.label ? c.color : "var(--text-2)",
              }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Articles list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-3)" }}>
            <BookOpen style={{ width: 36, height: 36, opacity: 0.3, marginBottom: 10 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>No articles found</p>
            <p style={{ fontSize: 13 }}>Try a different search term or <Link href="/tickets/new" style={{ color: "var(--gold)" }}>raise a support ticket</Link>.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>{filtered.length} article{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map(a => {
              const catColor = CATEGORIES.find(c => c.label === a.category)?.color ?? "#6B7280";
              return (
                <button key={a.id} onClick={() => setSelected(a)}
                  style={{ background: "var(--surface)", borderRadius: 14, padding: "16px 18px", border: "1px solid var(--border-1)", boxShadow: "var(--sh-sm)", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-1)"; e.currentTarget.style.background = "var(--surface)"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${catColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen style={{ width: 18, height: 18, color: catColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{a.title}</p>
                      {a.featured && <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "rgba(196,144,32,0.12)", color: "#C49020", fontWeight: 700 }}>Featured</span>}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.excerpt}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 99, background: `${catColor}12`, color: catColor, fontWeight: 600 }}>{a.category}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 }}><Eye style={{ width: 10, height: 10 }} />{a.views.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 }}><ThumbsUp style={{ width: 10, height: 10 }} />{a.helpful}%</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{a.author}</span>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: "var(--text-3)", flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        )}

        {/* Article detail overlay */}
        {selected && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{ background: "var(--surface)", borderRadius: 20, padding: 32, maxWidth: 680, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#C49020", background: "rgba(196,144,32,0.1)", padding: "2px 9px", borderRadius: 99 }}>{selected.category}</span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.01em", marginTop: 8, lineHeight: 1.3 }}>{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "var(--surface-2)", border: "1px solid var(--border-1)", borderRadius: 8, padding: 6, cursor: "pointer", flexShrink: 0 }}>
                  <X style={{ width: 16, height: 16, color: "var(--text-2)" }} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border-1)", flexWrap: "wrap" }}>
                {[
                  { icon: <Eye style={{ width: 11, height: 11 }} />, val: `${selected.views.toLocaleString()} views` },
                  { icon: <ThumbsUp style={{ width: 11, height: 11 }} />, val: `${selected.helpful}% helpful` },
                  { icon: null, val: `By ${selected.author}` },
                  { icon: null, val: `Updated ${new Date(selected.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` },
                ].map((m, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-3)" }}>{m.icon}{m.val}</span>
                ))}
              </div>

              {/* Content */}
              <div style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
                {FULL_CONTENT[selected.id] ? (
                  FULL_CONTENT[selected.id].split("\n").map((line, i) => {
                    if (line.startsWith("## ")) return <h3 key={i} style={{ fontSize: 17, fontWeight: 800, color: "var(--text-1)", marginTop: 20, marginBottom: 8 }}>{line.slice(3)}</h3>;
                    if (line.startsWith("### ")) return <h4 key={i} style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginTop: 14, marginBottom: 6 }}>{line.slice(4)}</h4>;
                    if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} style={{ margin: "3px 0 3px 16px" }}>• {line.slice(2)}</p>;
                    if (/^\d+\./.test(line)) return <p key={i} style={{ margin: "4px 0 4px 16px", color: "var(--text-1)" }}>{line}</p>;
                    if (line.startsWith("|")) return null;
                    if (line === "") return <div key={i} style={{ height: 6 }} />;
                    return <p key={i} style={{ margin: "3px 0" }}>{line}</p>;
                  })
                ) : (
                  <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{selected.excerpt}</p>
                )}
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-1)", display: "flex", gap: 10 }}>
                <button style={{ flex: 1, padding: "9px 16px", background: "#10B98115", color: "#10B981", border: "1.5px solid #10B98130", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ThumbsUp style={{ width: 14, height: 14 }} /> Helpful
                </button>
                <Link href="/tickets/new" style={{ flex: 1, padding: "9px 16px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  Still need help? Raise a ticket
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
