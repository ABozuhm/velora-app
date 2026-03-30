const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Basic route (fallback)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.io connection (for video/chat later)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔥 IMPORTANT: Use Render's port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: langInstruction },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});    id: crypto.randomUUID(),
    handle: "@nightvibe",
    tag: "Hot Right Now",
    bio: "Late-night social energy, smooth visuals, and a strong creator profile made for discovery."
  }
];

const bossesNBaddiesEntries = [
  {
    id: crypto.randomUUID(),
    title: "Midnight Queen",
    description: "Confident, polished, and contest-ready.",
    imageUrl: "",
    category: "women",
    createdByUserId: "demo-user-1",
    createdByName: "Velora Demo",
    ageVerified: true,
    disclaimerAccepted: true,
    freeVotes: 4,
    paidVotes: 10,
    totalVotes: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "City Boss",
    description: "Sharp look, strong energy, ready for the vote.",
    imageUrl: "",
    category: "men",
    createdByUserId: "demo-user-2",
    createdByName: "Velora Demo",
    ageVerified: true,
    disclaimerAccepted: true,
    freeVotes: 5,
    paidVotes: 6,
    totalVotes: 11,
    createdAt: new Date().toISOString()
  }
];

/* DM + blocks */
const directMessages = []; // {id, fromUserId, toUserId, text, createdAt}
const blockedUsers = [];   // {blockerUserId, blockedUserId, createdAt}

/* Rooms */
const rooms = [
  {
    id: "velora-lounge",
    name: "Velora Lounge",
    description: "Open room for community chat.",
    members: [],
    messages: []
  },
  {
    id: "bosses-room",
    name: "Bosses Room",
    description: "Men’s contest and discussion room.",
    members: [],
    messages: []
  },
  {
    id: "baddies-room",
    name: "Baddies Room",
    description: "Women’s contest and discussion room.",
    members: [],
    messages: []
  }
];

/* Contest votes + payment verification + logs */
const voteLedger = []; // {id, entryId, voterUserId, kind, dollars, votes, verified, createdAt}
const paymentVerifications = []; // placeholder only
const auditLogs = []; // {id, type, userId, details, createdAt}

/* -----------------------------
   Helpers
------------------------------*/
function logAudit(type, userId, details = {}) {
  auditLogs.push({
    id: crypto.randomUUID(),
    type,
    userId: userId || null,
    details,
    createdAt: new Date().toISOString()
  });
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dateOfBirth: user.dateOfBirth || ""
  };
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token || !sessionsByToken.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const email = sessionsByToken.get(token);
  const user = usersByEmail.get(email);
  if (!user) {
    sessionsByToken.delete(token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.authUser = user;
  req.authToken = token;
  next();
}

function isBlocked(userAId, userBId) {
  return blockedUsers.some(
    (row) =>
      (row.blockerUserId === userAId && row.blockedUserId === userBId) ||
      (row.blockerUserId === userBId && row.blockedUserId === userAId)
  );
}

function getUserByHandle(handleOrEmailOrId) {
  const query = String(handleOrEmailOrId || "").trim().toLowerCase();
  if (!query) return null;

  for (const user of usersByEmail.values()) {
    const handle = `@${String(user.name || "").trim().toLowerCase().replace(/\s+/g, "")}`;
    if (
      user.id === query ||
      user.email === query ||
      handle === query ||
      String(user.name || "").trim().toLowerCase() === query
    ) {
      return user;
    }
  }
  return null;
}

/* -----------------------------
   Health
------------------------------*/
app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "velora-app" });
});

/* -----------------------------
   Auth
------------------------------*/
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, dateOfBirth } = req.body || {};
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");
  const cleanDob = String(dateOfBirth || "").trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  if (cleanPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  if (usersByEmail.has(cleanEmail)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: cleanName.slice(0, 80),
    email: cleanEmail,
    password: cleanPassword,
    dateOfBirth: cleanDob
  };

  usersByEmail.set(cleanEmail, user);
  usersById.set(user.id, user);

  const token = createToken();
  sessionsByToken.set(token, cleanEmail);

  logAudit("register", user.id, { email: cleanEmail });

  res.json({
    message: "Account created.",
    token,
    user: publicUser(user)
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || "");
  const user = usersByEmail.get(cleanEmail);

  if (!user || user.password !== cleanPassword) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = createToken();
  sessionsByToken.set(token, cleanEmail);

  logAudit("login", user.id, { email: cleanEmail });

  res.json({
    token,
    user: publicUser(user)
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.authUser) });
});

