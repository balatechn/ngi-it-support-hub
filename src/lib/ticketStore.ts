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

// ── Remote mode: Vercel → Coolify ticket server ───────────────
const REMOTE_URL = process.env.TICKETS_API_URL?.replace(/\/$/, "");
const REMOTE_KEY = process.env.TICKET_API_KEY ?? "";
export const isRemote = !!REMOTE_URL;

function remoteHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "x-api-key": REMOTE_KEY };
}

export async function remoteListTickets(): Promise<TicketRecord[]> {
  const res = await fetch(`${REMOTE_URL}/tickets`, {
    headers: remoteHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Ticket server ${res.status}`);
  return res.json();
}

export async function remoteGetTicket(id: string): Promise<TicketRecord | null> {
  const res = await fetch(`${REMOTE_URL}/tickets/${id}`, {
    headers: remoteHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Ticket server ${res.status}`);
  return res.json();
}

export async function remoteSaveTicket(ticket: TicketRecord): Promise<TicketRecord> {
  const res = await fetch(`${REMOTE_URL}/tickets`, {
    method: "POST",
    headers: remoteHeaders(),
    body: JSON.stringify(ticket),
  });
  if (!res.ok) throw new Error(`Ticket server ${res.status}`);
  return res.json();
}

export async function remotePatchTicket(
  id: string,
  patch: Partial<TicketRecord>
): Promise<TicketRecord | null> {
  const res = await fetch(`${REMOTE_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: remoteHeaders(),
    body: JSON.stringify(patch),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Ticket server ${res.status}`);
  return res.json();
}

// ── Local file-system mode (dev without TICKETS_API_URL) ──────
const DATA_DIR  = process.env.DATA_DIR ?? "/data";
const DATA_FILE = path.join(DATA_DIR, "tickets.json");

function loadFromDisk(): Map<string, TicketRecord> {
  try {
    if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return new Map();
    const arr: TicketRecord[] = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return new Map(arr.map(t => [t.id, t]));
  } catch {
    return new Map();
  }
}

function saveToDisk(store: Map<string, TicketRecord>) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(store.values()), null, 2), "utf-8");
  } catch (e) {
    console.error("ticketStore: failed to persist to disk", e);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __ticketStore: Map<string, TicketRecord> | undefined;
}

export const ticketStore: Map<string, TicketRecord> = isRemote
  ? new Map()
  : (global.__ticketStore ?? (global.__ticketStore = loadFromDisk()));

export function saveTicket(record: TicketRecord) {
  ticketStore.set(record.id, record);
  saveToDisk(ticketStore);
}

export function updateTicket(id: string, patch: Partial<TicketRecord>): TicketRecord | null {
  const existing = ticketStore.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  ticketStore.set(id, updated);
  saveToDisk(ticketStore);
  return updated;
}

export function genTicketId() {
  const n = String(Math.floor(10000 + Math.random() * 90000));
  return `NGI-${n}`;
}
