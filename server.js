const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/chat", (req, res) => {
  const message = req.body.message || "";
  res.json({ reply: `You said: ${message}` });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});    .brand {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .tab {
      padding: 12px;
      background: #242424;
      margin-bottom: 10px;
      border-radius: 10px;
      cursor: pointer;
    }

    .tab:hover {
      background: #333;
    }

    .panel {
      background: #1c1c1c;
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      padding: 20px;
      max-width: 800px;
    }

    #chat {
      height: 320px;
      overflow-y: auto;
      background: #0f0f0f;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
      border: 1px solid #2a2a2a;
    }

    .msg {
      margin-bottom: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      line-height: 1.4;
    }

    .user {
      background: #2a2a2a;
    }

    .bot {
      background: #3d2148;
    }

    .input-row {
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: none;
      outline: none;
      font-size: 16px;
    }

    button {
      padding: 12px 16px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    }

    .hero {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 14px;
    }

    .small {
      opacity: 0.75;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="left">
    <div class="brand">Velora</div>
    <div class="tab" onclick="showHome()">Home</div>
    <div class="tab" onclick="showAI()">AI Boo</div>
  </div>

  <div id="main">
    <div id="content"></div>
  </div>

  <div id="right">
    <h3>ADS</h3>
    <p class="small">Right sidebar reserved for ads, promos, or featured links.</p>
  </div>

  <script>
    function showHome() {
      document.getElementById("content").innerHTML = `
        <div class="panel">
          <h1>Welcome to Velora</h1>
          <p class="hero">Your live AI assistant layout is now working.</p>
          <p>Click <strong>AI Boo</strong> to open the chat.</p>
        </div>
      `;
    }

    function showAI() {
      document.getElementById("content").innerHTML = `
        <div class="panel">
          <h2>AI Boo</h2>
          <p class="small">Chat live with Velora.</p>
          <div id="chat">
            <div class="msg bot"><strong>Velora:</strong> Hi, I’m Velora. Talk to me.</div>
          </div>
          <div class="input-row">
            <input id="input" placeholder="Talk to Velora..." />
            <button onclick="sendMessage()">Send</button>
          </div>
        </div>
      `;
    }

    async function sendMessage() {
      const input = document.getElementById("input");
      const chat = document.getElementById("chat");

      if (!input || !chat) return;

      const message = input.value.trim();
      if (!message) return;

      chat.innerHTML += `<div class="msg user"><strong>You:</strong> ${escapeHtml(message)}</div>`;
      input.value = "";
      chat.scrollTop = chat.scrollHeight;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message })
        });

        const data = await response.json();

        chat.innerHTML += `<div class="msg bot"><strong>Velora:</strong> ${escapeHtml(data.reply || "No reply received.")}</div>`;
        chat.scrollTop = chat.scrollHeight;
      } catch (error) {
        chat.innerHTML += `<div class="msg bot"><strong>Velora:</strong> Error connecting to server.</div>`;
        chat.scrollTop = chat.scrollHeight;
      }
    }

    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    document.addEventListener("keydown", function (e) {
      const input = document.getElementById("input");
      if (e.key === "Enter" && input && document.activeElement === input) {
        sendMessage();
      }
    });

    showHome();
  </script>
</body>
</html>      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Velora, a warm, stylish, confident AI assistant. Keep responses helpful, clear, and conversational."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a reply.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      reply: "Server error talking to AI."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
      return res.status(response.status).json({
        error: "Voice request failed",
        details: errorText
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Voice generation failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});    const selectedVoice = typeof voice === "string" && voice.trim()
      ? voice.trim()
      : "alloy";

    const selectedModel = typeof model === "string" && model.trim()
      ? model.trim()
      : "gpt-4o-mini-tts";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        voice: selectedVoice,
        input: text,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);

      return res.status(response.status).json({
        error: "OpenAI voice request failed.",
        details: errorText
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    return res.send(audioBuffer);
  } catch (error) {
    console.error("Server voice error:", error);
    return res.status(500).json({
      error: "Voice generation failed."
    });
  }
});

// Optional: list a few voice presets for your frontend
app.get("/api/voices", (req, res) => {
  res.json({
    voices: [
      { id: "alloy", label: "Alloy" },
      { id: "ash", label: "Ash" },
      { id: "ballad", label: "Ballad" },
      { id: "coral", label: "Coral" },
      { id: "sage", label: "Sage" },
      { id: "verse", label: "Verse" }
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
