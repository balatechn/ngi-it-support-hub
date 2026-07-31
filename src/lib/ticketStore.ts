import fs from "fs";
import path from "path";

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
}

const DATA_DIR  = process.env.DATA_DIR ?? "/data";
const DATA_FILE = path.join(DATA_DIR, "tickets.json");

function loadFromDisk(): Map<string, TicketRecord> {
  try {
    if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return new Map();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const arr: TicketRecord[] = JSON.parse(raw);
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

// Load from disk on first init; reuse in-memory map across hot-reloads
export const ticketStore: Map<string, TicketRecord> =
  global.__ticketStore ?? (global.__ticketStore = loadFromDisk());

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
