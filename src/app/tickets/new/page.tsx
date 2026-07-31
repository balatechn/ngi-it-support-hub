"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Send, Paperclip, CheckCircle2, Loader2, X, Copy, Check,
  Wifi, Monitor, Printer, Mail, ShieldAlert, HelpCircle,
  Cpu, Server, Clock, AlertTriangle, ChevronDown, Wrench, ClipboardList,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  type: "text" | "typing" | "options" | "file" | "success";
  options?: Option[];
  time: Date;
}
interface Option { label: string; value: string; icon?: React.ReactNode; desc?: string; color?: string }

// ── Steps ────────────────────────────────────────────────────
type Step = "intro"|"name"|"location"|"locationOther"|"department"|"contact"|"ticketType"|"category"|"priority"|"description"|"attachment"|"done";

const STEPS: Step[] = ["intro","name","location","locationOther","department","contact","ticketType","category","priority","description","attachment","done"];

const TICKET_TYPES: Option[] = [
  { label: "Issue", value: "issue", icon: <Wrench className="w-5 h-5" />, desc: "Something is broken or not working", color: "#EF4444" },
  { label: "Request", value: "request", icon: <ClipboardList className="w-5 h-5" />, desc: "I need something new or a change", color: "#3B82F6" },
];

const DEPARTMENTS: Option[] = [
  { label: "Finance", value: "Finance" }, { label: "HR", value: "HR" },
  { label: "Sales", value: "Sales" }, { label: "IT", value: "IT" },
  { label: "Marketing", value: "Marketing" }, { label: "Operations", value: "Operations" },
  { label: "Legal", value: "Legal" }, { label: "Other", value: "Other" },
];

const LOCATIONS: Option[] = [
  { label: "Bangalore HQ",    value: "Bangalore HQ" },
  { label: "Shivamogga",      value: "Shivamogga" },
  { label: "Mangalore",       value: "Mangalore" },
  { label: "Hassan",          value: "Hassan" },
  { label: "Chikkamagaluru",  value: "Chikkamagaluru" },
  { label: "Other (type below)", value: "__other__" },
];

const CATEGORIES: Option[] = [
  { label: "Network", value: "network", icon: <Wifi className="w-4 h-4" />, color: "#3B82F6" },
  { label: "Hardware", value: "hardware", icon: <Monitor className="w-4 h-4" />, color: "#8B5CF6" },
  { label: "Software", value: "software", icon: <Cpu className="w-4 h-4" />, color: "#10B981" },
  { label: "Email", value: "email", icon: <Mail className="w-4 h-4" />, color: "#F59E0B" },
  { label: "Printer", value: "printer", icon: <Printer className="w-4 h-4" />, color: "#6B7280" },
  { label: "VPN", value: "vpn", icon: <ShieldAlert className="w-4 h-4" />, color: "#EF4444" },
  { label: "Server / Infra", value: "network", icon: <Server className="w-4 h-4" />, color: "#0891B2" },
  { label: "Other", value: "other", icon: <HelpCircle className="w-4 h-4" />, color: "#9CA3AF" },
];

