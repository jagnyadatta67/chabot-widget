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

  // --- Brand Themes (kept same keys so existing behavior applies) ---
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      gradient: "linear-gradient(135deg, #F89F17, #ffb84d)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
      accent: "#FFDFA8",
    },
    MAX: {
      primary: "#303AB2",
      gradient: "linear-gradient(135deg, #303AB2, #4A55E2)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
      accent: "#DDE2FF",
    },
    BABYSHOP: {
      primary: "#819F83",
      gradient: "linear-gradient(135deg, #819F83, #9FC19F)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
      accent: "#EAF6EA",
    },
    HOMECENTRE: {
      primary: "#7665A0",
      gradient: "linear-gradient(135deg, #7665A0, #9988C4)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
      accent: "#EFE6F8",
    },
  };

  const theme = BRAND_THEMES[config.concept] || BRAND_THEMES.LIFESTYLE;

  /**************************************************************************/
  /*                            STYLES (Modern Brand)                       */
  /**************************************************************************/
  const uiStyles = `
  /* Container / general */
  #chatbot-container * { box-sizing: border-box; -webkit-font-smoothing:antialiased; font-family: Inter, Arial, sans-serif; }
  #chatbot-container { --primary: ${theme.primary}; --gradient: ${theme.gradient}; --accent: ${theme.accent}; }

  /* Floating button */
  #chatbot-button { width:70px; height:70px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  #chatbot-button .btn-inner { width:66px; height:66px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 8px 20px rgba(0,0,0,0.18); cursor:pointer; }
  #chatbot-button .btn-emoji { font-size:22px; transform: translateY(-1px); }
  #chatbot-button:hover { transform: scale(1.06); transition: transform .18s ease; }

  /* Chat window */
  #chatbot-container { display:flex; flex-direction:column; overflow:hidden; border-radius:18px; box-shadow: 0 18px 40px rgba(2,6,23,0.18); }
  #chatbot-header { padding:14px 16px; display:flex; align-items:center; justify-content:space-between; color:#fff; }
  #chatbot-header .left { display:flex; gap:10px; align-items:center; font-weight:700; }
  #chatbot-header img.logo { height:22px; display:block; }
  #chatbot-close { cursor:pointer; font-size:18px; opacity:0.95; padding:6px; border-radius:8px; }
  #chatbot-close:hover { background: rgba(255,255,255,0.08); }

  #chat-body { padding:14px; display:flex; flex-direction:column; gap:8px; overflow-y:auto; -webkit-overflow-scrolling:touch; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)); }
  .bot-bubble, .bubble.bot-bubble { align-self:flex-start; max-width:88%; background: #fff; color:#222; border-radius:14px; padding:10px 12px; box-shadow: 0 6px 14px rgba(13, 30, 60, 0.04); }
  .user-bubble { align-self:flex-end; max-width:88%; border-radius:14px; padding:10px 12px; color:#fff; box-shadow: 0 6px 18px rgba(2,6,23,0.12); }
  .muted { color:#6b7280; font-size:13px; }

  /* Menu button styles */
  .menu-btn, .submenu-btn {
    width:100%;
    text-align:left;
    padding:12px 14px;
    border-radius:10px;
    border:1px solid rgba(0,0,0,0.04);
    background: #fff;
    cursor:pointer;
    font-weight:600;
  }
  .menu-btn:hover, .submenu-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(2,6,23,0.06); transition: all .18s ease; }

  /* Order card specifics */
  .order-card { background:#fff; border:1px solid var(--primary); padding:12px; border-radius:12px; display:flex; gap:12px; align-items:flex-start; box-shadow: 0 6px 14px rgba(2,6,23,0.04); }
  .order-card img { width:84px; height:84px; border-radius:8px; object-fit:cover; border:1px solid #f0f0f0; }
  .order-meta { flex:1; }

  /* Footer / input */
  #chat-input-container { padding:10px; display:flex; gap:8px; align-items:center; border-top:1px solid #eee; background: linear-gradient(180deg, rgba(255,255,255,0.95), #fff); }
  #chat-input { flex:1; padding:10px 12px; border-radius:12px; border:1px solid #e6e6e6; outline:none; font-size:14px; }
  #chat-send { padding:10px 14px; border-radius:10px; border:none; cursor:pointer; font-weight:700; color:#fff; background: var(--primary); box-shadow: 0 6px 14px rgba(2,6,23,0.06); }

  /* Back to menu */
  #back-to-menu-btn { display:block; margin:10px auto; padding:10px 14px; border-radius:10px; border:1px solid var(--primary); background:#fff; color:var(--primary); font-weight:700; cursor:pointer; }

  /* Toast */
  #chat-copy-toast { transition: opacity .18s ease; }

  /* small helpers */
  .small { font-size:13px; color:#666; }

  /* Animations */
  @keyframes chatFadeIn { from {opacity:0; transform: translateY(6px);} to { opacity:1; transform: translateY(0); } }
  .bot-bubble, .user-bubble { animation: chatFadeIn .22s ease both; }

  /* Responsive rules */
  @media (max-width: 480px) {
    #chatbot-button { bottom: 18px !important; right: calc(50% - 35px) !important; position: fixed; z-index: 100001; }
    #chatbot-container { width: 100% !important; height: 100% !important; bottom: 0 !important; right:0 !important; border-radius:0 !important; }
    #chat-body { padding: 16px; }
    #chat-input-container { position: sticky; bottom: 0; background: #fff; z-index: 100002; }
    .order-card { flex-direction: row; }
  }
  @media (min-width: 481px) and (max-width: 900px) {
    #chatbot-container { width: 86% !important; height: 72% !important; right:7% !important; bottom: 8% !important; border-radius:12px !important; }
  }
  @media (min-width: 901px) {
    #chatbot-container { width: 380px; height: 560px; right: 25px; bottom: 90px; border-radius:18px; }
  }
  `;

  // inject styles
  const s = document.createElement("style");
  s.id = "chatbot-modern-styles";
  s.innerHTML = uiStyles;
  document.head.appendChild(s);

  /**************************************************************************/
  /*                               MAIN LOGIC                                */
  /**************************************************************************/
  function initChatWidget() {
    let lastIntent = "";
    const chatWindow = createChatWindow();
    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");

    // Utility
    const clearBody = () => (chatBody.innerHTML = "");

    // Renderers
    const renderBotMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bot-bubble";
      // keep original style classes for compatibility
      bubble.innerHTML = msg.replace(/\n/g, "<br/>");
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "user-bubble";
      bubble.style.background = theme.gradient;
      bubble.innerHTML = msg;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    // Back to menu
    const renderBackToMenu = () => {
      const existing = document.getElementById("back-to-menu-btn");
      if (existing) existing.remove();

      const backBtn = document.createElement("button");
      backBtn.id = "back-to-menu-btn";
      backBtn.textContent = "⬅️ Back to Main Menu";
      backBtn.style.border = `1px solid ${theme.primary}`;
      backBtn.onclick = () => showGreeting();

      const footer = chatWindow.querySelector("#chat-footer");
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(backBtn, footer);
      } else {
        chatWindow.appendChild(backBtn);
      }
    };

    // API Helpers (unchanged)
    async function fetchMenus() {
      const res = await fetch(`${config.backend}/menus`);
      return res.json();
    }
    async function fetchSubMenus(menuId) {
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
      return res.json();
    }

    // INTENT HANDLERS
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

    function handleOrderTracking(payload) {
      if (checkAndTriggerLogin(payload, "Please login to check your order details.")) return;
      if (payload.chat_message && payload.chat_message.trim() !== "") {
        renderBotMessage(payload.chat_message);
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>");
        chatBody.innerHTML += `
          <div class="bot-bubble">
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
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleCustomerProfile(payload) {
      if (checkAndTriggerLogin(payload, "Please login to check your order details.")) return;

      const profile = payload.customerProfile;

      if (!profile) {
        renderBotMessage("Sorry, I couldn’t fetch your profile details.");
        renderBackToMenu();
        return;
      }

      const chatMsg =
        payload?.data?.chat_message || profile?.chat_message || "";

      if (chatMsg.trim() !== "") {
        renderBotMessage(chatMsg);
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>");
        chatBody.innerHTML += `
          <div class="bot-bubble">
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
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // trigger login popup helper (kept)
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
     * Checks if backend message asks user to login.
     * If yes, shows a clickable "Login" link that triggers the popup.
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
        renderBotMessage(`
          ${cht || defaultMsg}
          <br><br>
          <a href="#" id="chat-login-link" style="color:${theme.primary}; text-decoration:underline; cursor:pointer;">
            🔐 Click here to Login
          </a>
        `);

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

    // Extract order number (kept)
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

    // Copy to clipboard (kept)
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

    // Enhanced order card (kept but using order-card class for modern look)
    const renderOrderCard = (o) => {
      // return HTML string (kept same semantics)
      const orderNumber = extractOrderNumber(o.orderNo);
      const orderUrl =
        o.orderNo && o.orderNo.startsWith("http")
          ? o.orderNo
          : `${window.location.origin}/my-account/order/${orderNumber}`;
      const returnMsg = o.returnAllow ? "✅ Return Available" : "🚫 No Return";
      const exchangeMsg = o.exchangeAllow ? "♻️ Exchange Available" : "🚫 No Exchange";
      const statusBadge = o.latestStatus
        ? `<span style="
            display:inline-block;padding:4px 8px;font-weight:600;font-size:12px;color:white;background:${theme.primary};margin-left:6px;border-radius:4px;">${o.latestStatus}</span>`
        : "";
      return `
        <div class="order-card">
          <img src="${o.imageURL || "https://via.placeholder.com/80"}" alt="product"/>
          <div class="order-meta">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="font-weight:700;color:#111">${o.productName || "Product"}</div>
              ${statusBadge}
            </div>
            <div style="margin-top:6px;color:#555;font-size:13px;">${o.color || ""}${o.size ? " | " + o.size : ""}</div>
            <div style="margin-top:8px;font-size:13px;color:#444;">
              <strong>Qty:</strong> ${o.qty || 1} | <strong>Net:</strong> ${o.netAmount || "-"}
            </div>
            <div style="margin-top:10px;font-size:13px;">
              <b>Order No:</b> <span style="font-weight:600">${orderNumber}</span>
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
              <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                <button style="background:${theme.primary};color:#fff;padding:6px 10px;border:none;border-radius:8px;cursor:pointer;font-size:13px;">View Order</button>
              </a>
              <button onclick="copyToClipboard('${orderNumber}')" style="background:#fff;border:1px solid ${theme.primary};color:${theme.primary};padding:6px 10px;border-radius:8px;cursor:pointer;font-size:13px;">Copy Order #</button>
            </div>
            ${o.orderAmount ? `<div style="font-size:13px;color:#666;margin-top:8px;"><strong>Amount:</strong> ₹${o.orderAmount}</div>` : ""}
            ${o.estmtDate ? `<div style="font-size:13px;color:#666;margin-top:4px;"><strong>ETA:</strong> ${o.estmtDate}</div>` : ""}
            <div style="font-size:13px;margin-top:8px;color:#444">${returnMsg} | ${exchangeMsg}</div>
          </div>
        </div>`;
    };

    // Send message (unchanged)
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

    // Menus / greeting (kept)
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      // Modern attractive greeting
      renderBotMessage(`<div style="font-size:15px;"><strong>👋 Hello! Welcome to ${config.concept}</strong></div>
        <div class="small muted" style="margin-top:6px;">
          I'm your virtual assistant — I can help with orders, returns, profile info, store locators and more. Try: <b>"Where's my order?"</b>
        </div>`);
      renderBotMessage(`<div style="margin-top:8px;font-weight:600;color:${theme.primary};">Top options — tap to explore 👇</div>`);
      const menus = await fetchMenus();
      menus.forEach((menu) => renderMenuButton(menu));
      renderBackToMenu();
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    const renderMenuButton = (menu) => {
      const btn = document.createElement("button");
      btn.className = "menu-btn";
      btn.textContent = menu.title;
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
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    const renderSubmenuButton = (sub) => {
      const sbtn = document.createElement("button");
      sbtn.className = "submenu-btn";
      sbtn.textContent = sub.title;
      sbtn.onclick = () => handleSubmenu(sub);
      chatBody.appendChild(sbtn);
    };

    async function handleSubmenu(sub) {
      clearBody();
      renderUserMessage(sub.title);
      if (sub.title.toLowerCase().includes("near") && sub.title.toLowerCase().includes("store")) {
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
                  <div class="bot-bubble" style="border:1px solid ${theme.primary};">
                    <b>${s.storeName}</b><br/>
                    ${s.line1 || ""} ${s.line2 ? "- " + s.line2 : ""} ${s.postalCode ? "- " + s.postalCode : ""}<br/>
                    ${s.contactNumber ? "📞 " + s.contactNumber + "<br/>" : ""}
                    ${s.workingHours ? "🕒 " + s.workingHours + "<br/>" : ""}
                    <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                       style="color:${theme.primary};font-weight:600;">📍 View on Map</a>
                  </div>`;
              });
            } else renderBotMessage("😔 No nearby stores found.");
            renderBackToMenu();
            chatBody.scrollTop = chatBody.scrollHeight;
          } catch (err) {
            console.error(err);
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

    // Initialize floating button and other UI
    createFloatingButton(chatWindow, showGreeting);
  } // end initChatWidget

  /**************************************************************************/
  /*                        UI: Floating Button & Window                    */
  /**************************************************************************/
  function createFloatingButton(chatWindow, showGreeting) {
    // create wrapper
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.style.position = "fixed";
    button.style.zIndex = "99999";
    button.style.right = "25px";
    button.style.bottom = "25px";

    // inner clickable
    const inner = document.createElement("div");
    inner.className = "btn-inner";
    inner.style.background = theme.gradient;
    inner.style.border = `3px solid rgba(255,255,255,0.22)`;
    inner.style.width = "66px";
    inner.style.height = "66px";

    const emoji = document.createElement("div");
    emoji.className = "btn-emoji";
    emoji.textContent = "💬";
    inner.appendChild(emoji);
    button.appendChild(inner);
    document.body.appendChild(button);

    // reposition on small screens (center-bottom)
    const reposition = () => {
      const vw = window.innerWidth;
      if (vw <= 480) {
        button.style.right = "calc(50% - 35px)";
        button.style.bottom = "18px";
      } else {
        button.style.right = "25px";
        button.style.bottom = "25px";
      }
    };
    reposition();
    window.addEventListener("resize", reposition);

    // click toggles chat window
    button.addEventListener("click", () => {
      const chat = document.getElementById("chatbot-container");
      const isVisible = chat && chat.style.display === "flex";
      if (!chat) return;
      chat.style.display = isVisible ? "none" : "flex";
      if (!isVisible) {
        // show greeting only when opening
        // find the showGreeting function in scope by calling the passed one
        try {
          showGreeting();
        } catch (e) {
          console.warn("showGreeting unavailable", e);
        }
        if (window.innerWidth <= 480) document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
  }

  function createChatWindow() {
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.style.position = "fixed";
    chatWindow.style.display = "none";
    chatWindow.style.zIndex = "99998";
    // default desktop size - responsive rules in CSS will override on smaller screens
    chatWindow.style.width = "380px";
    chatWindow.style.height = "560px";
    chatWindow.style.bottom = "90px";
    chatWindow.style.right = "25px";
    chatWindow.style.background = "#fff";
    chatWindow.style.border = `2px solid ${theme.primary}`;
    chatWindow.style.borderRadius = "18px";
    chatWindow.style.overflow = "hidden";
    chatWindow.style.transition = "all .26s ease";

    // header color uses gradient
    const logoFilter = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept)
      ? "filter: brightness(0) invert(1);"
      : "";

    chatWindow.innerHTML = `
      <div id="chatbot-header" style="background:${theme.gradient};">
        <div class="left">
          <img class="logo" src="${theme.logo}" alt="${config.concept} logo" style="${logoFilter}">
          <div style="font-size:15px">Chat with us</div>
        </div>
        <div id="chatbot-close" style="color:rgba(255,255,255,0.95)">✖</div>
      </div>
      <div id="chat-body"></div>
      <div id="chat-input-container" style="display:none;">
        <input id="chat-input" placeholder="Type your message (e.g. 'Where is my order?')" />
        <button id="chat-send">Send</button>
      </div>
      <div id="chat-footer" style="text-align:center;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        <span style="font-size:13px;color:#666">Powered by <strong>${config.concept}</strong></span>
      </div>
    `;

    document.body.appendChild(chatWindow);

    // close behavior
    const closeBtn = chatWindow.querySelector("#chatbot-close");
    closeBtn.addEventListener("click", () => {
      chatWindow.style.display = "none";
      document.body.style.overflow = "";
    });

    // Responsiveness adjustments on resize (extra safety)
    function adjustChatWindow() {
      const vw = window.innerWidth;
      if (vw <= 480) {
        // fullscreen mobile
        chatWindow.style.width = "100%";
        chatWindow.style.height = "100%";
        chatWindow.style.right = "0";
        chatWindow.style.bottom = "0";
        chatWindow.style.borderRadius = "0";
        chatWindow.style.border = "none";
      } else if (vw <= 900) {
        chatWindow.style.width = "86%";
        chatWindow.style.height = "72%";
        chatWindow.style.right = "7%";
        chatWindow.style.bottom = "8%";
        chatWindow.style.borderRadius = "12px";
      } else {
        chatWindow.style.width = "380px";
        chatWindow.style.height = "560px";
        chatWindow.style.right = "25px";
        chatWindow.style.bottom = "90px";
        chatWindow.style.borderRadius = "18px";
      }
    }
    adjustChatWindow();
    window.addEventListener("resize", adjustChatWindow);

    return chatWindow;
  }

  /**************************************************************************/
  /*                                INIT                                     */
  /**************************************************************************/
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
