"use client";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { categoryLabels } from "@/lib/utils";
import type { TicketCategory, TicketPriority } from "@/lib/types";
import { Paperclip, X, AlertCircle, CheckCircle, Zap, Video } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = Object.entries(categoryLabels) as [TicketCategory, string][];
const priorities: { value: TicketPriority; label: string; desc: string; color: string }[] = [
  { value: "critical", label: "Critical", desc: "System down, business-stopping impact", color: "#DC2626" },
  { value: "high", label: "High", desc: "Major impact, affecting multiple users", color: "#EA580C" },
  { value: "medium", label: "Medium", desc: "Moderate impact, workaround available", color: "#D97706" },
  { value: "low", label: "Low", desc: "Minor issue, minimal impact", color: "#16A34A" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "" as TicketCategory | "",
    priority: "medium" as TicketPriority,
    department: "",
    branch: "",
    attachments: [] as File[],
    teamsNotify: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId] = useState(`INC-${Math.floor(Math.random() * 90000) + 10000}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout title="New Ticket" breadcrumbs={[{ label: "Tickets", href: "/tickets" }, { label: "New Ticket" }]}>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Ticket submitted
          </h2>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            Your request has been logged as
          </p>
          <p className="font-mono text-lg font-bold mb-4" style={{ color: "#0078D4" }}>{ticketId}</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            The IT team has been notified via Teams and email. You&apos;ll receive a response within the SLA timeframe for your selected priority.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/tickets")}
              className="px-5 py-2 rounded-lg border text-sm font-medium"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}
            >
              Back to Tickets
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm({ title: "", description: "", category: "", priority: "medium", department: "", branch: "", attachments: [], teamsNotify: true }); }}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium bg-azure-600 hover:bg-azure-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="New Ticket"
      breadcrumbs={[{ label: "Tickets", href: "/tickets" }, { label: "New Ticket" }]}
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="card p-6">
            <h2 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Describe the issue
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  Short title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot connect to VPN from home office"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border text-[14px] outline-none transition-shadow focus:ring-1 focus:ring-azure-600"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  Full description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe what happened, what you were trying to do, any error messages you see, and steps to reproduce the problem…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border text-[14px] outline-none resize-none transition-shadow focus:ring-1 focus:ring-azure-600"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                  The more detail you provide, the faster we can resolve your issue.
                </p>
              </div>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-6">
              <label className="block text-[12px] font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: value }))}
                    className="px-3 py-2 rounded-lg border text-[12px] text-left font-medium transition-all"
                    style={{
                      border: form.category === value ? "1px solid #0078D4" : "1px solid var(--border)",
                      background: form.category === value ? "#EFF6FF" : "var(--bg-base)",
                      color: form.category === value ? "#0078D4" : "var(--text-secondary)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <label className="block text-[12px] font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Priority
              </label>
              <div className="space-y-2">
                {priorities.map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: value }))}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-all"
                    style={{
                      border: form.priority === value ? `1px solid ${color}` : "1px solid var(--border)",
                      background: form.priority === value ? `${color}10` : "var(--bg-base)",
                    }}
                  >
                    <span className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: form.priority === value ? color : "var(--text-primary)" }}>
                        {label}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Department & Branch */}
          <div className="card p-6">
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Location & Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  Department
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                >
                  <option value="">Select department</option>
                  {["Finance", "HR", "Sales", "Marketing", "IT", "Operations", "Legal", "Executive"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  Office / Branch
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
                >
                  <option value="">Select branch</option>
                  {["London HQ", "Manchester", "Dubai Office", "Singapore"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="card p-6">
            <label className="block text-[12px] font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
              Attachments
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors hover:border-azure-600 hover:bg-blue-50/50"
              style={{ borderColor: "var(--border)" }}
            >
              <Paperclip className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Drop files or click to attach
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Screenshots, logs, error messages · Max 10 MB each
              </p>
              <input type="file" multiple className="hidden" onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setForm((f) => ({ ...f, attachments: [...f.attachments, ...files] }));
              }} />
            </label>
            {form.attachments.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {form.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--bg-base)" }}>
                    <Paperclip className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="text-[12px] flex-1 truncate" style={{ color: "var(--text-primary)" }}>{file.name}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}>
                      <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teams notification */}
          <div className="card p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.teamsNotify}
                onChange={(e) => setForm((f) => ({ ...f, teamsNotify: e.target.checked }))}
                className="w-4 h-4 rounded accent-azure-600"
              />
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" style={{ color: "#6264A7" }} />
                <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  Notify me via Microsoft Teams when the engineer responds
                </span>
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.push("/tickets")}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--bg-card)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium bg-azure-600 hover:bg-azure-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
