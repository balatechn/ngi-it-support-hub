import fs from "fs";
import path from "path";

export interface TicketNote {
  timestamp: string;
  updatedBy: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}

export interface TicketRecord {
  id: string;
  name: string;
  email: string;
  location: string;
  department: string;
  contact: string;
  ticketType: string;
  category: string;
  priority: string;
  description: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  history?: TicketNote[];
}

export function genTicketId() {
  return `NGI-${Math.floor(10000 + Math.random() * 90000)}`;
}

// ── Remote mode: Vercel → Coolify ticket server ───────────────
const REMOTE_URL = process.env.TICKETS_API_URL?.replace(/\/$/, "");
const REMOTE_KEY = process.env.TICKET_API_KEY ?? "";

function remoteHeaders(): HeadersInit {
  return { "Content-Type": "application/json", ...(REMOTE_KEY ? { "x-api-key": REMOTE_KEY } : {}) };
}

// ── Local file-system (dev without TICKETS_API_URL) ────────────
const DATA_DIR  = process.env.DATA_DIR ?? path.join(process.cwd(), ".ticket-data");
const DATA_FILE = path.join(DATA_DIR, "tickets.json");

function localRead(): Map<string, TicketRecord> {
  try {
    if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return new Map();
    const arr: TicketRecord[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return new Map(arr.map(t => [t.id, t]));
  } catch {
    return new Map();
  }
}

function localWrite(store: Map<string, TicketRecord>) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(store.values()), null, 2));
  } catch (e) {
    console.error("ticketStore: failed to persist", e);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __ticketStore: Map<string, TicketRecord> | undefined;
}

function getLocalStore(): Map<string, TicketRecord> {
  return (global.__ticketStore ??= localRead());
}

// ── Public API (all async) ─────────────────────────────────────
export async function listTickets(): Promise<TicketRecord[]> {
  if (REMOTE_URL) {
    const res = await fetch(`${REMOTE_URL}/tickets`, { headers: remoteHeaders(), cache: "no-store" });
    if (!res.ok) throw new Error(`Ticket server ${res.status}`);
    return res.json();
  }
  return Array.from(getLocalStore().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTicket(id: string): Promise<TicketRecord | null> {
  if (REMOTE_URL) {
    const res = await fetch(`${REMOTE_URL}/tickets/${id}`, { headers: remoteHeaders(), cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Ticket server ${res.status}`);
    return res.json();
  }
  return getLocalStore().get(id) ?? null;
}

export async function saveTicket(ticket: TicketRecord): Promise<void> {
  if (REMOTE_URL) {
    const res = await fetch(`${REMOTE_URL}/tickets`, {
      method: "POST",
      headers: remoteHeaders(),
      body: JSON.stringify(ticket),
    });
    if (!res.ok) throw new Error(`Ticket server ${res.status}`);
    return;
  }
  const store = getLocalStore();
  store.set(ticket.id, ticket);
  localWrite(store);
}

export async function patchTicket(
  id: string,
  patch: Partial<TicketRecord>
): Promise<TicketRecord | null> {
  if (REMOTE_URL) {
    const res = await fetch(`${REMOTE_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: remoteHeaders(),
      body: JSON.stringify(patch),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Ticket server ${res.status}`);
    return res.json();
  }
  const existing = getLocalStore().get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  const store = getLocalStore();
  store.set(id, updated);
  localWrite(store);
  return updated;
}