const PRIORITIES: Option[] = [
  { label: "Low", value: "low", color: "#22C55E", desc: "Minor issue, no deadline impact" },
  { label: "Medium", value: "medium", color: "#EAB308", desc: "Noticeable impact, needs attention" },
  { label: "High", value: "high", color: "#F97316", desc: "Significant impact on work" },
  { label: "Critical", value: "critical", color: "#EF4444", desc: "Work completely blocked" },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function genTicketId() { return `NGI-2026-${String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6)}`; }
function fmt(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

export default function NewTicketPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);

  const addMsg = useCallback((msg: Omit<Message, "id" | "time">) => {
    setMessages(prev => [...prev, { ...msg, id: genId(), time: new Date() }]);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  }, []);

  const botSay = useCallback((content: string, extra?: Partial<Message>) => {
    return new Promise<void>(resolve => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMsg({ role: "bot", content, type: "text", ...extra });
        resolve();
      }, 700 + Math.min(content.length * 10, 800));
    });
  }, [addMsg]);

  // Kick off intro — wait for session, skip name step if already known
  useEffect(() => {
    if (status === "loading" || startedRef.current) return;
    startedRef.current = true;
    const sessionName = session?.user?.name ?? "";
    const firstName = sessionName.split(" ")[0] || "there";
    const seq = async () => {
      await new Promise(r => setTimeout(r, 400));
      await botSay(`Hi ${firstName}! 👋 I'm the NGI IT Support Assistant. I'll help you raise a support ticket in just a few steps.`);
      if (sessionName) {
        setAnswers({ name: sessionName });
        setStep("location");
        setProgress(22);
        await botSay("Which office or location are you working from?", { type: "options", options: LOCATIONS });
      } else {
        await botSay("What's your full name?");
        setStep("name");
        setProgress(10);
      }
    };
    seq();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const next = useCallback(async (val: string) => {
    const current = step;
    addMsg({ role: "user", content: val, type: "text" });
    setDraft("");

    if (current === "name") {
      const newAnswers = { ...answers, name: val };
      setAnswers(newAnswers);
      setStep("location");
      setProgress(22);
      await botSay(`Nice to meet you, ${val}! 😊`);
      await botSay("Which office or location are you working from?", {
        type: "options",
        options: LOCATIONS,
      });

    } else if (current === "location") {
      if (val === "Other (type below)") {
        setStep("locationOther");
        await botSay("Please type your location:");
      } else {
        const newAnswers = { ...answers, location: val };
        setAnswers(newAnswers);
        setStep("department");
        setProgress(34);
        await botSay("Got it! Which department do you work in?", {
          type: "options",
          options: DEPARTMENTS,
        });
      }

    } else if (current === "locationOther") {
      const newAnswers = { ...answers, location: val };
      setAnswers(newAnswers);
      setStep("department");
      setProgress(34);
      await botSay("Got it! Which department do you work in?", {
        type: "options",
        options: DEPARTMENTS,
      });

    } else if (current === "department") {
      const newAnswers = { ...answers, department: val };
      setAnswers(newAnswers);
      setStep("contact");
      setProgress(46);
      await botSay("Perfect. What's the best phone/WhatsApp number to reach you on for updates?");

    } else if (current === "contact") {
      const newAnswers = { ...answers, contact: val };
      setAnswers(newAnswers);
      setStep("ticketType");
      setProgress(52);
      await botSay("Is this an Issue or a Request?", {
        type: "options",
        options: TICKET_TYPES,
      });

    } else if (current === "ticketType") {
      const newAnswers = { ...answers, ticketType: val };
      setAnswers(newAnswers);
      setStep("category");
      setProgress(62);
      const q = val.toLowerCase() === "issue"
        ? "What type of issue are you experiencing?"
        : "What category does your request fall under?";
      await botSay(q, {
        type: "options",
        options: CATEGORIES,
      });

    } else if (current === "category") {
      const newAnswers = { ...answers, category: val };
      setAnswers(newAnswers);
      setStep("priority");
      setProgress(72);
      await botSay("How urgent is this?", {
        type: "options",
        options: PRIORITIES,
      });

    } else if (current === "priority") {
      const newAnswers = { ...answers, priority: val };
      setAnswers(newAnswers);
      setStep("description");
      setProgress(82);
      await botSay("Please describe the issue in as much detail as possible — the more you share, the faster we can resolve it.");

    } else if (current === "description") {
      const newAnswers = { ...answers, description: val };
      setAnswers(newAnswers);
      setStep("attachment");
      setProgress(92);
      await botSay("Would you like to attach a screenshot or file? (optional — tap the 📎 button or just type 'skip')");

    } else if (current === "attachment") {
      const id = genTicketId();
      setTicketId(id);
      const allAnswers = { ...answers };
      setProgress(100);
      await botSay(`🎉 Your ticket has been created!`);
      addMsg({
        role: "bot",
        content: id,
        type: "success",
        options: [
          { label: allAnswers.name, value: "name" },
          { label: allAnswers.department, value: "dept" },
          { label: allAnswers.location, value: "loc" },
          { label: allAnswers.category, value: "cat" },
          { label: allAnswers.priority, value: "pri" },
        ],
      });
      setStep("done");
    }

    setTimeout(() => { inputRef.current?.focus(); }, 100);
  }, [step, answers, addMsg, botSay]);

  const handleSend = () => {
    const val = draft.trim();
    if (!val || step === "done" || isTyping) return;
    if (step === "attachment") { next("skipped"); return; }
    next(val);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOption = (val: string, label: string) => {
    if (isTyping) return;
    next(label);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAttachment(f);
    addMsg({ role: "user", content: `📎 Attached: ${f.name}`, type: "text" });
    setTimeout(() => next("file attached"), 300);
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stepIdx = STEPS.indexOf(step);

  return (
    <AppLayout title="New Request">
      <div style={{ height: "calc(100vh - 58px)", display: "flex", flexDirection: "column", maxWidth: 720, margin: "0 auto", padding: "0 16px" }}>

        {/* Progress */}
        <div style={{ padding: "16px 0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
              {step === "done" ? "Ticket Created ✓" : `Step ${Math.max(stepIdx, 1)} of ${STEPS.length - 2}`}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>{progress}%</p>
          </div>
          <div className="sla-bar">
            <div className="sla-fill" style={{ width: `${progress}%`, background: progress === 100 ? "#10B981" : "var(--gold)" }} />
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} className="anim-fade-up" style={{ display: "flex", gap: 10, marginBottom: 14, justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end" }}>
              {msg.role === "bot" && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                {msg.type === "success" ? (
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 16, padding: 20, boxShadow: "var(--sh-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <CheckCircle2 style={{ width: 20, height: 20, color: "#10B981" }} />
                      <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Ticket Registered!</p>
                    </div>
                    <div style={{ background: "#0F1D2E", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Ticket ID</p>
                        <p style={{ color: "#F0F9FF", fontFamily: "monospace", fontSize: 22, fontWeight: 800, letterSpacing: "0.08em" }}>{msg.content}</p>
                      </div>
                      <button onClick={copyTicket} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", color: copied ? "#34D399" : "#94A3B8", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                      {[
                        { l: "Name", v: answers.name },
                        { l: "Type", v: answers.ticketType ? answers.ticketType.charAt(0).toUpperCase() + answers.ticketType.slice(1) : "" },
                        { l: "Department", v: answers.department },
                        { l: "Location", v: answers.location },
                        { l: "Category", v: answers.category },
                        { l: "Priority", v: answers.priority },
                        { l: "Contact", v: answers.contact },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border-1)" }}>
                          <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l}</p>
                          <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{v || "—"}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "10px 14px", background: "#10B98115", borderRadius: 8, border: "1px solid #10B98130", marginBottom: 14 }}>
                      <p style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
                        ✅ Our team has been notified. You&apos;ll receive a WhatsApp & email confirmation shortly.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link href="/tickets" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", background: "var(--brand)", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                        View My Tickets
                      </Link>
                      <Link href="/tickets/new" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", background: "var(--surface-2)", color: "var(--text-1)", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 13, border: "1px solid var(--border-2)" }}>
                        Raise Another
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={msg.role === "user" ? "bubble-user" : "bubble-bot"}
                    style={{ padding: "10px 14px", fontSize: 14, lineHeight: 1.6, maxWidth: "100%" }}>
                    {msg.content}
                    {msg.type === "options" && msg.options && (
                      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {msg.options.map(opt => {
                          const isPriority = !!opt.color && !!opt.desc;
                          return isPriority ? (
                            <button key={opt.value} onClick={() => handleOption(opt.value, opt.label)}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${opt.color}30`, background: `${opt.color}0D`, cursor: "pointer", transition: "all 0.15s", minWidth: 140 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = opt.color!; (e.currentTarget as HTMLElement).style.background = `${opt.color}18`; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${opt.color}30`; (e.currentTarget as HTMLElement).style.background = `${opt.color}0D`; }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                              <div style={{ textAlign: "left" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: opt.color }}>{opt.label}</p>
                                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{opt.desc}</p>
                              </div>
                            </button>
                          ) : (
                            <button key={opt.value} onClick={() => handleOption(opt.value, opt.label)}
                              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, border: "1.5px solid var(--border-2)", background: "var(--surface)", cursor: "pointer", fontSize: 13, color: "var(--text-1)", fontWeight: 500, transition: "all 0.15s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C49020"; (e.currentTarget as HTMLElement).style.background = "var(--gold-pale)"; (e.currentTarget as HTMLElement).style.color = "#C49020"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}>
                              {opt.icon && <span style={{ color: opt.color ?? "var(--text-2)" }}>{opt.icon}</span>}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left", paddingLeft: msg.role === "bot" ? 4 : 0 }}>
                  {fmt(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="anim-fade-up" style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none"><path d="M3 19V3L19 19V3" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="bubble-bot" style={{ padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        {step !== "done" && (
          <div style={{ padding: "8px 0 16px", borderTop: "1px solid var(--border-1)", background: "var(--page-bg)", flexShrink: 0 }}>
            {step === "attachment" ? (
              <div style={{ display: "flex", gap: 10 }}>
                <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                <button onClick={() => fileRef.current?.click()}
                  style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "12px 16px", background: "var(--surface)", border: "1.5px dashed var(--border-2)", borderRadius: 12, cursor: "pointer", color: "var(--text-2)", fontSize: 14, justifyContent: "center" }}>
                  <Paperclip style={{ width: 16, height: 16, color: "var(--gold)" }} />
                  {attachment ? attachment.name : "Attach a file or screenshot"}
                </button>
                <button onClick={() => next("skipped")}
                  style={{ padding: "12px 20px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 12, cursor: "pointer", color: "var(--text-2)", fontSize: 13, fontWeight: 500 }}>
                  Skip
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKey}
                    placeholder={step === "description" ? "Describe the issue in detail…" : "Type your reply…"}
                    disabled={isTyping || step === "done" || (step !== "name" && step !== "contact" && step !== "description" && step !== "intro" && step !== "ticketType" && step !== "locationOther")}
                    rows={1}
                    style={{ width: "100%", padding: "11px 48px 11px 16px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 12, fontSize: 14, color: "var(--text-1)", outline: "none", resize: "none", maxHeight: 120, overflowY: "auto", lineHeight: 1.5, transition: "border-color 0.15s", fontFamily: "inherit" }}
                    onFocus={e => { e.target.style.borderColor = "var(--gold)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border-2)"; }}
                  />
                </div>
                <button onClick={handleSend}
                  disabled={!draft.trim() || isTyping}
                  style={{ width: 44, height: 44, borderRadius: 12, border: "none", cursor: draft.trim() && !isTyping ? "pointer" : "not-allowed", background: draft.trim() && !isTyping ? "var(--gold)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  <Send style={{ width: 17, height: 17, color: draft.trim() && !isTyping ? "#fff" : "var(--text-3)" }} />
                </button>
              </div>
            )}
            {(step === "name" || step === "contact" || step === "description" || step === "locationOther")
              ? <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, textAlign: "right" }}>Press Enter to send · Shift+Enter for new line</p>
              : null}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
