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
    let lastIntent = "";
    const chatWindow = createChatWindow();
    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");

    // --- Utility Functions ---
    const clearBody = () => (chatBody.innerHTML = "");

    const renderBotMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble bot-bubble";
      bubble.style =
        "background:#f3f4f6;border-radius:12px;padding:8px 12px;margin:6px 0;max-width:88%;";
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

    // --- Back to Menu: always inserted above footer (bottom) ---
    const renderBackToMenu = () => {
      // remove existing if any
      const existing = document.getElementById("back-to-menu-btn");
      if (existing) existing.remove();

      const backBtn = document.createElement("button");
      backBtn.id = "back-to-menu-btn";
      backBtn.textContent = "⬅️ Back to Main Menu";
      Object.assign(backBtn.style, {
        width: "90%",
        margin: "10px auto",
        display: "block",
        padding: "10px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: "#fff",
        color: theme.primary,
        cursor: "pointer",
        fontWeight: "600",
      });

      backBtn.onclick = () => showGreeting();

      // Insert before footer inside chatWindow so it stays at bottom
      const footer = chatWindow.querySelector("#chat-footer");
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(backBtn, footer);
      } else {
        // fallback: append to chatWindow
        chatWindow.appendChild(backBtn);
      }
    };

    // --- API Helpers ---
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
      CUSTOMER_PROFILE:handleCustomerProfile,
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

    function handleOrderTracking(payload) {
      if (checkAndTriggerLogin(payload, "Please login to check your order details.")) return;
      if (payload.chat_message && payload.chat_message.trim() !== "") {
        renderBotMessage(payload.chat_message);
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>");
        chatBody.innerHTML += `
          <div class="bubble bot-bubble">
            <b>Name:</b> ${payload.customerName || "N/A"}<br/>
            <b>Mobile:</b> ${payload.mobileNo || "N/A"}
          </div>`;

        if (Array.isArray(payload.orderDetailsList) && payload.orderDetailsList.length > 0) {
          payload.orderDetailsList.forEach((o) => {
            chatBody.innerHTML += renderOrderCard(o);
          });
        } else {
          renderBotMessage("No recent orders found.");
        }
      }
      renderBackToMenu();
    }


    function handleCustomerProfile(payload) {


      if (checkAndTriggerLogin(payload, "Please login to check your order details.")) return;



      const profile = payload.customerProfile;
    
      if (!profile) {
        renderBotMessage("Sorry, I couldn’t fetch your profile details.");
        renderBackToMenu();
        return;
      }
    
      // Use top-level or inner chat message if available
      const chatMsg =
        payload?.data?.chat_message || profile?.chat_message || "";
    
      if (chatMsg.trim() !== "") {
        renderBotMessage(chatMsg);
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>");
    
        chatBody.innerHTML += `
          <div class="bubble bot-bubble">
            <b>Name:</b> ${profile.name || "N/A"}<br/>
            <b>Email:</b> ${profile.email || "N/A"}<br/>
            <b>Mobile:</b> ${profile.signInMobile || "N/A"}<br/>
            <b>Gender:</b> ${profile.gender || "N/A"}<br/>
            ${
              profile.defaultAddress
                ? `<b>Address:</b> ${profile.defaultAddress.line1 || ""}, ${profile.defaultAddress.town || ""}, ${
                    profile.defaultAddress.region?.name || ""
                  }, ${profile.defaultAddress.country?.name || ""} - ${profile.defaultAddress.postalCode || ""}`
                : "<b>Address:</b> N/A"
            }
          </div>`;
      }
    
      renderBackToMenu();
    }
    
    function triggerLoginPopup() {
      setTimeout(() => {
        const signupBtn = document.getElementById("account-actions-signup");
        if (signupBtn) {
          signupBtn.click();
          console.log("🔑 Triggered signup/login popup automatically");
        } else {
          console.warn("⚠️ Signup button not found (id='account-actions-signup').");
        }
      }, 600);
    }

    /**
 * Checks if backend response requires user login,
 * based on the chat_message content.
 * If detected, renders message and triggers login popup.
 *
 * @param {Object} payload - The API/chatbot response object.
 * @param {string} [defaultMsg] - Optional fallback message to show.
 * @returns {boolean} true if login popup was triggered, else false.
 */
/**
 * Checks if backend message asks user to login.
 * If yes, shows a clickable "Login" link that triggers the popup.
 *
 * @param {Object} payload - Chatbot API response.
 * @param {string} [defaultMsg] - Optional fallback message.
 * @returns {boolean} true if login link rendered, else false.
 */
