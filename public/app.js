const PROFILE_KEY = "velora-profile";
const SESSION_KEY = "velora-session";
const HISTORY_KEY = "velora-history";
const AUTH_KEY = "velora-auth-user";
const AUTH_TOKEN_KEY = "velora-auth-token";
const MAX_HISTORY = 20;
const DEFAULT_API_BASE = "";

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-MX", label: "Spanish (Latin America)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "nl-NL", label: "Dutch" },
  { value: "pl-PL", label: "Polish" },
  { value: "ru-RU", label: "Russian" },
  { value: "tr-TR", label: "Turkish" },
  { value: "ar-SA", label: "Arabic" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "zh-HK", label: "Chinese (Hong Kong / Cantonese)" },
  { value: "th-TH", label: "Thai" },
  { value: "vi-VN", label: "Vietnamese" },
  { value: "id-ID", label: "Indonesian" },
  { value: "fil-PH", label: "Filipino" },
  { value: "sw-KE", label: "Swahili" }
];

const VOICE_PRESETS = {
  velvet: {
    label: "Velvet After Dark",
    rate: 0.94,
    pitchWoman: 0.98,
    pitchMan: 0.84,
    keywordsWoman: ["victoria", "zira", "ava", "female"],
    keywordsMan: ["fred", "george", "david", "male"]
  },
  smooth: {
    label: "Midnight Sway",
    rate: 0.91,
    pitchWoman: 0.96,
    pitchMan: 0.78,
    keywordsWoman: ["victoria", "ava", "female"],
    keywordsMan: ["david", "matthew", "george", "male"]
  },
  witty: {
    label: "Smoked Punchline",
    rate: 0.92,
    pitchWoman: 0.94,
    pitchMan: 0.74,
    keywordsWoman: ["victoria", "ava", "female"],
    keywordsMan: ["guy", "mark", "alex", "male"]
  },
  ruthless: {
    label: "Noir Dominion",
    rate: 0.88,
    pitchWoman: 0.92,
    pitchMan: 0.68,
    keywordsWoman: ["victoria", "susan", "female"],
    keywordsMan: ["fred", "george", "david", "male"]
  }
};

const defaultProfile = {
  ageGroup: "under18",
  style: "balanced",
  displayName: "",
  gender: "",
  userPronouns: "",
  assistantGender: "woman",
  assistantName: "",
  voiceMode: "auto",
  voicePreset: "velvet",
  browserVoiceName: "",
  language: "en-US",
  personalityNotes: "",
  seedWords: ""
};

