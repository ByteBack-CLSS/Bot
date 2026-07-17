(() => {
  const chatFeed = document.getElementById("chat-feed");
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");

  const ENDPOINT = "/get_response";

  // ---- Helpers ---------------------------------------------------------

  function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  function autoResizeInput() {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
  }

  function updateSendButtonState() {
    sendBtn.disabled = messageInput.value.trim().length === 0;
  }

  function createMessageElement({ role, text, isThinking = false }) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role === "user" ? "user-message" : "ai-message"}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${role === "user" ? "user-avatar" : "ai-avatar"}`;
    avatar.innerHTML =
      role === "user" ? "<i class='bx bx-user'></i>" : "<i class='bx bxs-shield-alt-2'></i>";

    const bubble = document.createElement("div");
    bubble.className = "bubble" + (isThinking ? " thinking" : "");

    if (isThinking) {
      bubble.innerHTML =
        "Thinking <span class='dot-flash'><span></span><span></span><span></span></span>";
    } else {
      bubble.textContent = text;
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function appendMessage(role, text) {
    const el = createMessageElement({ role, text });
    chatFeed.appendChild(el);
    scrollToBottom();
    return el;
  }

  function appendThinkingPlaceholder() {
    const el = createMessageElement({ role: "ai", isThinking: true });
    chatFeed.appendChild(el);
    scrollToBottom();
    return el;
  }

  // ---- Networking --------------------------------------------------------

  async function sendMessageToServer(message) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  }

  // ---- Event handlers -----------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Append user's message immediately
    appendMessage("user", message);

    // Reset input
    messageInput.value = "";
    autoResizeInput();
    updateSendButtonState();

    // Show temporary "Thinking..." placeholder
    const thinkingEl = appendThinkingPlaceholder();

    try {
      const reply = await sendMessageToServer(message);
      thinkingEl.remove();
      appendMessage("ai", reply);
    } catch (err) {
      thinkingEl.remove();
      appendMessage(
        "ai",
        "Something went wrong reaching the server. Please try again in a moment."
      );
      console.error("CyberGuard AI request failed:", err);
    }
  }

  messageInput.addEventListener("input", () => {
    autoResizeInput();
    updateSendButtonState();
  });

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sendBtn.disabled) {
        chatForm.requestSubmit();
      }
    }
  });

  chatForm.addEventListener("submit", handleSubmit);

  // Initial state
  updateSendButtonState();
})();