/* -----------------------------
   Chat / Guide mode
------------------------------*/
app.post("/api/chat", (req, res) => {
  const { message, profile } = req.body || {};
  const userMessage = String(message || "").trim();

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required." });
  }

  const reply = buildVeloraReply(userMessage, profile || {});
  res.json({ reply });
});

app.post("/api/tts", (_req, res) => {
  res.status(501).json({
    error: "Hosted TTS is not configured yet. Browser voice fallback should be used."
  });
});

/* -----------------------------
   Discover
------------------------------*/
app.get("/api/discover", (_req, res) => {
  res.json({ cards: discoverCards });
});

/* -----------------------------
   BossesNBaddies entries
------------------------------*/
app.get("/api/bossesnbaddies", (_req, res) => {
  const women = bossesNBaddiesEntries.filter((e) => e.category === "women");
  const men = bossesNBaddiesEntries.filter((e) => e.category === "men");
  res.json({ women, men, all: bossesNBaddiesEntries.slice().reverse() });
});

app.post("/api/bossesnbaddies/entries", requireAuth, (req, res) => {
  const {
    title,
    description,
    imageUrl,
    category,
    ageVerified,
    disclaimerAccepted
  } = req.body || {};

  const cleanTitle = String(title || "").trim();
  const cleanDescription = String(description || "").trim();
  const cleanImageUrl = String(imageUrl || "").trim();
  const cleanCategory = String(category || "").trim().toLowerCase();

  if (!cleanTitle || !cleanDescription) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  if (!["women", "men"].includes(cleanCategory)) {
    return res.status(400).json({ error: "Category must be women or men." });
  }

  if (!ageVerified || !disclaimerAccepted) {
    return res.status(400).json({
      error: "Age verification and disclaimer acceptance are required."
    });
  }

  const entry = {
    id: crypto.randomUUID(),
    title: cleanTitle.slice(0, 120),
    description: cleanDescription.slice(0, 500),
    imageUrl: cleanImageUrl.slice(0, 500),
    category: cleanCategory,
    createdByUserId: req.authUser.id,
    createdByName: req.authUser.name,
    ageVerified: true,
    disclaimerAccepted: true,
    freeVotes: 0,
    paidVotes: 0,
    totalVotes: 0,
    createdAt: new Date().toISOString()
  };

  bossesNBaddiesEntries.push(entry);
  logAudit("contest_entry_created", req.authUser.id, { entryId: entry.id, category: cleanCategory });

  res.status(201).json({ entry });
});

/* -----------------------------
   Voting
------------------------------*/
app.post("/api/bossesnbaddies/vote/free", requireAuth, (req, res) => {
  const { entryId } = req.body || {};
  const entry = bossesNBaddiesEntries.find((e) => e.id === entryId);

  if (!entry) {
    return res.status(404).json({ error: "Entry not found." });
  }

  const existing = voteLedger.find(
    (v) =>
      v.entryId === entryId &&
      v.voterUserId === req.authUser.id &&
      v.kind === "free"
  );

  if (existing) {
    return res.status(409).json({ error: "Free vote already used on this entry." });
  }

  entry.freeVotes += 1;
  entry.totalVotes += 1;

  voteLedger.push({
    id: crypto.randomUUID(),
    entryId,
    voterUserId: req.authUser.id,
    kind: "free",
    dollars: 0,
    votes: 1,
    verified: true,
    createdAt: new Date().toISOString()
  });

  logAudit("contest_free_vote", req.authUser.id, { entryId });

  res.json({ entry });
});

app.post("/api/bossesnbaddies/vote/paid", requireAuth, (req, res) => {
  const { entryId, dollars, paymentReference } = req.body || {};
  const entry = bossesNBaddiesEntries.find((e) => e.id === entryId);

  if (!entry) {
    return res.status(404).json({ error: "Entry not found." });
  }

  const amount = Number(dollars);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Valid dollar amount required." });
  }

  // Placeholder verification only.
  // Real implementation must verify a payment processor webhook / charge record.
  const verified = Boolean(paymentReference && String(paymentReference).trim());

  if (!verified) {
    return res.status(400).json({
      error: "Payment verification required."
    });
  }

  const votes = Math.floor(amount * 2);

  entry.paidVotes += votes;
  entry.totalVotes += votes;

  const ledgerRow = {
    id: crypto.randomUUID(),
    entryId,
    voterUserId: req.authUser.id,
    kind: "paid",
    dollars: amount,
    votes,
    verified: true,
    paymentReference: String(paymentReference).trim(),
    createdAt: new Date().toISOString()
  };

  voteLedger.push(ledgerRow);
  paymentVerifications.push({
    id: crypto.randomUUID(),
    userId: req.authUser.id,
    entryId,
    paymentReference: String(paymentReference).trim(),
    dollars: amount,
    votes,
    verifiedAt: new Date().toISOString()
  });

  logAudit("contest_paid_vote", req.authUser.id, { entryId, dollars: amount, votes });

  res.json({
    entry,
    verified: true,
    votesAdded: votes,
    note: "35% company withholding must be handled in payout accounting."
  });
});

