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

  console.log("💎 Chatbot Config:", config);

  // --- Brand Themes ---
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      gradient: "linear-gradient(135deg, #F89F17, #ffb84d)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
    },
    MAX: {
      primary: "#303AB2",
      gradient: "linear-gradient(135deg, #303AB2, #4A55E2)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
    },
    BABYSHOP: {
      primary: "#819F83",
      gradient: "linear-gradient(135deg, #819F83, #9FC19F)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
    },
    HOMECENTRE: {
      primary: "#7665A0",
      gradient: "linear-gradient(135deg, #7665A0, #9988C4)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
    },
  };

  const theme = BRAND_THEMES[config.concept] || BRAND_THEMES.LIFESTYLE;

  function initChatWidget() {
    let lastBotResponse = "";
    let lastIntent = "";

    // --- Floating Button ---
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = `
      <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="background:white;border:3px solid ${theme.primary};border-radius:50%;width:65px;height:65px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <img src="${theme.logo}" alt="${config.concept} logo" style="width:58px;height:auto;object-fit:contain;">
        </div>
        <div style="position:absolute;bottom:-4px;right:-4px;background:${theme.primary};color:white;border-radius:50%;padding:5px;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">💬</div>
      </div>
    `;
    Object.assign(button.style, {
      position: "fixed",
      bottom: "25px",
      right: "25px",
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: "9999",
      transition: "transform 0.2s ease-in-out",
      background: "transparent",
    });
    button.onmouseenter = () => (button.style.transform = "scale(1.08)");
    button.onmouseleave = () => (button.style.transform = "scale(1)");
    document.body.appendChild(button);

    // --- Chat Window ---
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 25px;
      width: 360px;
      height: 540px;
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', Arial, sans-serif;
      z-index: 9999;
      transition: all 0.3s ease-in-out;
      border: 2px solid ${theme.primary};
    `;

    chatWindow.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bubble {
          animation: fadeIn 0.25s ease;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 8px 12px;
          margin: 6px 0;
          display: inline-block;
          max-width: 88%;
          line-height: 1.5;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .user-bubble {
          background: ${theme.gradient};
          color: white;
          align-self: flex-end;
        }
        .bot-bubble {
          background: #f9fafb;
          color: #111;
        }
        #chat-body::-webkit-scrollbar {
          width: 6px;
        }
        #chat-body::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
      </style>

      <div style="background:${theme.gradient};color:#fff;padding:12px 16px;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:space-between;">
        <span><img src="${theme.logo}" alt="${config.concept} logo" style="height:20px;margin-right:6px;vertical-align:middle;"> Chat Service</span>
        <span style="font-size:18px;cursor:pointer;" id="close-chat">✖</span>
      </div>

      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;"></div>

      <div id="chat-input-container" style="display:none;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0;display:flex;">
        <input id="chat-input" style="flex:1;padding:10px;border:none;font-size:14px;border-radius:0 0 0 12px;outline:none;" placeholder="Type your message..." />
        <button id="chat-send" style="background:${theme.gradient};color:#fff;border:none;padding:10px 16px;border-radius:0 0 12px 0;cursor:pointer;">Send</button>
      </div>

      <div style="text-align:center;padding:8px;background:#f9fafb;font-size:12px;border-top:1px solid #eee;">
        Powered by <img src="${theme.logo}" alt="${config.concept} logo" style="height:20px;margin-left:4px;vertical-align:middle;">
      </div>
    `;
    document.body.appendChild(chatWindow);

    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");
    const closeBtn = chatWindow.querySelector("#close-chat");

    closeBtn.onclick = () => (chatWindow.style.display = "none");

    // --- Helpers ---
    const clearBody = () => (chatBody.innerHTML = "");
    const renderBotMessage = (msg) => {
      msg = msg.replace(/### (.*$)/gim, "<b>$1</b>").replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>").replace(/\n/g, "<br/>");
      const bubble = document.createElement("div");
      bubble.className = "bubble bot-bubble";
      bubble.innerHTML = `<b>Bot:</b> ${msg}`;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
      lastBotResponse = msg;
    };
    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble user-bubble";
      bubble.innerHTML = `<b>You:</b> ${msg}`;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    // --- API Calls ---
    async function fetchMenus() {
      const url = `${config.backend}/menus`;
      console.log("📡 Fetching menus from:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("✅ Menus Response:", data);
      return data;
    }

    async function fetchSubMenus(menuId) {
      const url = `${config.backend}/menus/${menuId}/submenus`;
      console.log("📡 Fetching submenus from:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("✅ Submenus Response:", data);
      return data;
    }

    async function sendMessage(type, userMessage) {
      const endpoint = type === "static" ? "/chat/ask" : "/chat";
      const url = `${config.backend}${endpoint}`;
      console.log("💬 Sending chat to:", url);

      try {
        const bodyPayload =
          type === "static"
            ? { question: userMessage, concept: config.concept, env: config.env }
            : {
                message: userMessage,
                question: userMessage,
                userId: config.userid,
                concept: config.concept,
                env: config.env,
                ...(lastIntent === "ORDER_TRACKING" && { previousResponse: lastBotResponse }),
              };

        console.log("📦 Chat Payload:", bodyPayload);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });

        const json = await res.json();
        console.log("✅ Chat Response:", json);
        clearBody();

        const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
        lastIntent = intent;
        const payload = json.data || json;

        if (intent === "POLICY_QUESTION" || intent === "GENERAL_QUERY") {
          renderBotMessage(payload.chat_message || payload.data || payload || "No info found.");
        } else if (intent === "ORDER_TRACKING") {
          renderBotMessage("<b>🧾 Customer Details:</b>");
          chatBody.innerHTML += `
            <div class="bubble bot-bubble" style="background:#F9FAFB;">
              <b>Name:</b> ${payload.customerName || "N/A"}<br/>
              <b>Mobile:</b> ${payload.mobileNo || "N/A"}
            </div>`;
          if (Array.isArray(payload.orderDetailsList) && payload.orderDetailsList.length) {
            renderBotMessage("<b>📦 Order Summary:</b>");
            payload.orderDetailsList.forEach((o) => {
              chatBody.innerHTML += `
                <div class="bubble bot-bubble" style="background:#FFFFFF;border:1px solid ${theme.primary};border-radius:12px;padding:10px;margin:8px 0;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <img src="${o.productURL || o.imageURL || ''}" alt="${o.productName}" style="width:70px;height:70px;border-radius:8px;object-fit:cover;border:1px solid #E5E7EB;">
                    <div style="flex:1;">
                      <div style="font-weight:600;color:#111827;font-size:14px;">${o.productName || 'N/A'}</div>
                      <div style="color:#6B7280;font-size:13px;">${o.color ? `Color: ${o.color}` : ''} ${o.size ? `| Size: ${o.size}` : ''}</div>
                      <div style="color:#6B7280;font-size:13px;">Qty: ${o.qty || 1}</div>
                      <div style="font-weight:500;color:#111827;">₹${o.netAmount || o.orderAmount}</div>
                    </div>
                  </div>
                  <hr style="border:none;border-top:1px dashed #E5E7EB;margin:8px 0;">
                  <div style="font-size:13px;color:#374151;">
                    <b>Order No:</b> ${o.orderNo}<br/>
                    <b>Status:</b> ${o.orderStatus}<br/>
                    <b>Date:</b> ${o.orderDate}<br/>
                    <b>Total Products:</b> ${o.totalProducts}
                  </div>
                </div>`;
            });
          } else renderBotMessage("No order details found.");
        } else renderBotMessage("Sorry, I didn’t quite understand that.");
      } catch (err) {
        console.error("❌ Chat API Error:", err);
        renderBotMessage("⚠️ Something went wrong.");
      }
    }

    // --- Greeting & Flow ---
    async function showGreeting() {
      clearBody();
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept} Chat Service</b>`);
      renderBotMessage("Please choose one of the following options:");

      const menus = await fetchMenus();
      menus.forEach((menu) => {
        const btn = document.createElement("button");
        btn.textContent = menu.title;
        Object.assign(btn.style, {
          margin: "6px 0",
          padding: "10px 12px",
          border: `1px solid ${theme.primary}`,
          borderRadius: "10px",
          background: "white",
          color: theme.primary,
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          fontSize: "14px",
          transition: "0.2s",
        });
        btn.onmouseenter = () => (btn.style.background = "#F3F4F6");
        btn.onmouseleave = () => (btn.style.background = "white");
        btn.onclick = () => showSubMenus(menu);
        chatBody.appendChild(btn);
      });
      inputContainer.style.display = "none";
    }

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      renderBotMessage(`Fetching options for <b>${menu.title}</b>...`);
      try {
        const submenus = await fetchSubMenus(menu.id);
        if (!submenus || !submenus.length) {
          renderBotMessage("No sub-options found for this menu.");
          return;
        }
        renderBotMessage(`Here are the options under <b>${menu.title}</b>:`);

        submenus.forEach((sub) => {
          const subBtn = document.createElement("button");
          subBtn.textContent = sub.title;
          Object.assign(subBtn.style, {
            margin: "6px 0",
            padding: "10px 12px",
            border: `1px solid ${theme.primary}`,
            borderRadius: "10px",
            background: sub.type === "dynamic" ? "#EEF2FF" : "white",
            color: theme.primary,
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            fontSize: "14px",
          });
          subBtn.onmouseenter = () => (subBtn.style.background = "#F3F4F6");
          subBtn.onmouseleave = () => (subBtn.style.background = "white");
          subBtn.onclick = () => handleSubmenu(sub);
          chatBody.appendChild(subBtn);
        });
      } catch (err) {
        console.error("❌ Error fetching submenus:", err);
        renderBotMessage("⚠️ Unable to load submenu options. Please try again.");
      }
    }

    function handleSubmenu(sub) {
      renderUserMessage(sub.title);
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b>.`);
      inputContainer.style.display = "flex";
      inputField.value = "";
      inputField.focus();

      sendButton.onclick = () => {
        const userInput = inputField.value.trim();
        if (!userInput) return;
        renderUserMessage(userInput);
        sendMessage(sub.type, userInput);
        inputField.value = "";
      };
    }

    // --- Toggle Chat ---
    button.onclick = () => {
      chatWindow.style.display =
        chatWindow.style.display === "flex" ? "none" : "flex";
      if (chatWindow.style.display === "flex") showGreeting();
    };

    showGreeting();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
