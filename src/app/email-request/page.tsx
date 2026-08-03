"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CheckCircle2, Loader2, Mail, KeyRound, RefreshCw, UserCog, HelpCircle, Send } from "lucide-react";
import Link from "next/link";

type RequestType = "new_email" | "password_reset" | "email_renewal" | "rename_profile" | "other";

const REQUEST_TYPES: { id: RequestType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { id: "new_email",      icon: <Mail className="w-5 h-5" />,      label: "New Email ID",       desc: "Create a new Microsoft 365 email account for a new employee",  color: "#3B82F6" },
  { id: "password_reset", icon: <KeyRound className="w-5 h-5" />,  label: "Password Reset",     desc: "Reset Microsoft 365 / Outlook password for an existing account", color: "#EF4444" },
  { id: "email_renewal",  icon: <RefreshCw className="w-5 h-5" />, label: "Email Renewal",      desc: "Renew or reactivate a disabled / expired email account",         color: "#F59E0B" },
  { id: "rename_profile", icon: <UserCog className="w-5 h-5" />,   label: "Rename Profile",     desc: "Update display name, username or email address in Microsoft 365",color: "#8B5CF6" },
  { id: "other",          icon: <HelpCircle className="w-5 h-5" />,label: "Other",              desc: "Any other email or Microsoft 365 account related request",       color: "#6B7280" },
];