const els = {
  navButtons: Array.from(document.querySelectorAll(".nav-btn")),
  modePanels: Array.from(document.querySelectorAll(".mode-panel")),

  installApp: document.getElementById("installApp"),
  accountBtn: document.getElementById("accountBtn"),
  settingsBtn: document.getElementById("settingsBtn"),

  status: document.getElementById("status"),
  modeLabel: document.getElementById("modeLabel"),
  chat: document.getElementById("chat"),
  mic: document.getElementById("mic"),
  stop: document.getElementById("stop"),

  accountSummaryTitle: document.getElementById("accountSummaryTitle"),
  accountSummaryMeta: document.getElementById("accountSummaryMeta"),
  profileSummaryTitle: document.getElementById("profileSummaryTitle"),
  profileSummaryMeta: document.getElementById("profileSummaryMeta"),

  authGate: document.getElementById("authGate"),
  authTabButtons: Array.from(document.querySelectorAll("[data-auth-tab]")),
  authPanels: Array.from(document.querySelectorAll("[data-auth-panel]")),
  registerName: document.getElementById("registerName"),
  registerDob: document.getElementById("registerDob"),
  registerEmail: document.getElementById("registerEmail"),
  registerPassword: document.getElementById("registerPassword"),
  registerStatus: document.getElementById("registerStatus"),
  registerAccount: document.getElementById("registerAccount"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  loginStatus: document.getElementById("loginStatus"),
  loginAccount: document.getElementById("loginAccount"),

  ageGate: document.getElementById("ageGate"),
  gateTabButtons: Array.from(document.querySelectorAll("[data-tab]")),
  gatePanels: Array.from(document.querySelectorAll("[data-tab-panel]")),
  under18Choice: document.getElementById("under18Choice"),
  adultChoice: document.getElementById("adultChoice"),
  adultStyles: document.getElementById("adultStyles"),
  styleCards: Array.from(document.querySelectorAll(".style-card")),

  displayName: document.getElementById("displayName"),
  genderSelect: document.getElementById("genderSelect"),
  userPronouns: document.getElementById("userPronouns"),
  assistantGenderSelect: document.getElementById("assistantGenderSelect"),
  assistantName: document.getElementById("assistantName"),
  voiceModeSelect: document.getElementById("voiceModeSelect"),
  browserVoiceSelect: document.getElementById("browserVoiceSelect"),
  languageSelect: document.getElementById("languageSelect"),
  voiceCards: Array.from(document.querySelectorAll(".voice-card")),
  previewVoice: document.getElementById("previewVoice"),
  voiceSupportNote: document.getElementById("voiceSupportNote"),
  personalityNotes: document.getElementById("personalityNotes"),
  seedWords: document.getElementById("seedWords"),
  saveProfile: document.getElementById("saveProfile"),

  startVideoMode: document.getElementById("startVideoMode"),
  requestUser: document.getElementById("requestUser"),
  acceptCall: document.getElementById("acceptCall"),
  localVideo: document.getElementById("localVideo"),
  remoteVideo: document.getElementById("remoteVideo"),

  discoverRoot: document.getElementById("mode-discover"),
  contestsRoot: document.getElementById("mode-contests")
};

let deferredPrompt = null;
let currentUser = loadJson(AUTH_KEY, null);
let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || "";
let profile = loadJson(PROFILE_KEY, null) || { ...defaultProfile };
let sessionId = sessionStorage.getItem(SESSION_KEY) || `session-${Math.random().toString(36).slice(2, 11)}`;
let history = loadJson(HISTORY_KEY, []);
let activeAuthTab = "register";
let activeGateTab = "identity";
let recognition = null;
let keepListening = false;
let currentUtterance = null;

let socket = null;
let mySocketId = "";
let localStream = null;
let peerConnection = null;
let currentTargetId = "";
let pendingCallerId = "";
let queuedOffer = null;

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

sessionStorage.setItem(SESSION_KEY, sessionId);

init();

function init() {
  setupModeSwitching();
  setupInstallPrompt();
  setupLanguageOptions();
  populateBrowserVoiceOptions();
  setupAuthEvents();
  setupProfileEvents();
  setupSpeechRecognition();
  setupMeetMode();
  setupDynamicPanels();
  renderHistory();
  updateAccountSummary();
  updateProfileSummary();
  updateModeLabel();

  if (!currentUser) {
    openAuthGate("register");
  }
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function apiUrl(path) {
  return `${DEFAULT_API_BASE}${path}`;
}

function authHeaders(extra = {}) {
  const headers = { ...extra };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

function setupModeSwitching() {
  els.navButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const mode = button.dataset.mode;
      els.navButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      els.modePanels.forEach((panel) => panel.classList.toggle("active", panel.id === `mode-${mode}`));

      if (mode === "discover") {
        await loadDiscoverCards();
      }
      if (mode === "contests") {
        await loadContestCards();
      }
    });
  });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    els.installApp?.classList.remove("hidden");
  });

  els.installApp?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    els.installApp.classList.add("hidden");
  });
}

function setupLanguageOptions() {
  if (!els.languageSelect) return;
  els.languageSelect.innerHTML = "";
  LANGUAGE_OPTIONS.forEach((option) => {
    const el = document.createElement("option");
    el.value = option.value;
    el.textContent = option.label;
    els.languageSelect.appendChild(el);
  });
  els.languageSelect.value = profile.language || "en-US";
}

function setupAuthEvents() {
  els.accountBtn?.addEventListener("click", () => openAuthGate("register"));

  els.authTabButtons.forEach((button) => {
    button.addEventListener("click", () => setAuthTab(button.dataset.authTab));
  });

  els.registerAccount?.addEventListener("click", registerUser);
  els.loginAccount?.addEventListener("click", loginUser);
}

