"use client";
import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, RefreshCw, Loader2, Mail, Phone, MapPin, Briefcase, Plus } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
  jobTitle: string | null;
  department: string | null;
  officeLocation: string | null;
  mobilePhone: string | null;
}

function initials(name: string) {
  return (name || "U").split(" ").map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "U";
}

const AV_COLORS = ["#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#C49020","#DC2626","#0D9488"];
function avColor(name: string) { return AV_COLORS[(name.charCodeAt(0) ?? 65) % AV_COLORS.length]; }

export default function EmployeesPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [dept, setDept]       = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users");
      if (!res.ok) { setError("Failed to load directory."); return; }
      setUsers(await res.json());
    } catch {
      setError("Network error — could not reach directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => { if (u.department) set.add(u.department); });
    return ["all", ...Array.from(set).sort()];
  }, [users]);

  const visible = useMemo(() => {
    let list = users;
    if (dept !== "all") list = list.filter(u => u.department === dept);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.displayName.toLowerCase().includes(q) ||
        (u.mail ?? u.userPrincipalName).toLowerCase().includes(q) ||
        (u.jobTitle ?? "").toLowerCase().includes(q) ||
        (u.department ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, dept, search]);

  return (
    <AppLayout title="Employee Directory">
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 3 }}>Employee Directory</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>
              {loading ? "Loading from Microsoft 365…" : `${users.length} employees · synced from Microsoft directory`}
            </p>
          </div>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
            <RefreshCw style={{ width: 13, height: 13 }} /> Sync
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, role…"
              style={{ width: "100%", padding: "9px 12px 9px 34px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", outline: "none" }}
              onFocus={e => { e.target.style.borderColor = "#C49020"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }} />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)}
            style={{ padding: "9px 14px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 8, fontSize: 13, color: "var(--text-1)", cursor: "pointer", outline: "none", minWidth: 160 }}>
            {departments.map(d => (
              <option key={d} value={d}>{d === "all" ? "All Departments" : d}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "var(--text-3)" }}>
            <Loader2 style={{ width: 22, height: 22, animation: "spin 1s linear infinite", marginRight: 10 }} />
            Syncing from Microsoft 365 directory…
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border-1)" }}>
            <p style={{ color: "#EF4444", fontWeight: 600, marginBottom: 8 }}>{error}</p>
            <button onClick={load} style={{ padding: "8px 16px", background: "#C49020", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Retry</button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border-1)" }}>
            <p style={{ color: "var(--text-2)", fontWeight: 600 }}>No employees match your search.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {visible.map(u => {
              const email = u.mail ?? u.userPrincipalName;
              const color = avColor(u.displayName);
              return (
                <div key={u.id} style={{ background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: 12, padding: "16px 18px", boxShadow: "var(--sh-xs)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {initials(u.displayName)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>{u.displayName}</p>

                    {u.jobTitle && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <Briefcase style={{ width: 11, height: 11, color: "var(--text-3)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{u.jobTitle}</span>
                      </div>
                    )}

                    {u.department && (
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, color: "#C49020", background: "rgba(196,144,32,0.1)", padding: "2px 8px", borderRadius: 99, marginBottom: 8 }}>
                        {u.department}
                      </span>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Mail style={{ width: 11, height: 11, color: "var(--text-3)", flexShrink: 0 }} />
                        <a href={`mailto:${email}`} style={{ fontSize: 11, color: "var(--text-2)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</a>
                      </div>
                      {u.mobilePhone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone style={{ width: 11, height: 11, color: "var(--text-3)", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "var(--text-2)" }}>{u.mobilePhone}</span>
                        </div>
                      )}
                      {u.officeLocation && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin style={{ width: 11, height: 11, color: "var(--text-3)", flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "var(--text-2)" }}>{u.officeLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Raise ticket for this person */}
                    <Link
                      href={`/tickets/new?for=${encodeURIComponent(email)}&name=${encodeURIComponent(u.displayName)}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, fontWeight: 600, color: "#C49020", textDecoration: "none" }}
                    >
                      <Plus style={{ width: 11, height: 11 }} /> Raise ticket for them
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