app.get("/api/bossesnbaddies/ledger/:entryId", requireAuth, (req, res) => {
  const rows = voteLedger.filter((v) => v.entryId === req.params.entryId);
  res.json({ votes: rows });
});

/* -----------------------------
   DMs
------------------------------*/
app.get("/api/messages", requireAuth, (req, res) => {
  const inbox = directMessages.filter(
    (m) => m.fromUserId === req.authUser.id || m.toUserId === req.authUser.id
  );
  res.json({ messages: inbox });
});

app.post("/api/messages", requireAuth, (req, res) => {
  const { target, text } = req.body || {};
  const cleanText = String(text || "").trim();
  const targetUser = getUserByHandle(target);

  if (!targetUser) {
    return res.status(404).json({ error: "Target user not found." });
  }

  if (!cleanText) {
    return res.status(400).json({ error: "Message text required." });
  }

  if (targetUser.id === req.authUser.id) {
    return res.status(400).json({ error: "You cannot message yourself." });
  }

  if (isBlocked(req.authUser.id, targetUser.id)) {
    return res.status(403).json({ error: "Messaging blocked between these users." });
  }

  const dm = {
    id: crypto.randomUUID(),
    fromUserId: req.authUser.id,
    fromName: req.authUser.name,
    toUserId: targetUser.id,
    toName: targetUser.name,
    text: cleanText.slice(0, 2000),
    createdAt: new Date().toISOString()
  };

  directMessages.push(dm);
  logAudit("dm_sent", req.authUser.id, { toUserId: targetUser.id, messageId: dm.id });

  res.status(201).json({ message: dm });
});

/* -----------------------------
   Blocking
------------------------------*/
app.get("/api/blocks", requireAuth, (req, res) => {
  const rows = blockedUsers.filter((b) => b.blockerUserId === req.authUser.id);
  res.json({ blocked: rows });
});

app.post("/api/blocks", requireAuth, (req, res) => {
  const { target } = req.body || {};
  const targetUser = getUserByHandle(target);

  if (!targetUser) {
    return res.status(404).json({ error: "Target user not found." });
  }

  if (targetUser.id === req.authUser.id) {
    return res.status(400).json({ error: "You cannot block yourself." });
  }

  const exists = blockedUsers.find(
    (b) => b.blockerUserId === req.authUser.id && b.blockedUserId === targetUser.id
  );

  if (exists) {
    return res.status(409).json({ error: "User already blocked." });
  }

  const blockRow = {
    blockerUserId: req.authUser.id,
    blockedUserId: targetUser.id,
    blockedName: targetUser.name,
    createdAt: new Date().toISOString()
  };

  blockedUsers.push(blockRow);
  logAudit("user_blocked", req.authUser.id, { blockedUserId: targetUser.id });

  res.status(201).json({ blocked: blockRow });
});

app.delete("/api/blocks/:targetUserId", requireAuth, (req, res) => {
  const index = blockedUsers.findIndex(
    (b) => b.blockerUserId === req.authUser.id && b.blockedUserId === req.params.targetUserId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Block not found." });
  }

  const removed = blockedUsers.splice(index, 1)[0];
  logAudit("user_unblocked", req.authUser.id, { blockedUserId: removed.blockedUserId });

  res.json({ success: true });
});

/* -----------------------------
   Rooms
------------------------------*/
app.get("/api/rooms", (_req, res) => {
  res.json({ rooms });
});

app.post("/api/rooms/:roomId/join", requireAuth, (req, res) => {
  const room = rooms.find((r) => r.id === req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found." });
  }

  if (!room.members.includes(req.authUser.id)) {
    room.members.push(req.authUser.id);
  }

  logAudit("room_join", req.authUser.id, { roomId: room.id });
  res.json({ room });
});

app.get("/api/rooms/:roomId/messages", requireAuth, (req, res) => {
  const room = rooms.find((r) => r.id === req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found." });
  }
  res.json({ messages: room.messages });
});

