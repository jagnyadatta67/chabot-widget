(function () {
  const scriptTag =
    document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();

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
      scriptTag?.getAttribute("data-concept") ||
      window.CHATBOT_CONFIG?.concept ||
      "LIFESTYLE", // default

    env:
      scriptTag?.getAttribute("data-env") ||
      window.CHATBOT_CONFIG?.env ||
      "uat5", // default
  };

  console.log("💎 Chatbot Config:", config);

  function initChatWidget() {
    let lastBotResponse = "";
    let lastIntent = "";

    // --- Floating Button ---
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = "💬";
    Object.assign(button.style, {
      position: "fixed",
      bottom: "25px",
      right: "25px",
      width: "60px",
      height: "60px",
      background: "linear-gradient(135deg, #4F46E5, #9333EA)",
      color: "#fff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      cursor: "pointer",
      boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
      zIndex: "9999",
      transition: "transform 0.2s ease-in-out",
    });
    button.onmouseenter = () => (button.style.transform = "scale(1.1)");
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
      height: 520px;
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
          background: linear-gradient(135deg, #6366F1, #A855F7);
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
      <div style="background:linear-gradient(135deg,#4F46E5,#9333EA);color:#fff;padding:12px 16px;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:space-between;">
        <span>💎 LMG Chat Service</span>
        <span style="font-size:18px;cursor:pointer;" id="close-chat">✖</span>
      </div>
      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;"></div>
      <div id="chat-input-container" style="display:none;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0;display:flex;">
        <input id="chat-input" style="flex:1;padding:10px;border:none;font-size:14px;border-radius:0 0 0 12px;outline:none;" placeholder="Type your message..." />
        <button id="chat-send" style="background:linear-gradient(135deg,#4F46E5,#9333EA);color:#fff;border:none;padding:10px 16px;border-radius:0 0 12px 0;cursor:pointer;">Send</button>
      </div>
      <div id="sticky-back-container" style="position:sticky;bottom:0;background:#fff;padding:6px;border-top:1px solid #eee;display:none;">
        <button id="back-to-main" style="width:100%;background:linear-gradient(135deg,#4F46E5,#9333EA);color:#fff;border:none;padding:8px 0;border-radius:8px;cursor:pointer;">⬅️ Back to Main Menu</button>
      </div>
    `;
    document.body.appendChild(chatWindow);

    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");
    const backButtonContainer = chatWindow.querySelector("#sticky-back-container");
    const backButton = chatWindow.querySelector("#back-to-main");
    const closeBtn = chatWindow.querySelector("#close-chat");

    closeBtn.onclick = () => (chatWindow.style.display = "none");

    // --- Typing Indicator ---
    function showTyping() {
      const typing = document.createElement("div");
      typing.id = "bot-typing";
      typing.innerHTML = "<i>Bot is typing...</i>";
      typing.style.color = "#6b7280";
      typing.style.margin = "8px 0";
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
    function hideTyping() {
      const t = document.getElementById("bot-typing");
      if (t) t.remove();
    }

    // --- Helpers ---
    const clearBody = () => (chatBody.innerHTML = "");
    const renderBotMessage = (msg) => {
      msg = msg
        .replace(/### (.*$)/gim, "<b>$1</b>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\n/g, "<br/>");
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

    const showBackToMainMenu = () => {
      backButtonContainer.style.display = "block";
      backButton.onclick = () => {
        inputContainer.style.display = "none";
        showGreeting();
      };
    };

    // --- API Calls ---
    async function fetchMenus() {
      const res = await fetch(`${config.backend}/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: config.concept,
          env: config.env
        }),
      });
      return await res.json();
    }

    async function fetchSubMenus(menuId) {
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: config.concept,
          env: config.env
        }),
      });
      return await res.json();
    }

    async function sendMessage(type, userMessage) {
      const endpoint = type === "static" ? "/chat/ask" : "/chat";
      const url = `${config.backend}${endpoint}`;
      showTyping();

      try {
        const bodyPayload =
          type === "static"
            ? {
                question: userMessage,
                concept: config.concept,
                env: config.env,
              }
            : {
                message: userMessage,
                question: userMessage,
                userId: config.userid,
                concept: config.concept,
                env: config.env,
                ...(lastIntent === "ORDER_TRACKING" && {
                  previousResponse: lastBotResponse,
                }),
              };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });

        const json = await res.json();
        hideTyping();
        clearBody();

        const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
        lastIntent = intent;
        const payload = json.data || json;

        if (intent === "POLICY_QUESTION" || intent === "GENERAL_QUERY") {
          renderBotMessage(payload.chat_message || payload.data || payload || "No info found.");
        } else if (intent === "ORDER_TRACKING") {
          if (payload.chat_message) {
            renderBotMessage(payload.chat_message);
          } else {
            renderBotMessage("<b>🧾 Customer Details:</b>");
            chatBody.innerHTML += `
              <div class="bubble bot-bubble" style="background:#F9FAFB;">
                <b>Name:</b> ${payload.customerName || "N/A"}<br/>
                <b>Mobile:</b> ${payload.mobileNo || "N/A"}
              </div>
            `;
        
            if (Array.isArray(payload.orderDetailsList) && payload.orderDetailsList.length) {
              renderBotMessage("<b>📦 Order Summary:</b>");
              payload.orderDetailsList.forEach((o) => {
                chatBody.innerHTML += `
                  <div class="bubble bot-bubble" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;padding:10px;margin:8px 0;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img src="${o.productURL || o.imageURL || ''}" alt="${o.productName}" style="width:70px;height:70px;border-radius:8px;object-fit:cover;border:1px solid #E5E7EB;">
                      <div style="flex:1;">
                        <div style="font-weight:600;color:#111827;font-size:14px;">${o.productName || 'N/A'}</div>
                        <div style="color:#6B7280;font-size:13px;margin-top:2px;">${o.color ? `Color: ${o.color}` : ''} ${o.size ? `| Size: ${o.size}` : ''}</div>
                        <div style="color:#6B7280;font-size:13px;">Qty: ${o.qty || 1}</div>
                        <div style="font-weight:500;color:#111827;margin-top:4px;">₹${o.netAmount || o.orderAmount}</div>
                      </div>
                    </div>
                    <hr style="border:none;border-top:1px dashed #E5E7EB;margin:8px 0;">
                    <div style="font-size:13px;color:#374151;">
                      <b>Order No:</b> ${o.orderNo}<br/>
                      <b>Status:</b> ${o.orderStatus}<br/>
                      <b>Date:</b> ${o.orderDate}<br/>
                      <b>Total Products:</b> ${o.totalProducts}
                    </div>
                  </div>
                `;
              });
            } else {
              renderBotMessage("No order details found for this customer.");
            }
          }
        } else {
          renderBotMessage("Sorry, I didn’t quite understand that.");
        }

        showBackToMainMenu();
      } catch (err) {
        hideTyping();
        renderBotMessage("⚠️ Something went wrong.");
        console.error(err);
      }
    }

    // --- Greeting / Menu flow ---
    async function showGreeting() {
      clearBody();
      renderBotMessage("👋 Hi! Welcome to <b>LMG Chat Service</b>");
      renderBotMessage("Please choose one of the following options:");
      const menus = await fetchMenus();
      menus.forEach((menu) => {
        const btn = document.createElement("button");
        btn.textContent = menu.title;
        Object.assign(btn.style, {
          margin: "6px 0",
          padding: "10px 12px",
          border: "1px solid #9333EA",
          borderRadius: "10px",
          background: "white",
          color: "#4F46E5",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          fontSize: "14px",
          transition: "0.2s",
        });
        btn.onmouseenter = () => (btn.style.background = "#EEF2FF");
        btn.onmouseleave = () => (btn.style.background = "white");
        btn.onclick = () => showSubMenus(menu);
        chatBody.appendChild(btn);
      });
      inputContainer.style.display = "none";
      showBackToMainMenu();
    }

    async function showSubMenus(menu) {
      renderUserMessage(menu.title);
      clearBody();
      renderBotMessage(`Here are the options under <b>${menu.title}</b>:`);
      const submenus = await fetchSubMenus(menu.id);
      if (!submenus.length) {
        renderBotMessage("No sub-options found.");
        showBackToMainMenu();
        return;
      }
      submenus.forEach((sub) => {
        const btn = document.createElement("button");
        btn.textContent = sub.title;
        Object.assign(btn.style, {
          margin: "6px 0",
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: sub.type === "dynamic" ? "#EEF2FF" : "#F9FAFB",
          color: "#111827",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          fontSize: "14px",
        });
        btn.onclick = () => handleSubmenu(sub);
        chatBody.appendChild(btn);
      });
      showBackToMainMenu();
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

    // --- Initialize Chatbot ---
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