const DEPARTMENTS = ["Finance","HR","Sales","IT","Marketing","Operations","Legal","Admin","Other"];
const LOCATIONS   = ["Bangalore HQ","Shivamogga","Mangalore","Hassan","Chikkamagaluru","Other"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", fontSize: 14, color: "var(--text-1)",
  background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 10,
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

export default function EmailRequestPage() {
  const { data: session } = useSession();
  const userName  = session?.user?.name  ?? "";
  const userEmail = session?.user?.email ?? "";

  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");

  // Common fields
  const [phone,      setPhone]      = useState("");
  const [department, setDept]       = useState("");
  const [location,   setLocation]   = useState("");

  // New Email ID
  const [newEmpName,    setNewEmpName]    = useState("");
  const [designation,   setDesignation]   = useState("");
  const [managerName,   setManagerName]   = useState("");
  const [managerEmail,  setManagerEmail]  = useState("");
  const [startDate,     setStartDate]     = useState("");

  // Password Reset
  const [targetEmail,  setTargetEmail]  = useState("");
  const [resetReason,  setResetReason]  = useState("");

  // Email Renewal
  const [renewalEmail,  setRenewalEmail]  = useState("");
  const [renewalPeriod, setRenewalPeriod] = useState("");
  const [renewalReason, setRenewalReason] = useState("");

  // Rename Profile
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentName,  setCurrentName]  = useState("");
  const [newName,      setNewName]      = useState("");
  const [renameReason, setRenameReason] = useState("");

  // Other
  const [otherEmail,   setOtherEmail]   = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType) return;
    setSubmitting(true);
    setError("");

    const payload: Record<string, string> = {
      requestType,
      requesterName:  userName,
      requesterEmail: userEmail,
      department,
      location,
      phone,
    };

    if (requestType === "new_email") {
      Object.assign(payload, { newEmpName, designation, managerName, managerEmail, startDate });
    } else if (requestType === "password_reset") {
      Object.assign(payload, { targetEmail, resetReason });
    } else if (requestType === "email_renewal") {
      Object.assign(payload, { renewalEmail, renewalPeriod, renewalReason });
    } else if (requestType === "rename_profile") {
      Object.assign(payload, { currentEmail, currentName, newName, renameReason });
    } else {
      Object.assign(payload, { otherEmail, otherDetails });
    }

    try {
      const res = await fetch("/api/email-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Could not send your request. Please try again or contact IT directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const sel = REQUEST_TYPES.find(r => r.id === requestType);

  if (submitted) {
    return (
      <AppLayout title="Email Request">
        <div style={{ maxWidth: 540, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#10B98115", border: "2px solid #10B98130", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle2 style={{ width: 36, height: 36, color: "#10B981" }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>Request Submitted!</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8 }}>
            Your <strong>{sel?.label}</strong> request has been sent to the IT team.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 32 }}>
            The IT admin will action your request and get back to you within 24 hours.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setSubmitted(false); setRequestType(null); setPhone(""); setDept(""); setLocation(""); setNewEmpName(""); setDesignation(""); setManagerName(""); setManagerEmail(""); setStartDate(""); setTargetEmail(""); setResetReason(""); setRenewalEmail(""); setRenewalPeriod(""); setRenewalReason(""); setCurrentEmail(""); setCurrentName(""); setNewName(""); setRenameReason(""); setOtherEmail(""); setOtherDetails(""); }}
              style={{ padding: "10px 24px", background: "var(--gold)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              New Request
            </button>
            <Link href="/tickets" style={{ padding: "10px 24px", background: "var(--surface)", color: "var(--text-1)", border: "1px solid var(--border-2)", borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
              My Tickets
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Email Account Request">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Email Account Request</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Submit a request for email creation, password reset, renewal or profile changes. The IT team will be notified immediately.
          </p>
        </div>

        {/* Request type selector */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
            Select Request Type <span style={{ color: "#EF4444" }}>*</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10 }}>
            {REQUEST_TYPES.map(rt => {
              const active = requestType === rt.id;
              return (
                <button key={rt.id} onClick={() => setRequestType(rt.id)}
                  style={{
                    padding: "14px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    border: active ? `2px solid ${rt.color}` : "1.5px solid var(--border-2)",
                    background: active ? `${rt.color}12` : "var(--surface)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = rt.color; (e.currentTarget as HTMLElement).style.background = `${rt.color}08`; }}}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}}>
                  <div style={{ color: active ? rt.color : "var(--text-2)", marginBottom: 8 }}>{rt.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? rt.color : "var(--text-1)", marginBottom: 3 }}>{rt.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{rt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {requestType && (
          <form onSubmit={handleSubmit}>
            {/* Requester info */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Your Details</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <Field label="Your Name">
                  <input value={userName} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </Field>
                <Field label="Your Email">
                  <input value={userEmail} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Department" required>
                  <select value={department} onChange={e => setDept(e.target.value)} required style={{ ...inputStyle }}>
                    <option value="">Select…</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Location" required>
                  <select value={location} onChange={e => setLocation(e.target.value)} required style={{ ...inputStyle }}>
                    <option value="">Select…</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Phone / WhatsApp" required>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 9XXXXXXXXX" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border-2)"; }} />
                </Field>
              </div>
            </div>

            {/* Dynamic fields */}
            <div style={{ background: "var(--surface)", border: `1.5px solid ${sel!.color}40`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ color: sel!.color }}>{sel!.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: sel!.color }}>{sel!.label} Details</p>
              </div>

              {/* ── New Email ID ── */}
              {requestType === "new_email" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="New Employee Full Name" required>
                      <input value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required placeholder="As per Aadhaar / company records" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                    <Field label="Designation / Job Title" required>
                      <input value={designation} onChange={e => setDesignation(e.target.value)} required placeholder="e.g. Sales Executive" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Reporting Manager Name" required>
                      <input value={managerName} onChange={e => setManagerName(e.target.value)} required placeholder="Manager's full name" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                    <Field label="Manager Email">
                      <input value={managerEmail} onChange={e => setManagerEmail(e.target.value)} type="email" placeholder="manager@nationalgroupindia.com" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                  </div>
                  <Field label="Joining / Required By Date" required>
                    <input value={startDate} onChange={e => setStartDate(e.target.value)} required type="date" style={{ ...inputStyle, maxWidth: 220 }}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                </div>
              )}

              {/* ── Password Reset ── */}
              {requestType === "password_reset" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Email Address to Reset" required>
                    <input value={targetEmail} onChange={e => setTargetEmail(e.target.value)} required type="email" placeholder="user@nationalgroupindia.com" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                  <Field label="Reason for Reset" required>
                    <select value={resetReason} onChange={e => setResetReason(e.target.value)} required style={inputStyle}>
                      <option value="">Select reason…</option>
                      <option>Forgot password</option>
                      <option>Account locked</option>
                      <option>Returning from leave</option>
                      <option>Security concern / suspected compromise</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* ── Email Renewal ── */}
              {requestType === "email_renewal" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Email Address to Renew" required>
                    <input value={renewalEmail} onChange={e => setRenewalEmail(e.target.value)} required type="email" placeholder="user@nationalgroupindia.com" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                  <Field label="Renewal / Reactivation Reason" required>
                    <select value={renewalReason} onChange={e => setRenewalReason(e.target.value)} required style={inputStyle}>
                      <option value="">Select reason…</option>
                      <option>Account expired — employee re-joining</option>
                      <option>Account disabled by IT — requesting re-enable</option>
                      <option>License expired — needs renewal</option>
                      <option>Account inactive due to long leave</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Required Active Period">
                    <select value={renewalPeriod} onChange={e => setRenewalPeriod(e.target.value)} style={inputStyle}>
                      <option value="">Select period…</option>
                      <option>1 month</option>
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>1 year</option>
                      <option>Permanent / Ongoing</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* ── Rename Profile ── */}
              {requestType === "rename_profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Current Email Address" required>
                    <input value={currentEmail} onChange={e => setCurrentEmail(e.target.value)} required type="email" placeholder="current@nationalgroupindia.com" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Current Display Name" required>
                      <input value={currentName} onChange={e => setCurrentName(e.target.value)} required placeholder="Current name in Microsoft 365" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                    <Field label="New Display Name Required" required>
                      <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Correct / updated name" style={inputStyle}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                    </Field>
                  </div>
                  <Field label="Reason for Name Change" required>
                    <select value={renameReason} onChange={e => setRenameReason(e.target.value)} required style={inputStyle}>
                      <option value="">Select reason…</option>
                      <option>Name entered incorrectly during onboarding</option>
                      <option>Legal name change (marriage / court order)</option>
                      <option>Preferred name / nickname update</option>
                      <option>Department or role change requires new alias</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* ── Other ── */}
              {requestType === "other" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Email Address (if applicable)">
                    <input value={otherEmail} onChange={e => setOtherEmail(e.target.value)} type="email" placeholder="user@nationalgroupindia.com" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                  <Field label="Describe Your Request" required>
                    <textarea value={otherDetails} onChange={e => setOtherDetails(e.target.value)} required rows={5}
                      placeholder="Please describe the request in detail — include any relevant email addresses, account names, and what you need done…"
                      style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--gold)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border-2)"} />
                  </Field>
                </div>
              )}
            </div>

            {/* Info notice */}
            <div style={{ background: "rgba(196,144,32,0.08)", border: "1px solid rgba(196,144,32,0.25)", borderRadius: 10, padding: "11px 16px", marginBottom: 20, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
              📧 Your request will be sent directly to <strong>bala@nationalgroupindia.com</strong>. You will be contacted within 24 hours.
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "11px 16px", marginBottom: 16, fontSize: 13, color: "#B91C1C" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", padding: "13px 24px", background: submitting ? "var(--surface-2)" : "var(--gold)", color: submitting ? "var(--text-3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.15s" }}>
              {submitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Request…</>
                : <><Send className="w-4 h-4" /> Submit Request</>}
            </button>
          </form>
        )}

        {!requestType && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-3)", fontSize: 13 }}>
            ↑ Select a request type above to get started
          </div>
        )}
      </div>
    </AppLayout>
  );
}
