const socket = io();
const statusText = document.getElementById("statusText");
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");
const discoverGrid = document.getElementById("discoverGrid");
const roomsGrid = document.getElementById("roomsGrid");
const chatMessages = document.getElementById("chatMessages");

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active-section");
  });

  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.section === sectionId) {
      btn.classList.add("active");
    }
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add("active-section");
  }
}

window.showSection = showSection;

navButtons.forEach((btn) => {
  if (btn.dataset.section) {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  }
});

async function loadDiscover() {
  try {
    const res = await fetch("/api/discover");
    const data = await res.json();

    if (!data.ok) throw new Error("Failed to load data.");

    discoverGrid.innerHTML = "";
    roomsGrid.innerHTML = "";

    data.cards.forEach((card) => {
      const el = document.createElement("div");
      el.className = "discover-card";
      el.innerHTML = `
        <h4>${card.title}</h4>
        <p>${card.text}</p>
        <small>${card.type}</small>
      `;
      discoverGrid.appendChild(el);
    });

    data.rooms.forEach((room) => {
      const el = document.createElement("div");
      el.className = "room-card";
      el.innerHTML = `
        <h4>${room.name}</h4>
        <p>${room.vibe}</p>
        <button class="mini-btn" onclick="joinRoom('${room.id}')">Join Room</button>
      `;
      roomsGrid.appendChild(el);
    });

    statusText.textContent = "Experience loaded.";
  } catch (err) {
    statusText.textContent = "Could not load discover data.";
  }
}

function appendMessage(name, text) {
  const line = document.createElement("div");
  line.className = "chat-line";
  line.innerHTML = `<span class="chat-name">${name}</span><span>${text}</span>`;
  chatMessages.appendChild(line);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.sendChat = async function sendChat() {
  const nameInput = document.getElementById("chatName");
  const input = document.getElementById("chatInput");
  const name = nameInput.value.trim() || "Guest";
  const text = input.value.trim();

  if (!text) return;

  try {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text })
    });
    input.value = "";
  } catch (err) {
    appendMessage("System", "Message failed.");
  }
};

window.joinRoom = function joinRoom(room) {
  const name = document.getElementById("chatName")?.value?.trim() || "Guest";
  socket.emit("join room", { room, name });
  appendMessage("System", `Joined ${room}`);
  showSection("chat");
};

socket.on("chat message", (msg) => {
  appendMessage(msg.name || "Guest", msg.text || "");
});

socket.on("system message", (msg) => {
  appendMessage("System", msg.text || "");
});

loadDiscover();
appendMessage("Velora", "Welcome to Velora Live.");