app.post("/api/rooms/:roomId/messages", requireAuth, (req, res) => {
  const room = rooms.find((r) => r.id === req.params.roomId);
  const text = String(req.body?.text || "").trim();

  if (!room) {
    return res.status(404).json({ error: "Room not found." });
  }

  if (!text) {
    return res.status(400).json({ error: "Message text required." });
  }

  if (!room.members.includes(req.authUser.id)) {
    room.members.push(req.authUser.id);
  }

  const message = {
    id: crypto.randomUUID(),
    roomId: room.id,
    userId: req.authUser.id,
    userName: req.authUser.name,
    text: text.slice(0, 2000),
    createdAt: new Date().toISOString()
  };

  room.messages.push(message);
  logAudit("room_message_sent", req.authUser.id, { roomId: room.id, messageId: message.id });

  res.status(201).json({ message });
});

/* -----------------------------
   Audit / legal log endpoints
   Admin-only in a real build
------------------------------*/
app.get("/api/audit", (_req, res) => {
  res.json({
    logs: auditLogs,
    note: "Starter endpoint only. Real legal recordkeeping requires secure, access-controlled storage."
  });
});

app.get("/api/payment-verifications", (_req, res) => {
  res.json({
    verifications: paymentVerifications,
    note: "Starter placeholder only. Real payment verification must come from provider webhooks."
  });
});

/* -----------------------------
   Fallback
------------------------------*/
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -----------------------------
   Socket.IO
------------------------------*/
io.on("connection", (socket) => {
  socket.emit("your-id", socket.id);

  socket.on("request-call", (targetId) => {
    if (!targetId) return;
    io.to(targetId).emit("incoming-call", socket.id);
  });

  socket.on("accept-call", (callerId) => {
    if (!callerId) return;
    io.to(callerId).emit("call-accepted", socket.id);
  });

  socket.on("signal", (payload) => {
    if (!payload || !payload.to) return;
    io.to(payload.to).emit("signal", {
      from: socket.id,
      signal: payload.signal
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* -----------------------------
   Velora reply engine
------------------------------*/
function buildVeloraReply(message, profile) {
  const clean = String(message || "").toLowerCase();
  const assistantName = String(profile.assistantName || "Velora").trim() || "Velora";
  const displayName = String(profile.displayName || "").trim() || "you";
  const style = String(profile.personalityStyle || profile.style || "balanced").trim();

  if (style === "guide") {
    return buildGuideReply(message, assistantName, displayName);
  }

  const tonePrefix =
    style === "savage" ? `${assistantName} here. Let’s keep it real. `
    : style === "playful" ? `${assistantName} here. `
    : style === "luxe" ? `${assistantName} here. `
    : `${assistantName} here. `;

  if (clean.includes("hello") || clean.includes("hi ")) {
    return `${tonePrefix}Hey ${displayName}, I’m ready. Ask me anything or jump into Meet, Discover, BossesNBaddies, Messages, or Rooms from the sidebar.`;
  }

  if (clean.includes("dm") || clean.includes("message")) {
    return `${tonePrefix}Use the Messages tab to DM users you connect with. Blocking controls belong there too.`;
  }

  if (clean.includes("room")) {
    return `${tonePrefix}Rooms let multiple users gather and chat together at the same time.`;
  }

  if (clean.includes("vote") || clean.includes("contest")) {
    return `${tonePrefix}BossesNBaddies supports free votes and paid vote math where each 1 dollar counts as 2 votes.`;
  }

  if (clean.includes("help me") || clean.includes("guide me")) {
    return `${tonePrefix}Tell me what screen or device you’re on and I’ll walk you through it step by step.`;
  }

  return `${tonePrefix}I heard you say: "${message}". I can help with assistant tasks, guide mode, Meet, Discover, BossesNBaddies, DMs, rooms, or profile setup.`;
}

function buildGuideReply(message, assistantName, displayName) {
  const clean = String(message || "").toLowerCase();

  if (clean.includes("wifi") || clean.includes("wi-fi")) {
    return `${assistantName} guide mode: Alright ${displayName}, first open Settings. Next tap Wi-Fi. Then choose the network you want and press Connect.`;
  }

  if (clean.includes("bluetooth")) {
    return `${assistantName} guide mode: Open Settings, tap Bluetooth, make sure it is on, then put the other device in pairing mode and tap its name when it appears.`;
  }

  if (clean.includes("printer")) {
    return `${assistantName} guide mode: Open Settings, go to Devices or Printers, choose Add printer, then select your printer from the list.`;
  }

  return `${assistantName} guide mode: Tell me what device you are on, what screen you see, and what you are trying to do. Then I will guide you step by step.`;
}
