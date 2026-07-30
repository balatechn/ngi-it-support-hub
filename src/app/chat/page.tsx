"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Send, Loader2, Bot, User, Copy, Check, RefreshCw, BookOpen, ChevronRight, Trash2, Plus } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: Date;
  sources?: string[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

const SUGGESTIONS = [
  "How do I connect to the company VPN?",
  "My Outlook is not syncing emails after a Windows update",
  "How do I reset my Microsoft 365 password?",
  "How do I enrol a new device in Intune?",
  "How do I set up Multi-Factor Authentication?",
  "How do I request a new software license?",
  "The printer shows offline — how do I fix it?",
  "How do I access Teams remotely on mobile?",
];

const KNOWLEDGE_BASE = [
  { title: "VPN Setup Guide", category: "Network & VPN" },
  { title: "Password Reset", category: "Account & Access" },
  { title: "Outlook Sync Fix", category: "Email" },
  { title: "Intune Enrollment", category: "Devices" },
  { title: "MFA Setup", category: "Security" },
  { title: "Printer Troubleshooting", category: "Hardware" },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div style={{ lineHeight: 1.7, fontSize: 14 }}>
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 14, marginBottom: 6, color: "var(--text-1)" }}>{line.slice(3)}</h3>;
        if (line.startsWith("### ")) return <h4 key={i} style={{ fontWeight: 600, fontSize: 14, marginTop: 10, marginBottom: 4 }}>{line.slice(4)}</h4>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ fontWeight: 700, marginBottom: 4 }}>{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }}>•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
        if (/^\d+\./.test(line)) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>{line.match(/^\d+/)?.[0]}.</span>
            <span>{line.replace(/^\d+\.\s*/, "")}</span>
          </div>
        );
        if (line.startsWith("`") && line.endsWith("`")) return (
          <code key={i} style={{ display: "block", background: "var(--surface-2)", border: "1px solid var(--border-1)", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 13, marginBottom: 4 }}>{line.slice(1,-1)}</code>
        );
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        return <p key={i} style={{ marginBottom: 4 }}>{line}</p>;
      })}
    </div>
  );
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) ?? null;
  const messages = activeChat?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const t = textRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
  }, [draft]);

  const newChat = useCallback(() => {
    const id = genId();
    setChats(prev => [{ id, title: "New conversation", messages: [], updatedAt: new Date() }, ...prev]);
    setActiveChatId(id);
    setDraft("");
  }, []);

  // Create default chat on mount
  useEffect(() => { newChat(); }, [newChat]);

  const send = async (text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || loading) return;
    setDraft("");

    const userMsg: Message = { id: genId(), role: "user", content, time: new Date() };

    setChats(prev => prev.map(c => c.id === activeChatId
      ? { ...c, title: c.messages.length === 0 ? content.slice(0, 48) : c.title, messages: [...c.messages, userMsg], updatedAt: new Date() }
      : c
    ));

    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: genId(),
        role: "assistant",
        content: data.content ?? "I'm sorry, I couldn't process that. Please try again.",
        time: new Date(),
        sources: data.sources,
      };
      setChats(prev => prev.map(c => c.id === activeChatId
        ? { ...c, messages: [...c.messages, userMsg, aiMsg], updatedAt: new Date() }
        : c
      ));
    } catch {
      const errMsg: Message = { id: genId(), role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", time: new Date() };
      setChats(prev => prev.map(c => c.id === activeChatId
        ? { ...c, messages: [...c.messages, userMsg, errMsg], updatedAt: new Date() }
        : c
      ));
    } finally {
      setLoading(false);
    }
  };

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [], title: "New conversation" } : c));
  };

  const userName = session?.user?.name ?? "User";

  return (
    <AppLayout title="AI Assistant">
      <div style={{ height: "calc(100vh - 58px)", display: "flex", overflow: "hidden" }}>

        {/* ── Left sidebar: history + suggestions ── */}
        <div className="hidden md:flex" style={{ width: 260, flexShrink: 0, flexDirection: "column", borderRight: "1px solid var(--border-1)", background: "var(--surface)", overflowY: "auto" }}>
          <div style={{ padding: "16px 14px 12px" }}>
            <button onClick={newChat}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", background: "var(--gold)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(196,144,32,0.25)" }}>
              <Plus className="w-4 h-4" /> New Conversation
            </button>
          </div>

          {/* Suggested questions */}
          <div style={{ padding: "0 14px 8px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Try asking
            </p>
            {SUGGESTIONS.slice(0, 5).map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%", padding: "8px 10px", background: "none", border: "none", cursor: "pointer", borderRadius: 8, textAlign: "left", marginBottom: 2, transition: "background 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                <ChevronRight style={{ width: 13, height: 13, color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{s}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border-1)", margin: "8px 14px" }} />

          {/* KB reference */}
          <div style={{ padding: "0 14px 8px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Knowledge Base
            </p>
            {KNOWLEDGE_BASE.map(kb => (
              <div key={kb.title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, marginBottom: 2 }}>
                <BookOpen style={{ width: 12, height: 12, color: "var(--text-3)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)" }}>{kb.title}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>{kb.category}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border-1)", margin: "8px 14px" }} />

          {/* Chat history */}
          {chats.length > 1 && (
            <div style={{ padding: "0 14px 16px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Recent chats
              </p>
              {chats.slice(0, 10).map(c => (
                <button key={c.id} onClick={() => setActiveChatId(c.id)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", background: c.id === activeChatId ? "var(--gold-pale)" : "none", border: "none", borderRadius: 8, cursor: "pointer", marginBottom: 2, transition: "background 0.12s" }}
                  onMouseEnter={e => { if (c.id !== activeChatId) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { if (c.id !== activeChatId) (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <p style={{ fontSize: 13, color: c.id === activeChatId ? "var(--gold)" : "var(--text-1)", fontWeight: c.id === activeChatId ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title || "New conversation"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                    {c.messages.length} message{c.messages.length !== 1 ? "s" : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Chat header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border-1)", flexShrink: 0, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1A2B40,#C49020)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>NGI AI Assistant</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>Powered by company knowledge base</p>
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "none", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer", color: "var(--text-3)", fontSize: 12 }}>
                <RefreshCw style={{ width: 12, height: 12 }} /> Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24, padding: "40px 20px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#1A2B40,#2A4060)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(26,43,64,0.2)" }}>
                  <Bot style={{ width: 32, height: 32, color: "#C49020" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                    How can I help you today?
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", maxWidth: 400, lineHeight: 1.6 }}>
                    I&apos;m the NGI IT Support AI. Ask me anything about IT issues, company systems, or best practices.
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 560, justifyContent: "center" }}>
                  {SUGGESTIONS.slice(0, 6).map(s => (
                    <button key={s} onClick={() => send(s)}
                      style={{ padding: "8px 16px", background: "var(--surface)", border: "1.5px solid var(--border-2)", borderRadius: 99, fontSize: 13, color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s", maxWidth: 280, textAlign: "center" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C49020"; (e.currentTarget as HTMLElement).style.color = "#C49020"; (e.currentTarget as HTMLElement).style.background = "var(--gold-pale)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 740, margin: "0 auto" }}>
                {messages.map(msg => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className="anim-fade-up" style={{ display: "flex", gap: 12, marginBottom: 24, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                      {!isUser && (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1A2B40,#2A4060)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <Bot style={{ width: 16, height: 16, color: "#C49020" }} />
                        </div>
                      )}
                      <div style={{ maxWidth: "82%" }}>
                        <div style={{
                          padding: "12px 16px",
                          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          background: isUser ? "var(--brand)" : "var(--surface)",
                          color: isUser ? "#fff" : "var(--text-1)",
                          border: isUser ? "none" : "1px solid var(--border-1)",
                          boxShadow: isUser ? "none" : "var(--sh-sm)",
                        }}>
                          {isUser
                            ? <p style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.content}</p>
                            : <MarkdownText content={msg.content} />}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {msg.sources.map(s => (
                              <span key={s} style={{ fontSize: 11, padding: "3px 10px", background: "rgba(196,144,32,0.1)", color: "#C49020", borderRadius: 99, border: "1px solid rgba(196,144,32,0.2)", display: "flex", alignItems: "center", gap: 4 }}>
                                <BookOpen style={{ width: 10, height: 10 }} /> {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                          <p style={{ fontSize: 10, color: "var(--text-3)" }}>{fmtTime(msg.time)}</p>
                          {!isUser && (
                            <button onClick={() => copyMsg(msg.id, msg.content)}
                              style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: copiedId === msg.id ? "#10B981" : "var(--text-3)", fontSize: 11, padding: "2px 6px", borderRadius: 4, transition: "color 0.12s" }}>
                              {copiedId === msg.id ? <Check style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />}
                              {copiedId === msg.id ? "Copied" : "Copy"}
                            </button>
                          )}
                        </div>
                      </div>
                      {isUser && (
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#C49020", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                          {(userName[0] ?? "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="anim-fade-up" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#1A2B40,#2A4060)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot style={{ width: 16, height: 16, color: "#C49020" }} />
                    </div>
                    <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border-1)", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px 16px", borderTop: "1px solid var(--border-1)", background: "var(--surface)", flexShrink: 0 }}>
            <div style={{ maxWidth: 740, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--surface-2)", border: "1.5px solid var(--border-2)", borderRadius: 14, padding: "8px 12px", transition: "border-color 0.15s" }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(196,144,32,0.08)"; }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <textarea ref={textRef} value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask anything about IT support, company systems, troubleshooting…"
                  disabled={loading}
                  rows={1}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-1)", resize: "none", maxHeight: 140, lineHeight: 1.6, fontFamily: "inherit", paddingTop: 2 }} />
                <button onClick={() => send()} disabled={!draft.trim() || loading}
                  style={{ width: 36, height: 36, borderRadius: 9, border: "none", cursor: draft.trim() && !loading ? "pointer" : "not-allowed", background: draft.trim() && !loading ? "var(--gold)" : "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                  {loading
                    ? <Loader2 style={{ width: 16, height: 16, color: "#fff" }} className="animate-spin" />
                    : <Send style={{ width: 16, height: 16, color: draft.trim() ? "#fff" : "var(--text-3)" }} />}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 8 }}>
                NGI AI uses your company knowledge base. For complex issues, <a href="/tickets/new" style={{ color: "var(--gold)", textDecoration: "none" }}>raise a support ticket</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