function setupProfileEvents() {
  els.settingsBtn?.addEventListener("click", () => {
    if (!currentUser) {
      openAuthGate("register");
      return;
    }
    openVoiceGate();
  });

  els.under18Choice?.addEventListener("click", () => {
    syncProfileFromInputs();
    profile.ageGroup = "under18";
    applyProfileToInputs();
  });

  els.adultChoice?.addEventListener("click", () => {
    syncProfileFromInputs();
    profile.ageGroup = "adult";
    applyProfileToInputs();
  });

  els.styleCards.forEach((card) => {
    card.addEventListener("click", () => {
      syncProfileFromInputs();
      profile.ageGroup = "adult";
      profile.style = card.dataset.style;
      applyProfileToInputs();
    });
  });

  els.gateTabButtons.forEach((button) => {
    button.addEventListener("click", () => setGateTab(button.dataset.tab));
  });

  els.voiceCards.forEach((card) => {
    card.addEventListener("click", () => {
      profile.voicePreset = card.dataset.voicePreset;
      renderVoicePresetCards();
    });
  });

  els.voiceModeSelect?.addEventListener("change", () => {
    syncProfileFromInputs();
    updateVoiceSupportState();
  });

  els.browserVoiceSelect?.addEventListener("change", () => {
    syncProfileFromInputs();
    updateVoiceSupportState();
  });

  els.previewVoice?.addEventListener("click", previewVoiceLine);

  els.saveProfile?.addEventListener("click", () => {
    syncProfileFromInputs();
    saveJson(PROFILE_KEY, profile);
    updateProfileSummary();
    updateModeLabel();
    closeVoiceGate();
    setStatus("Voice mode saved. Tap the mic and speak.");
  });

  applyProfileToInputs();
}

function setupSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    setStatus("Speech input is not supported here. Use Chrome or Edge.");
    if (els.mic) els.mic.disabled = true;
    return;
  }

  recognition = new SR();
  recognition.lang = profile.language || "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    if (els.mic) els.mic.disabled = true;
    if (els.stop) els.stop.disabled = false;
    if (els.mic) els.mic.textContent = "Listening...";
    setStatus("Listening...");
  };

  recognition.onresult = (event) => {
    const result = event.results?.[0]?.[0]?.transcript?.trim();
    if (!result) return;
    addBubble("user", result);
    appendHistory("user", result);
    sendChat(result);
  };

  recognition.onend = () => {
    if (!keepListening) resetMicUi();
  };

  recognition.onerror = (event) => {
    addBubble("ai", `Mic error: ${event.error || "unknown error"}`);
    resetMicUi();
  };

  els.mic?.addEventListener("click", () => {
    if (!currentUser) {
      openAuthGate("register");
      setStatus("Sign in first.");
      return;
    }
    if (!profile) {
      openVoiceGate();
      return;
    }

    keepListening = true;
    try {
      recognition.lang = profile.language || "en-US";
      recognition.start();
    } catch {
      setStatus("Mic is already active.");
    }
  });

  els.stop?.addEventListener("click", () => {
    keepListening = false;
    if (recognition) recognition.stop();
    stopSpeaking();
    resetMicUi();
  });
}

