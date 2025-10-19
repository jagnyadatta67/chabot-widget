(function () {
  const scriptTag =
    document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();

  // --- Config ---
  const config = {
    backend:
      scriptTag?.getAttribute("data-backend") ||
      window.CHATBOT_CONFIG?.backend ||
      "http://localhost:8080/api",
    userid:
      scriptTag?.getAttribute("data-userid") ||
      window.CHATBOT_CONFIG?.userid ||
      "UNKNOWN_USER",
    concept:
      (scriptTag?.getAttribute("data-concept") ||
        window.CHATBOT_CONFIG?.concept ||
        "LIFESTYLE").toUpperCase(),
    env:
      scriptTag?.getAttribute("data-env") ||
      window.CHATBOT_CONFIG?.env ||
      "uat5",
  };

  // --- Brand Themes ---
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      gradient: "linear-gradient(135deg, #F89F17, #FFCE6B)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
    },
    MAX: {
      primary: "#303AB2",
      gradient: "linear-gradient(135deg, #303AB2, #6573FF)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
    },
    BABYSHOP: {
      primary: "#819F83",
      gradient: "linear-gradient(135deg, #7FA37F, #A5D0A5)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
    },
    HOMECENTRE: {
      primary: "#7665A0",
      gradient: "linear-gradient(135deg, #7665A0, #A292CC)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
    },
  };
  const theme = BRAND_THEMES[config.concept] || BRAND_THEMES.LIFESTYLE;

  console.log("💎 Chatbot Config:", config);

  // --- Chat Initialization ---
  function initChatWidget() {
    const chatWindow = createChatWindow();
    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");

    const clearBody = () => (chatBody.innerHTML = "");

    const renderBotMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bot-bubble";
      bubble.style.cssText = `
        background:#f3f4f6;
        border-radius:16px;
        padding:10px 14px;
        margin:6px 0;
        max-width:88%;
        font-size:14px;
        line-height:1.4;
        color:#333;
        box-shadow:0 2px 4px rgba(0,0,0,0.05);
        animation: fadeIn 0.3s ease-in-out;
      `;
      bubble.innerHTML = msg.replace(/\n/g, "<br/>");
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "user-bubble";
      bubble.style.cssText = `
        background:${theme.gradient};
        color:white;
        border-radius:16px;
        padding:10px 14px;
        margin:6px 0;
        align-self:flex-end;
        max-width:88%;
        box-shadow:0 2px 8px rgba(0,0,0,0.1);
        font-size:14px;
        animation: fadeInRight 0.3s ease-in-out;
      `;
      bubble.innerHTML = msg;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    const renderBackToMenu = () => {
      const existing = document.getElementById("back-to-menu-btn");
      if (existing) existing.remove();
      const backBtn = document.createElement("button");
      backBtn.id = "back-to-menu-btn";
      backBtn.textContent = "⬅ Back to Main Menu";
      Object.assign(backBtn.style, {
        width: "90%",
        margin: "10px auto",
        display: "block",
        padding: "12px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: "#fff",
        color: theme.primary,
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });
      backBtn.onmouseenter = () => (backBtn.style.background = `${theme.primary}10`);
      backBtn.onmouseleave = () => (backBtn.style.background = "#fff");
      backBtn.onclick = () => showGreeting();
      const footer = chatWindow.querySelector("#chat-footer");
      footer.parentNode.insertBefore(backBtn, footer);
    };

    // --- Fetchers ---
    async function fetchMenus() {
      const res = await fetch(`${config.backend}/menus`);
      return res.json();
    }
    async function fetchSubMenus(menuId) {
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
      return res.json();
    }

    // --- Intent Handlers ---
    const INTENT_HANDLERS = {
      POLICY_QUESTION: handleGeneralIntent,
      GENERAL_QUERY: handleGeneralIntent,
      ORDER_TRACKING: handleOrderTracking,
      CUSTOMER_PROFILE: handleCustomerProfile,
      DEFAULT: handleDefaultIntent,
    };

    function handleGeneralIntent(payload) {
      renderBotMessage(payload.chat_message || "No information found.");
      renderBackToMenu();
    }

    function handleDefaultIntent(payload) {
      renderBotMessage(payload.chat_message || payload.data || "No response available.");
      renderBackToMenu();
    }

    // --- Login Handling ---
    function checkAndTriggerLogin(payload, defaultMsg = "Please login to continue.") {
      const cht = payload?.data?.chat_message || payload?.chat_message || "";
      const normalizedMsg = cht.trim().toLowerCase();
      const isLoginPrompt =
        normalizedMsg.includes("login") ||
        normalizedMsg.includes("sign in") ||
        normalizedMsg.includes("signin") ||
        normalizedMsg.includes("anonymous user");
      if (isLoginPrompt) {
        renderBotMessage(`
          ${cht || defaultMsg}
          <br><br>
          <a href="#" id="chat-login-link" style="color:${theme.primary};font-weight:600;cursor:pointer;">
            🔐 Click here to Login
          </a>
        `);
        setTimeout(() => {
          const link = document.getElementById("chat-login-link");
          if (link)
            link.addEventListener("click", (e) => {
              e.preventDefault();
              const signupBtn = document.getElementById("account-actions-signup");
              if (signupBtn) signupBtn.click();
            });
        }, 300);
        renderBackToMenu();
        return true;
      }
      return false;
    }

    // --- Greeting + Menu ---
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      renderBotMessage(
        `👋 <b>Hi there!</b><br>Welcome to <b>${config.concept}</b> Chat Service 💬<br><br>I'm here to help you with:`
      );
      renderBotMessage(
        `🛍️ Order tracking & updates<br>📦 Returns & exchanges<br>👤 Profile info<br>🏬 Store locator<br>💡 Product & policy queries`
      );
      const menus = await fetchMenus();
      menus.forEach((menu) => renderMenuButton(menu));
      renderBackToMenu();
    }

    const renderMenuButton = (menu) => {
      const btn = document.createElement("button");
      btn.textContent = `✨ ${menu.title}`;
      Object.assign(btn.style, {
        width: "100%",
        margin: "8px 0",
        padding: "12px",
        border: "none",
        borderRadius: "10px",
        background: `${theme.gradient}`,
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease",
      });
      btn.onmouseenter = () => (btn.style.transform = "scale(1.03)");
      btn.onmouseleave = () => (btn.style.transform = "scale(1)");
      btn.onclick = () => showSubMenus(menu);
      chatBody.appendChild(btn);
    };

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      renderBotMessage(`Fetching options for <b>${menu.title}</b>...`);
      const subs = await fetchSubMenus(menu.id);
      if (!subs?.length) {
        renderBotMessage("No sub-options found.");
        renderBackToMenu();
        return;
      }
      subs.forEach((sub) => renderSubmenuButton(sub));
      renderBackToMenu();
    }

    const renderSubmenuButton = (sub) => {
      const btn = document.createElement("button");
      btn.textContent = sub.title;
      Object.assign(btn.style, {
        width: "100%",
        margin: "6px 0",
        padding: "10px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: sub.type === "dynamic" ? "#f9f9ff" : "#fff",
        color: theme.primary,
        fontWeight: "500",
        cursor: "pointer",
        transition: "background 0.2s ease",
      });
      btn.onmouseenter = () => (btn.style.background = `${theme.primary}10`);
      btn.onmouseleave = () => (btn.style.background = sub.type === "dynamic" ? "#f9f9ff" : "#fff");
      btn.onclick = () => handleSubmenu(sub);
      chatBody.appendChild(btn);
    };

    async function handleSubmenu(sub) {
      clearBody();
      renderUserMessage(sub.title);
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b> ⌨️`);
      inputContainer.style.display = "flex";
      sendButton.onclick = () => {
        const msg = inputField.value.trim();
        if (!msg) return;
        renderUserMessage(msg);
        sendMessage(sub.type, msg);
        inputField.value = "";
      };
      renderBackToMenu();
    }

    async function sendMessage(type, userMessage) {
      const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            question: userMessage,
            userId: config.userid,
            concept: config.concept,
            env: config.env,
          }),
        });
        const json = await res.json();
        const intent = json.intent || json.data?.intent || "DEFAULT";
        const payload =
          typeof json.data === "string" ? { chat_message: json.data } : json.data || json;
        const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS.DEFAULT;
        handler(payload);
      } catch {
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }

    // --- Floating Button ---
    createFloatingButton(chatWindow, showGreeting);
  }

  // --- Floating Button ---
  function createFloatingButton(chatWindow, showGreeting) {
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = `
      <div style="position:relative;width:100%;height:100%;">
        <div style="background:${theme.gradient};border-radius:50%;width:70px;height:70px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.3);animation:bounce 3s infinite;">
          💬
        </div>
      </div>`;
    Object.assign(button.style, {
      position: "fixed",
      bottom: "25px",
      right: "25px",
      zIndex: "9999",
      cursor: "pointer",
    });

    const repositionButton = () => {
      const vw = window.innerWidth;
      if (vw <= 480) {
        button.style.right = "calc(50% - 35px)";
        button.style.bottom = "20px";
      } else {
        button.style.right = "25px";
        button.style.bottom = "25px";
      }
    };
    repositionButton();
    window.addEventListener("resize", repositionButton);

    button.onclick = () => {
      const visible = chatWindow.style.display === "flex";
      chatWindow.style.display = visible ? "none" : "flex";
      if (!visible) {
        showGreeting();
        if (window.innerWidth <= 480) document.body.style.overflow = "hidden";
      } else document.body.style.overflow = "";
    };
    document.body.appendChild(button);
  }

  // --- Chat Window ---
  function createChatWindow() {
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 25px;
      width: 360px;
      height: 560px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease-in-out;
      z-index: 99999;
    `;
    const logoFilter =
      ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept) ? "filter:invert(1);" : "";

    chatWindow.innerHTML = `
      <div style="background:${theme.gradient};color:white;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;">
        <span style="display:flex;align-items:center;gap:8px;">
          <img src="${theme.logo}" style="height:22px;${logoFilter}" alt="${config.concept}">
          <span>Chat with us 💬</span>
        </span>
        <span id="close-chat" style="cursor:pointer;font-size:18px;">✖</span>
      </div>
      <div id="chat-body" style="flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;"></div>
      <div id="chat-input-container" style="display:none;border-top:1px solid #eee;display:flex;">
        <input id="chat-input" placeholder="Type your message..." style="flex:1;padding:10px;border:none;outline:none;">
        <button id="chat-send" style="background:${theme.gradient};color:white;border:none;padding:10px 16px;cursor:pointer;font-weight:600;">Send</button>
      </div>
      <div id="chat-footer" style="text-align:center;font-size:12px;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        ❤️ Powered by <b>${config.concept}</b>
      </div>
    `;
    document.body.appendChild(chatWindow);

    // Responsiveness
    function adjustChat() {
      const vw = window.innerWidth;
      if (vw <= 480) {
        Object.assign(chatWindow.style, {
          width: "100%",
          height: "100%",
          right: "0",
          bottom: "0",
          borderRadius: "0",
        });
      } else if (vw <= 768) {
        Object.assign(chatWindow.style, {
          width: "80%",
          height: "75%",
          right: "10%",
          bottom: "10%",
          borderRadius: "16px",
        });
      } else {
        Object.assign(chatWindow.style, {
          width: "360px",
          height: "560px",
          right: "25px",
          bottom: "90px",
          borderRadius: "20px",
        });
      }
    }
    window.addEventListener("resize", adjustChat);
    adjustChat();

    chatWindow.querySelector("#close-chat").onclick = () => {
      chatWindow.style.display = "none";
      document.body.style.overflow = "";
    };

    return chatWindow;
  }

  // --- Animations ---
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {from {opacity:0;} to {opacity:1;}}
    @keyframes fadeInRight {from {opacity:0;transform:translateX(20px);} to {opacity:1;transform:translateX(0);}}
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
      40% {transform: translateY(-8px);}
      60% {transform: translateY(-4px);}
    }
  `;
  document.head.appendChild(style);

  // --- Init ---
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
