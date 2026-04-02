const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        reply: "Missing OPENAI_API_KEY in .env"
      });
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