function setupMeetMode() {
  if (typeof io !== "function") return;

  socket = io();

  socket.on("your-id", (id) => {
    mySocketId = id;
    if (els.requestUser) {
      els.requestUser.textContent = `Request User (${id.slice(0, 6)})`;
    }
  });

  socket.on("incoming-call", (fromId) => {
    pendingCallerId = fromId;
    alert(`Incoming request from ${fromId}`);
  });

  socket.on("signal", async ({ from, signal }) => {
    if (!signal) return;

    if (signal.type === "offer") {
      currentTargetId = from;
      queuedOffer = signal;
      alert(`Offer received from ${from}. Click Accept Request.`);
      return;
    }

    await ensurePeerConnection();

    if (signal.type === "answer") {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      return;
    }

    if (signal.candidate) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
      } catch (error) {
        console.error("ICE add failed", error);
      }
    }
  });

  els.startVideoMode?.addEventListener("click", async () => {
    try {
      await ensureLocalMedia();
      alert("Camera started.");
    } catch (error) {
      alert(`Could not start camera: ${error.message}`);
    }
  });

  els.requestUser?.addEventListener("click", async () => {
    const targetId = prompt("Enter the user ID to request:");
    if (!targetId) return;

    currentTargetId = targetId;
    await ensureLocalMedia();
    await ensurePeerConnection();

    socket.emit("request-call", targetId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("signal", {
      to: targetId,
      signal: offer
    });

    alert(`Request and offer sent to ${targetId}`);
  });

  els.acceptCall?.addEventListener("click", async () => {
    const callerId = pendingCallerId || prompt("Enter caller ID:");
    if (!callerId) {
      alert("No caller ID available.");
      return;
    }

    currentTargetId = callerId;
    await ensureLocalMedia();
    await ensurePeerConnection();

    socket.emit("accept-call", callerId);

    if (queuedOffer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(queuedOffer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("signal", {
        to: callerId,
        signal: answer
      });

      queuedOffer = null;
      pendingCallerId = "";
      alert(`Accepted ${callerId}`);
    } else {
      alert("No pending offer found yet.");
    }
  });
}

async function ensureLocalMedia() {
  if (localStream) return localStream;
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  if (els.localVideo) {
    els.localVideo.srcObject = localStream;
  }
  return localStream;
}

async function ensurePeerConnection() {
  if (peerConnection) return peerConnection;

  peerConnection = new RTCPeerConnection(rtcConfig);

  const stream = await ensureLocalMedia();
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  peerConnection.ontrack = (event) => {
    if (els.remoteVideo) {
      els.remoteVideo.srcObject = event.streams[0];
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (!event.candidate || !currentTargetId || !socket) return;

    socket.emit("signal", {
      to: currentTargetId,
      signal: event.candidate
    });
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("RTC state:", peerConnection.connectionState);
  };

  return peerConnection;
}

function setupDynamicPanels() {
  loadDiscoverCards();
  loadContestCards();
}

async function loadDiscoverCards() {
  if (!els.discoverRoot) return;

  try {
    const response = await fetch(apiUrl("/api/discover"));
    const json = await response.json();
    const cards = Array.isArray(json.cards) ? json.cards : [];

    const stage = els.discoverRoot.querySelector(".swipe-stage");
    if (!stage) return;

    stage.innerHTML = cards.map((card) => `
      <div class="swipe-card">
        <div class="swipe-photo">
          <span class="swipe-badge">${escapeHtml(card.tag || "Featured")}</span>
        </div>
        <div class="swipe-copy">
          <h4>${escapeHtml(card.handle || "@user")}</h4>
          <p>${escapeHtml(card.bio || "")}</p>
          <div class="discover-actions">
            <button class="ghost-btn discover-skip" type="button" data-id="${escapeHtml(card.id || "")}">Swipe Left</button>
            <button class="pill-btn discover-like" type="button" data-id="${escapeHtml(card.id || "")}">Swipe Right</button>
          </div>
        </div>
      </div>
    `).join("");

    stage.querySelectorAll(".discover-skip").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".swipe-card")?.remove();
      });
    });

    stage.querySelectorAll(".discover-like").forEach((btn) => {
      btn.addEventListener("click", () => {
        alert(`Liked ${btn.dataset.id}`);
        btn.closest(".swipe-card")?.remove();
      });
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadContestCards() {
  if (!els.contestsRoot) return;

  try {
    const response = await fetch(apiUrl("/api/contests"));
    const json = await response.json();
    const contests = Array.isArray(json.contests) ? json.contests : [];

    const grid = els.contestsRoot.querySelector(".contest-grid");
    if (!grid) return;

    grid.innerHTML = contests.map((contest) => `
      <div class="contest-card">
        <strong>${escapeHtml(contest.title || "Contest")}</strong>
        <span>${escapeHtml(contest.description || "")}</span>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
  }
}

async function registerUser() {
  const name = els.registerName?.value?.trim();
  const email = els.registerEmail?.value?.trim().toLowerCase();
  const password = els.registerPassword?.value?.trim();
  const dateOfBirth = els.registerDob?.value?.trim();

  if (!name || !email || !password) {
    if (els.registerStatus) els.registerStatus.textContent = "Name, email, and password are required.";
    return;
  }

  try {
    const response = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, dateOfBirth })
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Register failed");

    currentUser = json.user;
    authToken = json.token || "";
    saveJson(AUTH_KEY, currentUser);
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);

    if (!profile.displayName) {
      profile.displayName = name;
      saveJson(PROFILE_KEY, profile);
    }

    updateAccountSummary();
    updateProfileSummary();
    closeAuthGate();
    if (els.registerStatus) els.registerStatus.textContent = "Registered and signed in.";
  } catch (error) {
    if (els.registerStatus) els.registerStatus.textContent = error.message;
  }
}

async function loginUser() {
  const email = els.loginEmail?.value?.trim().toLowerCase();
  const password = els.loginPassword?.value?.trim();

  if (!email || !password) {
    if (els.loginStatus) els.loginStatus.textContent = "Email and password are required.";
    return;
  }

  try {
    const response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Login failed");

    currentUser = json.user;
    authToken = json.token || "";
    saveJson(AUTH_KEY, currentUser);
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);

    updateAccountSummary();
    updateProfileSummary();
    closeAuthGate();
    if (els.loginStatus) els.loginStatus.textContent = "Signed in.";
  } catch (error) {
    if (els.loginStatus) els.loginStatus.textContent = error.message;
  }
}

function setAuthTab(tabName) {
  activeAuthTab = tabName;
  els.authTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === tabName);
  });
  els.authPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.authPanel !== tabName);
  });
}

function openAuthGate(tabName = "register") {
  setAuthTab(tabName);
  els.authGate?.classList.remove("hidden");
}

function closeAuthGate() {
  els.authGate?.classList.add("hidden");
}

function setGateTab(tabName) {
  activeGateTab = tabName;
  els.gateTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  els.gatePanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.tabPanel !== tabName);
  });
}

function openVoiceGate() {
  applyProfileToInputs();
  setGateTab(activeGateTab);
  els.ageGate?.classList.remove("hidden");
}

function closeVoiceGate() {
  els.ageGate?.classList.add("hidden");
}

function updateAccountSummary() {
  if (!currentUser) {
    if (els.accountSummaryTitle) els.accountSummaryTitle.textContent = "Sign in to personalize Velora.";
    if (els.accountSummaryMeta) els.accountSummaryMeta.textContent = "Register or log in so each user can have a verified account, their own favorites, and a unique AI setup.";
    return;
  }

  if (els.accountSummaryTitle) {
    els.accountSummaryTitle.textContent = `Signed in as ${currentUser.name || currentUser.email}.`;
  }
  if (els.accountSummaryMeta) {
    els.accountSummaryMeta.textContent = "Your account is active. Open Voice Mode to tune Velora exactly how you want it.";
  }
}

function updateProfileSummary() {
  if (!profile) return;
  const assistantName = profile.assistantName || "Velora";
  const voiceLabel = VOICE_PRESETS[profile.voicePreset]?.label || "Velvet After Dark";
  const languageLabel = LANGUAGE_OPTIONS.find((opt) => opt.value === profile.language)?.label || "English (US)";
  const modeText = profile.ageGroup === "under18" ? "Under 18 mode" : `18+ ${profile.style} mode`;

  if (els.profileSummaryTitle) {
    els.profileSummaryTitle.textContent = `Assistant: ${assistantName} (${profile.assistantGender})`;
  }

  if (els.profileSummaryMeta) {
    els.profileSummaryMeta.textContent =
      `${modeText}. Voice: ${voiceLabel}. Language: ${languageLabel}. ` +
      `${profile.displayName ? `Velora will address ${profile.displayName} by name.` : "Add your name if you want a more personal assistant vibe."}`;
  }
}

function updateModeLabel() {
  if (!els.modeLabel) return;
  if (!profile) {
    els.modeLabel.textContent = "Set your voice mode first.";
    return;
  }

  if (profile.ageGroup === "under18") {
    els.modeLabel.textContent = "Youth-safe mode is on.";
    return;
  }

  const labels = {
    balanced: "18+ mode: balanced personality.",
    playful: "18+ mode: playful personality.",
    luxe: "18+ mode: luxe personality.",
    savage: "18+ mode: savage personality."
  };

  els.modeLabel.textContent = labels[profile.style] || labels.balanced;
}

function applyProfileToInputs() {
  if (!profile) profile = { ...defaultProfile };

  if (els.displayName) els.displayName.value = profile.displayName || "";
  if (els.genderSelect) els.genderSelect.value = profile.gender || "";
  if (els.userPronouns) els.userPronouns.value = profile.userPronouns || "";
  if (els.assistantGenderSelect) els.assistantGenderSelect.value = profile.assistantGender || "woman";
  if (els.assistantName) els.assistantName.value = profile.assistantName || "";
  if (els.voiceModeSelect) els.voiceModeSelect.value = profile.voiceMode || "auto";
  if (els.browserVoiceSelect) els.browserVoiceSelect.value = profile.browserVoiceName || "";
  if (els.languageSelect) els.languageSelect.value = profile.language || "en-US";
  if (els.personalityNotes) els.personalityNotes.value = profile.personalityNotes || "";
  if (els.seedWords) els.seedWords.value = profile.seedWords || "";

  els.under18Choice?.classList.toggle("selected", profile.ageGroup === "under18");
  els.adultChoice?.classList.toggle("selected", profile.ageGroup === "adult");
  els.adultStyles?.classList.toggle("hidden", profile.ageGroup !== "adult");

  els.styleCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.style === profile.style);
  });

  renderVoicePresetCards();
  updateVoiceSupportState();
}

function syncProfileFromInputs() {
  profile.displayName = els.displayName?.value?.trim() || "";
  profile.gender = els.genderSelect?.value || "";
  profile.userPronouns = els.userPronouns?.value?.trim() || "";
  profile.assistantGender = els.assistantGenderSelect?.value || "woman";
  profile.assistantName = els.assistantName?.value?.trim() || "";
  profile.voiceMode = els.voiceModeSelect?.value || "auto";
  profile.browserVoiceName = els.browserVoiceSelect?.value || "";
  profile.language = els.languageSelect?.value || "en-US";
  profile.personalityNotes = els.personalityNotes?.value?.trim() || "";
  profile.seedWords = els.seedWords?.value?.trim() || "";
}

function renderVoicePresetCards() {
  els.voiceCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.voicePreset === profile.voicePreset);
  });
}

function populateBrowserVoiceOptions() {
  if (!("speechSynthesis" in window) || !els.browserVoiceSelect) return;

  const voices = speechSynthesis.getVoices().filter(Boolean);
  els.browserVoiceSelect.innerHTML = "";

  const autoOption = document.createElement("option");
  autoOption.value = "";
  autoOption.textContent = voices.length ? "Automatic device voice" : "Device voices unavailable";
  els.browserVoiceSelect.appendChild(autoOption);

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    els.browserVoiceSelect.appendChild(option);
  });

  els.browserVoiceSelect.value = profile.browserVoiceName || "";
}

if ("speechSynthesis" in window && typeof speechSynthesis.addEventListener === "function") {
  speechSynthesis.addEventListener("voiceschanged", populateBrowserVoiceOptions);
}

function updateVoiceSupportState() {
  if (!els.voiceSupportNote) return;
  if (!("speechSynthesis" in window)) {
    els.voiceSupportNote.textContent = "Voice preview is not available in this browser.";
    return;
  }
  if (profile.voiceMode === "device") {
    els.voiceSupportNote.textContent = "Device voice mode is on. Spoken replies will lean on your browser or phone voice.";
  } else {
    els.voiceSupportNote.textContent = "Smart auto mode is on. Velora can use browser voice locally and server voice layers later.";
  }
}

async function previewVoiceLine() {
  stopSpeaking();
  syncProfileFromInputs();

  const line = buildPreviewLine();
  const utterance = new SpeechSynthesisUtterance(line);
  applySpeechProfile(utterance);
  currentUtterance = utterance;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function buildPreviewLine() {
  const assistantName = profile.assistantName || "Velora";
  const personName = profile.displayName || "friend";
  const locale = profile.language || "en-US";

  const lines = {
    "en-US": `Hey ${personName}, I'm ${assistantName}. I'm ready when you are.`,
    "en-GB": `Hello ${personName}, I'm ${assistantName}. I'm ready when you are.`,
    "es-ES": `Hola ${personName}, soy ${assistantName}. Estoy lista para hablar contigo.`,
    "es-MX": `Hola ${personName}, soy ${assistantName}. Ya estoy lista para platicar contigo.`,
    "pt-BR": `Oi ${personName}, eu sou ${assistantName}. Estou pronta para conversar com voce.`,
    "fr-FR": `Salut ${personName}, moi c'est ${assistantName}. Je suis prete a parler avec toi.`,
    "de-DE": `Hallo ${personName}, ich bin ${assistantName}. Ich bin bereit fur unser Gesprach.`,
    "hi-IN": `Namaste ${personName}, main ${assistantName} hoon. Main taiyar hoon.`,
    "ja-JP": `こんにちは ${personName}、${assistantName} です。いつでも話せます。`,
    "ko-KR": `안녕하세요 ${personName}, 저는 ${assistantName}입니다. 언제든지 이야기할 수 있어요.`,
    "zh-CN": `${personName} 你好，我是 ${assistantName}。我已经准备好和你聊天了。`
  };

  return lines[locale] || lines["en-US"];
}

function applySpeechProfile(utterance) {
  utterance.lang = profile.language || "en-US";

  const preset = VOICE_PRESETS[profile.voicePreset] || VOICE_PRESETS.velvet;
  const assistantGender = profile.assistantGender || "woman";
  utterance.rate = preset.rate;
  utterance.pitch = assistantGender === "man" ? preset.pitchMan : preset.pitchWoman;

  const voices = "speechSynthesis" in window ? speechSynthesis.getVoices() : [];
  const explicitVoice = profile.browserVoiceName
    ? voices.find((voice) => voice.name === profile.browserVoiceName)
    : null;

  const keywords = assistantGender === "man" ? preset.keywordsMan : preset.keywordsWoman;
  const matchedVoice = voices.find((voice) => {
    const hay = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return keywords.some((keyword) => hay.includes(keyword));
  });

  utterance.voice = explicitVoice || matchedVoice || null;
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}

function setStatus(text) {
  if (els.status) els.status.textContent = text;
}

function resetMicUi() {
  if (els.mic) {
    els.mic.disabled = false;
    els.mic.textContent = "Start Talking";
  }
  if (els.stop) {
    els.stop.disabled = true;
  }
  setStatus("Tap the mic and speak.");
}

function addBubble(role, text) {
  if (!els.chat) return;
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  els.chat.appendChild(bubble);
  els.chat.scrollTop = els.chat.scrollHeight;
}

function appendHistory(role, content) {
  history.push({ role, content });
  history = history.slice(-MAX_HISTORY);
  saveJson(HISTORY_KEY, history);
}

function renderHistory() {
  if (!els.chat) return;
  els.chat.innerHTML = "";
  history.forEach((item) => addBubble(item.role === "assistant" ? "ai" : "user", item.content));
}

async function sendChat(message) {
  setStatus("Thinking...");

  try {
    const response = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message,
        sessionId,
        profile,
        history
      })
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || "Request failed");
    }

    const reply = json.reply || "Sorry, I missed that.";
    addBubble("ai", reply);
    appendHistory("assistant", reply);
    setStatus("Speaking...");
    await speakReply(reply);
  } catch (error) {
    addBubble("ai", `Network error: ${error.message}`);
    setStatus("Could not reach the server.");
  } finally {
    if (!keepListening) {
      resetMicUi();
    }
  }
}

async function speakReply(reply) {
  if (!("speechSynthesis" in window)) {
    setStatus("Reply received.");
    return;
  }

  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(reply);
  applySpeechProfile(utterance);
  currentUtterance = utterance;

  await new Promise((resolve) => {
    utterance.onend = resolve;
    utterance.onerror = resolve;
    speechSynthesis.speak(utterance);
  });

  setStatus("Reply received.");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
        signal: event.candidate
      });
    }
  };
};

document.getElementById("requestUser").onclick = async () => {
  targetUser = prompt("Enter user ID:");
  if (!targetUser) return;

  socket.emit("request-call", targetUser);

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("signal", {
    to: targetUser,
    signal: offer
  });
};

socket.on("incoming-call", (callerId) => {
  targetUser = callerId;
  alert("Incoming call from " + callerId);
});

document.getElementById("acceptCall").onclick = async () => {
  if (!peer) return;

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("signal", {
    to: targetUser,
    signal: answer
  });
};

socket.on("signal", async (data) => {
  if (!peer) return;

  if (data.signal.type === "offer") {
    await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
  } else if (data.signal.type === "answer") {
    await peer.setRemoteDescription(new RTCSessionDescription(data.signal));
  } else {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(data.signal));
    } catch (e) {}
  }
});