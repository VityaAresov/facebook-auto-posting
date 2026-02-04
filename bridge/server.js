const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json({ limit: "2mb" }));

const CONFIG_PATH = path.join(__dirname, "bridge.config.json");
const DATA_PATH = path.join(__dirname, "bridge.data.json");
const DEFAULT_API_KEY = "9abc2df4f9e895350af7257c58a839003a29a5ef31ee3c4b";

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[Bridge] Failed to read ${filePath}:`, e.message);
    return fallback;
  }
}

function writeJsonSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn(`[Bridge] Failed to write ${filePath}:`, e.message);
  }
}

const config = readJsonSafe(CONFIG_PATH, {
  port: 3721,
  apiKey: DEFAULT_API_KEY,
});
// Allow env override (useful for servers/containers)
config.apiKey =
  process.env.BRIDGE_API_KEY ||
  process.env.API_KEY ||
  config.apiKey ||
  DEFAULT_API_KEY;
// If config was missing/empty, persist the default so UI/docs stay in sync
if (!config.apiKey) {
  config.apiKey = DEFAULT_API_KEY;
  writeJsonSafe(CONFIG_PATH, config);
}
const store = readJsonSafe(DATA_PATH, { commands: [], status: {} });

function persist() {
  writeJsonSafe(DATA_PATH, store);
}

function newId(prefix = "cmd") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function authMiddleware(req, res, next) {
  if (!config.apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const headerKey = req.header("x-api-key");
  const authHeader = req.header("authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const bearerKey = bearerMatch ? bearerMatch[1] : "";
  const queryKey = req.query.api_key || "";

  const key = headerKey || bearerKey || queryKey;
  if (!key || key !== config.apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

function enqueueCommand(action, payload) {
  const cmd = {
    id: newId(),
    action,
    payload: payload || {},
    status: "queued",
    createdAt: new Date().toISOString(),
    claimedAt: null,
    completedAt: null,
    clientId: null,
    result: null,
  };
  store.commands.push(cmd);
  persist();
  return cmd;
}

app.post("/v1/commands", authMiddleware, (req, res) => {
  const { action, payload } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });
  const cmd = enqueueCommand(action, payload);
  res.json({ id: cmd.id, status: "queued" });
});

// --- Simple alias endpoints ---
app.get("/status", authMiddleware, (req, res) => {
  const clientId = req.query.clientId;
  if (clientId) {
    return res.json(store.status[clientId] || null);
  }
  res.json(store.status);
});

app.post("/send", authMiddleware, (req, res) => {
  const { action, payload } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });
  const cmd = enqueueCommand(action, payload);
  res.json({ id: cmd.id, status: "queued" });
});

app.post("/click", authMiddleware, (req, res) => {
  const payload = req.body || {};
  const cmd = enqueueCommand("click", payload);
  res.json({ id: cmd.id, status: "queued" });
});

app.post("/open", authMiddleware, (req, res) => {
  const payload = req.body || {};
  const cmd = enqueueCommand("open", payload);
  res.json({ id: cmd.id, status: "queued" });
});

app.get("/v1/commands/next", authMiddleware, (req, res) => {
  const clientId = req.query.clientId || "unknown";
  const now = Date.now();
  const requeueAfterMs = 10 * 60 * 1000; // 10 min

  // Requeue stuck in-progress commands
  for (const c of store.commands) {
    if (c.status === "in_progress" && c.claimedAt) {
      const age = now - new Date(c.claimedAt).getTime();
      if (age > requeueAfterMs) {
        c.status = "queued";
        c.clientId = null;
        c.claimedAt = null;
      }
    }
  }

  const next = store.commands.find((c) => c.status === "queued");
  if (!next) return res.status(204).send();

  next.status = "in_progress";
  next.clientId = clientId;
  next.claimedAt = new Date().toISOString();
  persist();

  res.json({
    id: next.id,
    action: next.action,
    payload: next.payload,
    createdAt: next.createdAt,
  });
});

app.post("/v1/commands/:id/ack", authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status, result } = req.body || {};
  const cmd = store.commands.find((c) => c.id === id);
  if (!cmd) return res.status(404).json({ error: "Not found" });

  cmd.status = status || "success";
  cmd.result = result || null;
  cmd.completedAt = new Date().toISOString();
  persist();

  res.json({ ok: true });
});

app.post("/v1/status", authMiddleware, (req, res) => {
  const { clientId } = req.body || {};
  if (!clientId) return res.status(400).json({ error: "Missing clientId" });
  store.status[clientId] = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  persist();
  res.json({ ok: true });
});

app.get("/v1/status", authMiddleware, (req, res) => {
  const clientId = req.query.clientId;
  if (clientId) {
    return res.json(store.status[clientId] || null);
  }
  res.json(store.status);
});

app.listen(config.port, "127.0.0.1", () => {
  console.log(`[Bridge] Listening on http://127.0.0.1:${config.port}`);
});
