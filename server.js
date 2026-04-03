const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const users = new Map();
const messages = [];
const rooms = [
  { id: "velora-lounge", name: "Velora Lounge", vibe: "Meet, chat, discover" },
  { id: "bosses-room", name: "Bosses Room", vibe: "Confidence, style, ambition" },
  { id: "baddies-room", name: "Baddies Room", vibe: "Beauty, fun, energy" }
];

const discoverCards = [
  {
    id: 1,
    title: "BossesNBaddies",
    text: "Upload shorts, clips, and creative content.",
    type: "Contest"
  },
  {
    id: 2,
    title: "Velora Live",
    text: "Talk, vibe, and build your AI experience.",
    type: "Live"
  },
  {
    id: 3,
    title: "Meet & Connect",
    text: "Discover people, creators, and new rooms.",
    type: "Social"
  }
];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, service: "velora-app" });
});

app.get("/api/discover", (req, res) => {
  res.json({ ok: true, cards: discoverCards, rooms });
});

app.get("/api/messages", (req, res) => {
  res.json({ ok: true, messages: messages.slice(-50) });
});

app.post("/api/messages", (req, res) => {
  const { name, text } = req.body || {};
  if (!text) {
    return res.status(400).json({ ok: false, error: "Message text is required." });
  }

  const msg = {
    id: Date.now(),
    name: name || "Guest",
    text,
    createdAt: new Date().toISOString()
  };

  messages.push(msg);
  io.emit("chat message", msg);

  res.json({ ok: true, message: msg });
});

app.post("/api/chat", (req, res) => {
  const { message, personality, username } = req.body || {};

  const safeName = username || "beautiful";
  const safePersonality = personality || "Velora - Confident";
  const incoming = (message || "").toLowerCase();

  let reply = `Hi ${safeName}, I'm Velora. You selected ${safePersonality}. Tell me how you want me to act.`;

  if (incoming.includes("hello") || incoming.includes("hi")) {
    reply = `Hey ${safeName}... I'm Velora. You look like you're ready to build something special.`;
  } else if (incoming.includes("name")) {
    reply = `My name is Velora. I can be flirty, friendly, confident, or chill depending on what you choose.`;
  } else if (incoming.includes("help")) {
    reply = `I can help you set up your assistant, talk with you, and guide users into the Velora experience.`;
  } else if (incoming.includes("voice")) {
    reply = `Use the voice selector on the AI Boo page to test different browser voices.`;
  }

  res.json({ ok: true, reply });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join room", ({ room, name }) => {
    if (room) {
      socket.join(room);
      users.set(socket.id, { room, name: name || "Guest" });
      io.to(room).emit("system message", {
        text: `${name || "Guest"} joined ${room}`,
        createdAt: new Date().toISOString()
      });
    }
  });

  socket.on("chat message", (payload) => {
    const user = users.get(socket.id) || {};
    const msg = {
      id: Date.now(),
      room: user.room || "velora-lounge",
      name: payload?.name || user.name || "Guest",
      text: payload?.text || "",
      createdAt: new Date().toISOString()
    };

    messages.push(msg);
    io.to(msg.room).emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user?.room) {
      io.to(user.room).emit("system message", {
        text: `${user.name || "Guest"} left ${user.room}`,
        createdAt: new Date().toISOString()
      });
    }
    users.delete(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
