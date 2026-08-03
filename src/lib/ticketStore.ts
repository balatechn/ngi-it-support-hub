import { Redis } from "@upstash/redis";
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

// ── Redis (production) ─────────────────────────────────────────
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const TICKETS_KEY = "ngi:tickets";

const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

// ── Local file-system (dev without Redis env vars) ─────────────
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

// ── Public API ─────────────────────────────────────────────────
export async function listTickets(): Promise<TicketRecord[]> {
  if (redis) {
    const hash = (await redis.hgetall<Record<string, TicketRecord>>(TICKETS_KEY)) ?? {};
    return Object.values(hash).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return Array.from(getLocalStore().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTicket(id: string): Promise<TicketRecord | null> {
  if (redis) {
    return redis.hget<TicketRecord>(TICKETS_KEY, id);
  }
  return getLocalStore().get(id) ?? null;
}

export async function saveTicket(ticket: TicketRecord): Promise<void> {
  if (redis) {
    await redis.hset(TICKETS_KEY, { [ticket.id]: ticket });
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
  const existing = await getTicket(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  await saveTicket(updated);
  return updated;
}
