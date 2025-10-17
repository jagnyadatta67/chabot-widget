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

    // --- Floating Chat Button ---
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = `
      <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="background:white;border:3px solid ${theme.primary};border-radius:50%;width:65px;height:65px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <img src="${theme.logo}" alt="${config.concept}" style="width:58px;height:auto;object-fit:contain;">
        </div>
        <div style="position:absolute;bottom:-4px;right:-4px;background:${theme.primary};color:white;border-radius:50%;padding:5px;font-size:14px;">💬</div>
      </div>`;
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
      height: 540px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', Arial, sans-serif;
      border: 2px solid ${theme.primary};
      z-index: 9999;
    `;

    chatWindow.innerHTML = `
      <div style="background:${theme.gradient};color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;">
        <span><img src="${theme.logo}" style="height:20px;margin-right:6px;"> Chat Service</span>
        <span id="close-chat" style="cursor:pointer;">✖</span>
      </div>

      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;"></div>

      <div id="chat-input-container" style="display:none;border-top:1px solid #e5e7eb;display:flex;">
        <input id="chat-input" placeholder="Type your message..." style="flex:1;padding:10px;border:none;outline:none;">
        <button id="chat-send" style="background:${theme.gradient};color:white;border:none;padding:10px 16px;cursor:pointer;">Send</button>
      </div>

      <div style="text-align:center;font-size:12px;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        Powered by <img src="${theme.logo}" style="height:20px;margin-left:5px;">
      </div>
    `;
    document.body.appendChild(chatWindow);

    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");
    const closeBtn = chatWindow.querySelector("#close-chat");

    closeBtn.onclick = () => (chatWindow.style.display = "none");

    // --- Utility functions ---
    const clearBody = () => (chatBody.innerHTML = "");
    const renderBotMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble bot-bubble";
      bubble.style = `background:#f3f4f6;border-radius:12px;padding:8px 12px;margin:6px 0;max-width:88%;`;
      bubble.innerHTML = msg.replace(/\n/g, "<br/>");
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble user-bubble";
      bubble.style = `background:${theme.gradient};color:white;border-radius:12px;padding:8px 12px;margin:6px 0;align-self:flex-end;max-width:88%;`;
      bubble.innerHTML = msg;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    // --- Fetch menu/submenu ---
    async function fetchMenus() {
      const res = await fetch(`${config.backend}/menus`);
      return await res.json();
    }
    async function fetchSubMenus(menuId) {
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
      return await res.json();
    }

    // --- Send Chat message ---
    async function sendMessage(type, userMessage) {
      const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`;
      try {
        const body = {
          message: userMessage,
          question: userMessage,
          userId: config.userid,
          concept: config.concept,
          env: config.env,
        };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();

        const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
        lastIntent = intent;
        const payload = json.data || json;

        if (intent === "POLICY_QUESTION" || intent === "GENERAL_QUERY") {
          renderBotMessage(payload.chat_message || "No information found.");
        } else if (intent === "ORDER_TRACKING") {
          renderBotMessage("<b>🧾 Customer Details:</b>");
          chatBody.innerHTML += `
            <div class="bubble bot-bubble">
              <b>Name:</b> ${payload.customerName || "N/A"}<br/>
              <b>Mobile:</b> ${payload.mobileNo || "N/A"}
            </div>`;
          if (Array.isArray(payload.orderDetailsList)) {
            payload.orderDetailsList.forEach((o) => {
              chatBody.innerHTML += `
                <div class="bubble bot-bubble" style="background:#fff;border:1px solid ${theme.primary};padding:10px;">
                  <b>${o.productName}</b><br/>
                  ${o.color || ""} ${o.size || ""}<br/>
                  Qty: ${o.qty || 1} | ₹${o.netAmount}<br/>
                  <small>Status: ${o.orderStatus}</small>
                </div>`;
            });
          }
        }
      } catch (e) {
        renderBotMessage("⚠️ Something went wrong. Please try again.");
      }
    }

    // --- Handle submenu click ---
    async function handleSubmenu(sub) {
      renderUserMessage(sub.title);

      // ✅ Handle “Near By Store”
      if (sub.title.toLowerCase().includes("near") && sub.title.toLowerCase().includes("store")) {
        renderBotMessage("📍 Detecting your location...");

        if (!navigator.geolocation) {
          renderBotMessage("⚠️ Geolocation is not supported by your browser.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            renderBotMessage(`✅ Location found (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`);
            renderBotMessage("Fetching nearby stores... 🏬");

            try {
              const res = await fetch(`${config.backend}/chat/nearby-stores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  latitude: lat,
                  longitude: lon,
                  concept: config.concept,
                  env: config.env,
                  userId: config.userid,
                }),
              });
              const json = await res.json();

              if (json?.data?.stores?.length) {
                renderBotMessage(`🗺️ Found ${json.data.stores.length} nearby store(s):`);
                json.data.stores.forEach((s) => {
                  chatBody.innerHTML += `
                    <div class="bubble bot-bubble" style="background:#fff;border:1px solid ${theme.primary};border-radius:12px;padding:10px;margin:8px 0;">
                      <b>${s.storeName}</b><br/>
                      ${s.address}<br/>
                      📞 ${s.contactNumber}<br/>
                      🕒 ${s.workingHours}<br/>
                      <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                         style="color:${theme.primary};font-weight:600;">📍 View on Map</a>
                    </div>`;
                });
              } else {
                renderBotMessage("😔 No nearby stores found.");
              }
            } catch (e) {
              renderBotMessage("⚠️ Unable to fetch nearby stores. Please try again later.");
            }
          },
          (err) => {
            renderBotMessage("❌ Location permission denied. Please allow access to find nearby stores.");
          }
        );
        inputContainer.style.display = "none";
        return;
      }

      // Default flow
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b>.`);
      inputContainer.style.display = "flex";
      sendButton.onclick = () => {
        const userInput = inputField.value.trim();
        if (!userInput) return;
        renderUserMessage(userInput);
        sendMessage(sub.type, userInput);
        inputField.value = "";
      };
    }

    // --- Show Menus / Submenus ---
    async function showGreeting() {
      clearBody();
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`);
      renderBotMessage("Please choose an option below 👇");
      const menus = await fetchMenus();
      menus.forEach((menu) => {
        const btn = document.createElement("button");
        btn.textContent = menu.title;
        Object.assign(btn.style, {
          width: "100%",
          margin: "6px 0",
          padding: "10px",
          border: `1px solid ${theme.primary}`,
          borderRadius: "10px",
          background: "#fff",
          color: theme.primary,
          cursor: "pointer",
        });
        btn.onclick = () => showSubMenus(menu);
        chatBody.appendChild(btn);
      });
    }

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      renderBotMessage(`Fetching options for <b>${menu.title}</b>...`);
      const submenus = await fetchSubMenus(menu.id);
      if (!submenus?.length) {
        renderBotMessage("No sub-options found.");
        return;
      }
      submenus.forEach((sub) => {
        const subBtn = document.createElement("button");
        subBtn.textContent = sub.title;
        Object.assign(subBtn.style, {
          width: "100%",
          margin: "6px 0",
          padding: "10px",
          border: `1px solid ${theme.primary}`,
          borderRadius: "10px",
          background: sub.type === "dynamic" ? "#EEF2FF" : "#fff",
          color: theme.primary,
          cursor: "pointer",
        });
        subBtn.onclick = () => handleSubmenu(sub);
        chatBody.appendChild(subBtn);
      });
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