function checkAndTriggerLogin(payload, defaultMsg = "Please login to continue.") {
  const cht = payload?.data?.chat_message || payload?.chat_message || "";
  const normalizedMsg = cht.trim().toLowerCase();

  const isLoginPrompt =
    normalizedMsg.includes("login") ||
    normalizedMsg.includes("sign in") ||
    normalizedMsg.includes("signin") ||
    normalizedMsg.includes("anonymous user");

  if (isLoginPrompt) {
    // Render message + clickable link
    renderBotMessage(`
      ${cht || defaultMsg}
      <br><br>
      <a href="#" id="chat-login-link" style="color:#007bff; text-decoration:underline; cursor:pointer;">
        🔐 Click here to Login
      </a>
    `);

    // Attach click listener after rendering
    setTimeout(() => {
      const loginLink = document.getElementById("chat-login-link");
      if (loginLink) {
        loginLink.addEventListener("click", (e) => {
          e.preventDefault();
          const signupBtn = document.getElementById("account-actions-signup");
          if (signupBtn) {
            signupBtn.click();
            console.log("🔑 Login popup triggered from chat link");
          } else {
            console.warn("⚠️ Login popup element not found: #account-actions-signup");
          }
        });
      }
    }, 300);

    renderBackToMenu();
    return true;
  }

  return false;
}



    // --- Extract Order Number ---
    function extractOrderNumber(orderNo) {
      if (!orderNo) return "N/A";
      try {
        const m = orderNo.match(/\/order\/([^\/?\#]+)/i);
        if (m && m[1]) return m[1];
        const m2 = orderNo.match(/(\d{5,})/);
        if (m2) return m2[1];
        return orderNo.split("?")[0].split("#")[0];
      } catch {
        return orderNo;
      }
    }

    // --- Copy to Clipboard ---
    window.copyToClipboard = async function (text) {
      try {
        await navigator.clipboard.writeText(text);
        let toast = document.getElementById("chat-copy-toast");
        if (!toast) {
          toast = document.createElement("div");
          toast.id = "chat-copy-toast";
          Object.assign(toast.style, {
            position: "fixed",
            bottom: "160px",
            right: "30px",
            background: "#111",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            zIndex: 10000,
            opacity: 0.95,
            fontSize: "13px",
          });
          document.body.appendChild(toast);
        }
        toast.textContent = "✅ Order number copied!";
        toast.style.display = "block";
        clearTimeout(toast._t);
        toast._t = setTimeout(() => (toast.style.display = "none"), 1600);
      } catch {
        alert("Copy failed. Please copy manually.");
      }
    };

    // --- Enhanced Order Card ---
    const renderOrderCard = (o) => {
      const orderNumber = extractOrderNumber(o.orderNo);
      const orderUrl =
        o.orderNo && o.orderNo.startsWith("http")
          ? o.orderNo
          : `${window.location.origin}/my-account/order/${orderNumber}`;
      const returnMsg = o.returnAllow ? "✅ Return Available" : "🚫 No Return";
      const exchangeMsg = o.exchangeAllow ? "♻️ Exchange Available" : "🚫 No Exchange";
      const statusBadge = o.latestStatus
  ? `<span style="
      display:inline-block;
      padding:4px 8px;
      font-weight:600;
      font-size:12px;
      color:white;
      background:${theme.primary};
      margin-left:6px;
      border-radius:4px;">${o.latestStatus}</span>`
  : "";
      return `
        <div class="bubble bot-bubble" style="background:#fff;border:1px solid ${theme.primary};padding:12px;border-radius:12px;margin-top:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <img src="${o.imageURL || "https://via.placeholder.com/80"}" style="width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid #eee;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <div style="font-weight:700;color:#222;font-size:14px;">${o.productName || "Product"}</div>
                ${statusBadge}
              </div>
              <div style="font-size:13px;color:#555;margin-top:6px;">${o.color || ""}${o.size ? " | " + o.size : ""}</div>
              <div style="margin-top:8px;font-size:13px;color:#444;">
                <strong>Qty:</strong> ${o.qty || 1} | <strong>Net:</strong> ${o.netAmount || "-"}
              </div>
              <div style="margin-top:10px;">
                <div style="font-size:13px;margin-bottom:4px;"><b>Order No:</b> <span style="font-weight:600;color:#111;">${orderNumber}</span></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
                  <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                    <button style="background:${theme.primary};color:#fff;padding:6px 10px;border:none;border-radius:8px;cursor:pointer;font-size:13px;">View Order</button>
                  </a>
                  <button onclick="copyToClipboard('${orderNumber}')" style="background:#fff;border:1px solid ${theme.primary};color:${theme.primary};padding:6px 10px;border-radius:8px;cursor:pointer;font-size:13px;">Copy Order #</button>
                </div>
              </div>
              ${o.orderAmount ? `<div style="font-size:13px;color:#666;margin-top:8px;"><strong>Amount:</strong> ₹${o.orderAmount}</div>` : ""}
              ${o.estmtDate ? `<div style="font-size:13px;color:#666;margin-top:4px;"><strong>ETA:</strong> ${o.estmtDate}</div>` : ""}
              <div style="font-size:13px;margin-top:8px;">${returnMsg} | ${exchangeMsg}</div>
            </div>
          </div>
        </div>`;
    };

    // --- Send Message (unchanged) ---
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log("🧠 Chatbot Response:", json);
        const intent = json.intent || json.data?.intent || "DEFAULT";
        let payload = typeof json.data === "string" ? { chat_message: json.data } : json.data || json;
        const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS.DEFAULT;
        handler(payload);
      } catch (e) {
        console.error("❌ Chatbot error:", e);
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }

    // --- Menus, Submenus, etc. (same as before) ---
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`);
      renderBotMessage("Please choose an option below 👇");
      const menus = await fetchMenus();
      menus.forEach((menu) => renderMenuButton(menu));
      // show back button at bottom after rendering menu
      renderBackToMenu();
    }

    const renderMenuButton = (menu) => {
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
      // ensure back button is at bottom after submenu items
      renderBackToMenu();
    }

    const renderSubmenuButton = (sub) => {
      const sbtn = document.createElement("button");
      sbtn.textContent = sub.title;
      Object.assign(sbtn.style, {
        width: "100%",
        margin: "6px 0",
        padding: "10px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: sub.type === "dynamic" ? "#EEF2FF" : "#fff",
        color: theme.primary,
        cursor: "pointer",
      });
      sbtn.onclick = () => handleSubmenu(sub);
      chatBody.appendChild(sbtn);
    };

    async function handleSubmenu(sub) {
      clearBody();
      renderUserMessage(sub.title);
      if (sub.title.toLowerCase().includes("near") && sub.title.toLowerCase().includes("store")) {
        // nearby store flow will add results then back button
        await handleNearbyStore();
        renderBackToMenu();
        return;
      }
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b>.`);
      inputContainer.style.display = "flex";
      sendButton.onclick = () => {
        const msg = inputField.value.trim();
        if (!msg) return;
        renderUserMessage(msg);
        sendMessage(sub.type, msg);
        inputField.value = "";
      };
      // render back button after showing input
      renderBackToMenu();
    }

    async function handleNearbyStore() {
      renderBotMessage("📍 Detecting your location...");
      if (!navigator.geolocation) {
        renderBotMessage("⚠️ Geolocation not supported.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          renderBotMessage(`✅ Found location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
          renderBotMessage("Fetching nearby stores...");
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
              json.data.stores.forEach((s) => {
                chatBody.innerHTML += `
                  <div class="bubble bot-bubble" style="background:#fff;border:1px solid ${theme.primary};border-radius:12px;padding:10px;margin:8px 0;">
                    <b>${s.storeName}</b><br/>
                    ${s.line1 || ""} ${s.line2 ? "- " + s.line2 : ""} ${s.postalCode ? "- " + s.postalCode : ""}<br/>
                    ${s.contactNumber ? "📞 " + s.contactNumber + "<br/>" : ""}
                    ${s.workingHours ? "🕒 " + s.workingHours + "<br/>" : ""}
                    <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                       style="color:${theme.primary};font-weight:600;">📍 View on Map</a>
                  </div>`;
              });
            } else renderBotMessage("😔 No nearby stores found.");
            // after nearby stores, ensure back button at bottom
            renderBackToMenu();
          } catch {
            renderBotMessage("⚠️ Error fetching store list.");
            renderBackToMenu();
          }
        },
        () => {
          renderBotMessage("❌ Permission denied for location.");
          renderBackToMenu();
        }
      );
    }

    // --- UI Initialization ---
    createFloatingButton(chatWindow, showGreeting);
  }

  // --- Helpers: UI Initialization ---
  function createFloatingButton(chatWindow, showGreeting) {
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = `
      <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="background:white;border:3px solid ${theme.primary};border-radius:50%;width:65px;height:65px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <img src="${theme.logo}" alt="${config.concept}" style="width:58px;height:auto;object-fit:contain;">
        </div>
        <div style="position:absolute;bottom:-4px;right:-4px;background:${theme.primary};Color:white;border-radius:50%;padding:5px;font-size:14px;">💬</div>
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
    button.onclick = () => {
      chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
      if (chatWindow.style.display === "flex") showGreeting();
    };
    document.body.appendChild(button);
  }

  function createChatWindow() {
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
  
    // Apply white logo filter only for darker themes (Max, Lifestyle, Homecentre)
    const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept);
    const logoFilter = isDarkHeader ? "filter: brightness(0) invert(1);" : "";
  
    chatWindow.innerHTML = `
      <div style="background:${theme.gradient};color:white;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;">
        <span style="display:flex;align-items:center;gap:8px;">
          <img src="${theme.logo}" style="height:22px;${logoFilter}" alt="${config.concept} logo">
          <span>Chat Service</span>
        </span>
        <span id="close-chat" style="cursor:pointer;">✖</span>
      </div>
      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;"></div>
      <div id="chat-input-container" style="display:none;border-top:1px solid #e5e7eb;display:flex;">
        <input id="chat-input" placeholder="Type your message..." style="flex:1;padding:10px;border:none;outline:none;">
        <button id="chat-send" style="background:${theme.gradient};color:white;border:none;padding:10px 16px;cursor:pointer;">Send</button>
      </div>
      <div id="chat-footer" style="text-align:center;font-size:12px;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        Powered by <img src="${theme.logo}" style="height:20px;margin-left:5px;">
      </div>`;
  
    document.body.appendChild(chatWindow);
  
    chatWindow.querySelector("#close-chat").onclick = () => (chatWindow.style.display = "none");
    return chatWindow;
  }
  

  // --- Initialize ---
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();