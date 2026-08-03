const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DATA_FILE = process.env.DATA_FILE || "/data/tickets.json";
const API_KEY = process.env.TICKET_API_KEY || "";

function auth(req, res, next) {
  if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function read() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function write(tickets) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2));
}

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/tickets", auth, (req, res) => {
  const tickets = read().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(tickets);
});

app.post("/tickets", auth, (req, res) => {
  const tickets = read();
  const ticket = req.body;
  tickets.push(ticket);
  write(tickets);
  res.status(201).json(ticket);
});

app.get("/tickets/:id", auth, (req, res) => {
  const ticket = read().find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: "Not found" });
  res.json(ticket);
});

app.patch("/tickets/:id", auth, (req, res) => {
  const tickets = read();
  const idx = tickets.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  tickets[idx] = {
    ...tickets[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  write(tickets);
  res.json(tickets[idx]);
});

app.listen(PORT, () => console.log(`Ticket server listening on :${PORT}`));
