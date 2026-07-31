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

// Module-level singleton — persists for the lifetime of the Node.js process
declare global {
  // eslint-disable-next-line no-var
  var __ticketStore: Map<string, TicketRecord> | undefined;
}

export const ticketStore: Map<string, TicketRecord> =
  global.__ticketStore ?? (global.__ticketStore = new Map());

export function genTicketId() {
  const n = String(Math.floor(10000 + Math.random() * 90000));
  return `NGI-${n}`;
}
