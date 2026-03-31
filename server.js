const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/setup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "setup.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};
  const text = String(message || "").trim().toLowerCase();

  let reply = "Hi, I’m Velora. Tell me how you want me programmed.";

  if (text.includes("hi") || text.includes("hello")) {
    reply = "Hi beautiful, I’m Velora. Tap the tabs, explore the app, or open the AI Setup page.";
  } else if (text.includes("name")) {
    reply = "You can choose my AI name on the AI Setup page.";
  } else if (text.includes("voice")) {
    reply = "You can choose a real-like voice from the Voice menu on the AI Setup page.";
  } else if (text.includes("personality")) {
    reply = "You can choose a sweet, bossy, classy, romantic, savage, or luxury personality.";
  } else if (text.includes("program")) {
    reply = "Open AI Setup and fill in language, AI name, personality, and voice.";
  }

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
