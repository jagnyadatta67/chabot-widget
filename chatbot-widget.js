(function () {
  const scriptTag =
    document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();

  // --- Config ---
  const config = {
    backend: "https://6aaf2dea1fc1.ngrok-free.app/api/chat",
    userid:
      scriptTag?.getAttribute("data-userid") ||
      window.CHATBOT_CONFIG?.userid ||
      "UNKNOWN_USER",
    concept:
      (scriptTag?.getAttribute("data-concept") ||
        window.CHATBOT_CONFIG?.concept ||
        "LIFESTYLE").toUpperCase(),
    appid:
      scriptTag?.getAttribute("data-appid") ||
      window.CHATBOT_CONFIG?.appid ||
      "UNKNOWN_APP",
    env:
      scriptTag?.getAttribute("data-env") ||
      window.CHATBOT_CONFIG?.env ||
      "uat5",
  };

  console.log("💎 Chatbot Config:", config);

  // --- Enhanced Brand Themes ---
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      secondary: "#FFB84D",
      gradient: "linear-gradient(135deg, #F89F17, #ffb84d)",
      hover: "linear-gradient(135deg, #E88F07, #FFA833)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
      darkText: true
    },
    MAX: {
      primary: "#303AB2",
      secondary: "#4A55E2",
      gradient: "linear-gradient(135deg, #303AB2, #4A55E2)",
      hover: "linear-gradient(135deg, #202AA2, #3A45D2)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
      darkText: false
    },
    BABYSHOP: {
      primary: "#819F83",
      secondary: "#9FC19F",
      gradient: "linear-gradient(135deg, #819F83, #9FC19F)",
      hover: "linear-gradient(135deg, #718F73, #8FB18F)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
      darkText: true
    },
    HOMECENTRE: {
      primary: "#7665A0",
      secondary: "#9988C4",
      gradient: "linear-gradient(135deg, #7665A0, #9988C4)",
      hover: "linear-gradient(135deg, #665590, #8978B4)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
      darkText: false
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

    // Enhanced Loader with better animation
    function showLoader(message = "Please wait...") {
      let loader = chatWindow.querySelector(".chat-loader");
      if (!loader) {
        loader = document.createElement("div");
        loader.className = "chat-loader";
        loader.innerHTML = `
          <div class="chat-loader-inner">
            <div class="chat-spinner" aria-hidden="true">
              <div class="spinner-circle"></div>
            </div>
            <div class="chat-loader-text">${message}</div>
          </div>
        `;
        chatWindow.appendChild(loader);
      }
      loader.style.display = "flex";
    }

    function hideLoader() {
      const loader = chatWindow.querySelector(".chat-loader");
      if (loader) loader.style.display = "none";
    }

    // --- Enhanced Utility Functions ---
    const clearBody = () => (chatBody.innerHTML = "");

    const renderBotMessage = (msg, options = {}) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble bot-bubble";
      bubble.style.cssText = `
        background: #f8fafc;
        border-radius: 18px 18px 18px 4px;
        padding: 12px 16px;
        margin: 8px 0;
        max-width: 85%;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border: 1px solid #f1f5f9;
        line-height: 1.4;
        word-wrap: break-word;
      `;
      
      if (options.typing) {
        bubble.innerHTML = `
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        `;
      } else {
        bubble.innerHTML = msg.replace(/\n/g, "<br/>");
      }
      
      chatBody.appendChild(bubble);
      scrollToBottom();
    };

    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble user-bubble";
      bubble.style.cssText = `
        background: ${theme.gradient};
        color: white;
        border-radius: 18px 18px 4px 18px;
        padding: 12px 16px;
        margin: 8px 0;
        align-self: flex-end;
        max-width: 85%;
        box-shadow: 0 4px 12px ${theme.primary}33;
        line-height: 1.4;
        word-wrap: break-word;
      `;
      bubble.innerHTML = msg;
      chatBody.appendChild(bubble);
      scrollToBottom();
    };

    const scrollToBottom = () => {
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 100);
    };

    // Enhanced Back to Menu Button
    const renderBackToMenu = () => {
      const existing = document.getElementById("back-to-menu-btn");
      if (existing) existing.remove();

      const backBtn = document.createElement("button");
      backBtn.id = "back-to-menu-btn";
      backBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Main Menu
      `;
      
      Object.assign(backBtn.style, {
        width: "calc(100% - 20px)",
        margin: "12px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "14px",
        border: `2px solid ${theme.primary}`,
        borderRadius: "12px",
        background: "#fff",
        color: theme.primary,
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.2s ease",
      });

      backBtn.onmouseenter = () => {
        backBtn.style.background = theme.primary + "15";
        backBtn.style.transform = "translateY(-1px)";
      };
      backBtn.onmouseleave = () => {
        backBtn.style.background = "#fff";
        backBtn.style.transform = "translateY(0)";
      };
      backBtn.onclick = () => showGreeting();

      const footer = chatWindow.querySelector("#chat-footer");
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(backBtn, footer);
      } else {
        chatWindow.appendChild(backBtn);
      }
    };

    // Enhanced Menu Button
    const renderMenuButton = (menu, isSubmenu = false) => {
      const btn = document.createElement("button");
      btn.className = isSubmenu ? "submenu-btn" : "menu-btn";
      btn.innerHTML = `
        <span>${menu.title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      `;
      
      Object.assign(btn.style, {
        width: "100%",
        margin: "8px 0",
        padding: "16px",
        border: `2px solid ${theme.primary}`,
        borderRadius: "12px",
        background: isSubmenu ? "#f8fafc" : "#fff",
        color: theme.primary,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.2s ease",
        textAlign: "left",
      });

      btn.onmouseenter = () => {
        btn.style.background = theme.primary + "15";
        btn.style.transform = "translateY(-2px)";
        btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      };
      btn.onmouseleave = () => {
        btn.style.background = isSubmenu ? "#f8fafc" : "#fff";
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "none";
      };
      btn.onclick = () => isSubmenu ? handleSubmenu(menu) : showSubMenus(menu);
      
      chatBody.appendChild(btn);
    };

    // Enhanced API Helpers
    async function fetchWithRetry(url, options = {}, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          if (response.ok) return response.json();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    async function fetchMenus() {
      try {
        showLoader("Loading menu...");
        const menus = await fetchWithRetry(`${config.backend}/menus`);
        hideLoader();
        return menus;
      } catch (e) {
        hideLoader();
        throw e;
      }
    }

    async function fetchSubMenus(menuId) {
      try {
        showLoader("Loading options...");
        const submenus = await fetchWithRetry(`${config.backend}/menus/${menuId}/submenus`);
        hideLoader();
        return submenus;
      } catch (e) {
        hideLoader();
        throw e;
      }
    }

    // Enhanced Intent Handlers
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
          <div class="bubble bot-bubble" style="background:#fff;border:2px solid ${theme.primary}20;">
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
      if (checkAndTriggerLogin(payload, "Please login to check your profile details.")) return;

      const profile = payload.customerProfile;
    
      if (!profile) {
        renderBotMessage("Sorry, I couldn't fetch your profile details.");
        renderBackToMenu();
        return;
      }
    
      const chatMsg = payload?.data?.chat_message || profile?.chat_message || "";
    
      if (chatMsg.trim() !== "") {
        renderBotMessage(chatMsg);
      } else {
        renderBotMessage("<b>👤 Customer Profile:</b>");
    
        chatBody.innerHTML += `
          <div class="bubble bot-bubble" style="background:#fff;border:2px solid ${theme.primary}20;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:48px;height:48px;border-radius:50%;background:${theme.gradient};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">
                ${(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight:700;font-size:16px;">${profile.name || "N/A"}</div>
                <div style="color:#666;font-size:13px;">${profile.email || "N/A"}</div>
              </div>
            </div>
            <div style="display:grid;gap:8px;">
              <div><b>📱 Mobile:</b> ${profile.signInMobile || "N/A"}</div>
              <div><b>👤 Gender:</b> ${profile.gender || "N/A"}</div>
              ${
                profile.defaultAddress
                  ? `<div><b>📍 Address:</b> ${profile.defaultAddress.line1 || ""}, ${profile.defaultAddress.town || ""}, ${profile.defaultAddress.region?.name || ""}, ${profile.defaultAddress.country?.name || ""} - ${profile.defaultAddress.postalCode || ""}</div>`
                  : "<div><b>📍 Address:</b> N/A</div>"
              }
            </div>
          </div>`;
      }
    
      renderBackToMenu();
    }

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
          <button onclick="triggerChatLogin()" style="
            background: ${theme.gradient};
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 auto;
          " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
            🔐 Click to Login
          </button>
        `);

        renderBackToMenu();
        return true;
      }

      return false;
    }

    // Enhanced Copy to Clipboard
    window.copyToClipboard = async function (text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast("✅ Order number copied!");
      } catch {
        showToast("❌ Copy failed. Please copy manually.", true);
      }
    };

    function showToast(message, isError = false) {
      let toast = document.getElementById("chat-copy-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "chat-copy-toast";
        Object.assign(toast.style, {
          position: "fixed",
          bottom: "160px",
          right: "30px",
          background: isError ? "#dc2626" : "#059669",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "10px",
          zIndex: 10000,
          opacity: 0,
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          transform: "translateY(20px)",
        });
        document.body.appendChild(toast);
      }
      
      toast.textContent = message;
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
      
      clearTimeout(toast._t);
      toast._t = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
      }, 2000);
    }

    // Enhanced Order Card
    const renderOrderCard = (o) => {
      const orderNumber = extractOrderNumber(o.orderNo);
      const orderUrl = o.orderNo && o.orderNo.startsWith("http")
        ? o.orderNo
        : `${window.location.origin}/my-account/order/${orderNumber}`;
      
      const statusColor = getStatusColor(o.latestStatus);
      
      return `
        <div class="bubble bot-bubble" style="background:#fff;border:2px solid ${theme.primary}20;padding:16px;border-radius:16px;margin:12px 0;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <img src="${o.imageURL || 'https://via.placeholder.com/80'}" 
                 style="width:80px;height:80px;border-radius:12px;object-fit:cover;border:2px solid #f1f5f9;">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">
                <div style="font-weight:700;color:#1e293b;font-size:15px;line-height:1.3;">${o.productName || "Product"}</div>
                ${o.latestStatus ? `<span style="
                  padding:4px 10px;
                  font-weight:600;
                  font-size:11px;
                  color:white;
                  background:${statusColor};
                  border-radius:20px;
                  white-space:nowrap;">${o.latestStatus}</span>` : ''}
              </div>
              
              <div style="font-size:13px;color:#64748b;margin-bottom:8px;">
                ${o.color || ""}${o.size ? " • " + o.size : ""}
              </div>
              
              <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                <div style="font-size:13px;"><strong>Qty:</strong> ${o.qty || 1}</div>
                <div style="font-size:13px;"><strong>Net:</strong> ${o.netAmount || "-"}</div>
              </div>
              
              <div style="background:#f8fafc;padding:10px;border-radius:8px;margin-bottom:12px;">
                <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:4px;">
                  Order No: <span style="color:#1e293b;">${orderNumber}</span>
                </div>
                ${o.orderAmount ? `<div style="font-size:13px;color:#475569;"><strong>Amount:</strong> ₹${o.orderAmount}</div>` : ''}
                ${o.estmtDate ? `<div style="font-size:13px;color:#475569;"><strong>ETA:</strong> ${o.estmtDate}</div>` : ''}
              </div>
              
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                  <button style="
                    background:${theme.gradient};
                    color:#fff;
                    padding:10px 16px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                    font-size:13px;
                    font-weight:600;
                    transition:all 0.2s ease;
                    display:flex;
                    align-items:center;
                    gap:6px;
                  " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
                    📦 View Order
                  </button>
                </a>
                <button onclick="copyToClipboard('${orderNumber}')" style="
                  background:#fff;
                  border:2px solid ${theme.primary};
                  color:${theme.primary};
                  padding:10px 16px;
                  border-radius:10px;
                  cursor:pointer;
                  font-size:13px;
                  font-weight:600;
                  transition:all 0.2s ease;
                  display:flex;
                  align-items:center;
                  gap:6px;
                " onmouseenter="this.style.transform='scale(1.05)';this.style.background='${theme.primary}15'" 
                   onmouseleave="this.style.transform='scale(1)';this.style.background='#fff'">
                  📋 Copy Order #
                </button>
              </div>
            </div>
          </div>
        </div>`;
    };

    function getStatusColor(status) {
      if (!status) return theme.primary;
      const statusLower = status.toLowerCase();
      if (statusLower.includes('delivered')) return '#10b981';
      if (statusLower.includes('shipped')) return '#3b82f6';
      if (statusLower.includes('processing')) return '#f59e0b';
      if (statusLower.includes('cancelled')) return '#ef4444';
      return theme.primary;
    }

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

    // Enhanced Send Message
    async function sendMessage(type, userMessage) {
      const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`;
      try {
        showLoader("Thinking...");
        const body = {
          message: userMessage,
          question: userMessage,
          userId: config.userid,
          concept: config.concept,
          env: config.env,
          appid: config.appid,
        };
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        
        hideLoader();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        console.log("🧠 Chatbot Response:", json);
        
        const intent = json.intent || json.data?.intent || "DEFAULT";
        let payload = typeof json.data === "string" ? { chat_message: json.data } : json.data || json;
        const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS.DEFAULT;
        handler(payload);
      } catch (e) {
        hideLoader();
        console.error("❌ Chatbot error:", e);
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }

    // Enhanced Menu Functions
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`);
      renderBotMessage("How can I help you today? Choose an option below 👇");
      
      try {
        const menus = await fetchMenus();
        menus.forEach((menu) => renderMenuButton(menu));
      } catch (e) {
        renderBotMessage("⚠️ Unable to load menu right now. Please try again later.");
      }
      
      renderBackToMenu();
    }

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      
      // Show typing indicator
      renderBotMessage("", { typing: true });
      
      try {
        const subs = await fetchSubMenus(menu.id);
        // Remove typing indicator
        const lastBubble = chatBody.lastChild;
        if (lastBubble?.querySelector('.typing-indicator')) {
          lastBubble.remove();
        }
        
        if (!subs?.length) {
          renderBotMessage("No sub-options found for this category.");
          renderBackToMenu();
          return;
        }
        
        renderBotMessage(`Here are the options for <b>${menu.title}</b>:`);
        subs.forEach((sub) => renderMenuButton(sub, true));
      } catch (e) {
        // Remove typing indicator
        const lastBubble = chatBody.lastChild;
        if (lastBubble?.querySelector('.typing-indicator')) {
          lastBubble.remove();
        }
        renderBotMessage("⚠️ Unable to load options. Please try again.");
      }
      
      renderBackToMenu();
    }

    async function handleSubmenu(sub) {
      clearBody();
      renderUserMessage(sub.title);
      
      if (sub.title.toLowerCase().includes("near") && sub.title.toLowerCase().includes("store")) {
        await handleNearbyStore();
        renderBackToMenu();
        return;
      }
      
      if (sub.title.toLowerCase().includes("gift") && sub.title.toLowerCase().includes("card")) {
        await handleGiftCardBalance();
        renderBackToMenu();
        return;
      }
      
      renderBotMessage(`Please enter your question about <b>${sub.title}</b>.`);
      inputContainer.style.display = "flex";
      inputField.focus();
      
      const sendMessageHandler = () => {
        const msg = inputField.value.trim();
        if (!msg) return;
        renderUserMessage(msg);
        sendMessage(sub.type, msg);
        inputField.value = "";
      };
      
      sendButton.onclick = sendMessageHandler;
      inputField.onkeypress = (e) => {
        if (e.key === "Enter") sendMessageHandler();
      };
      
      renderBackToMenu();
    }

    // Enhanced Gift Card Balance
    async function handleGiftCardBalance() {
      renderBotMessage("🎁 Please enter your gift card number to check your balance:");
    
      const inputContainer = document.createElement("div");
      Object.assign(inputContainer.style, {
        display: "flex",
        alignItems: "center",
        marginTop: "12px",
        gap: "8px",
        flexWrap: "wrap",
      });
    
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter 16-digit Gift Card Number";
      input.maxLength = 16;
      input.pattern = "[0-9]*";
      input.style.cssText = `
        flex: 1;
        min-width: 200px;
        padding: 12px 14px;
        border: 2px solid ${theme.primary};
        border-radius: 12px;
        outline: none;
        font-size: 14px;
        transition: all 0.2s ease;
      `;
    
      input.onfocus = () => {
        input.style.borderColor = theme.secondary;
        input.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
      };
      input.onblur = () => {
        input.style.borderColor = theme.primary;
        input.style.boxShadow = "none";
      };
    
      const button = document.createElement("button");
      button.textContent = "Check Balance";
      Object.assign(button.style, {
        background: theme.gradient,
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "12px 20px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      });
    
      button.onmouseenter = () => {
        button.style.background = theme.hover;
        button.style.transform = "translateY(-1px)";
      };
      button.onmouseleave = () => {
        button.style.background = theme.gradient;
        button.style.transform = "translateY(0)";
      };
    
      inputContainer.appendChild(input);
      inputContainer.appendChild(button);
      chatBody.appendChild(inputContainer);
      scrollToBottom();
    
      button.onclick = async () => {
        const cardNumber = input.value.trim();
    
        if (!cardNumber || !/^[0-9]{6,19}$/.test(cardNumber)) {
          renderBotMessage("⚠️ Please enter a valid gift card number (6-19 digits).");
          return;
        }
    
        renderUserMessage(`🔢 Gift Card: ${cardNumber}`);
        renderBotMessage("💳 Checking your gift card balance...");
    
        try {
          showLoader("Fetching balance...");
    
          const res = await fetch(`${config.backend}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardNumber,
              concept: config.concept,
              env: 'www',
              appid: config.appid,
              userId: config.userid,
              message: "Check my gift card balance"
            }),
          });
    
          hideLoader();
          const json = await res.json();
          const data = json?.data || json;
          const g = data?.giftCardDetails || data;
    
          if (g?.errorOccurred) {
            const errorReason = g?.errors?.[0]?.message || "";
            if (errorReason === "lmg.giftcard.card.not.found") {
              renderBotMessage("❌ Invalid gift card number. Please check and try again.");
            } else if (errorReason === "lmg.giftcard.client.server.error") {
              renderBotMessage("⚠️ Gift card service is currently unavailable. Please try later.");
            } else {
              renderBotMessage("😔 Unable to fetch your gift card balance. Please try again later.");
            }
          } else if (g?.balanceAmount != null) {
            renderBotMessage(data.chat_message || "Here's your gift card balance:");
            chatBody.innerHTML += `
              <div class="bubble bot-bubble"
                   style="background:#fff;border:2px solid ${theme.primary}20;
                          border-radius:16px;padding:16px;margin:12px 0;
                          box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                <div style="display:grid;gap:8px;">
                  <div><b>🎴 Card Number:</b> ${g.cardNumber || "N/A"}</div>
                  <div><b>📊 Status:</b> ${g.status || "N/A"}</div>
                  <div><b>💬 Message:</b> ${g.message || "N/A"}</div>
                  <div style="background:${theme.gradient};color:white;padding:12px;border-radius:8px;text-align:center;margin-top:8px;">
                    <b>💰 Balance:</b> ₹${g.balanceAmount?.toFixed(2) || "0.00"} ${g.currency || "INR"}
                  </div>
                </div>
              </div>
            `;
          } else {
            renderBotMessage("😔 Unable to fetch your gift card balance. Please try again later.");
          }
    
          renderBackToMenu();
          scrollToBottom();
    
        } catch (err) {
          hideLoader();
          console.error("❌ Gift card balance error:", err);
          renderBotMessage("⚠️ Something went wrong while checking your gift card balance.");
          renderBackToMenu();
        }
      };
    }

    // Enhanced Nearby Store
    async function handleNearbyStore() {
      renderBotMessage("📍 Finding nearby stores...");
      
      if (!navigator.geolocation) {
        renderBotMessage("⚠️ Geolocation is not supported by your browser.");
        renderBackToMenu();
        return;
      }
    
      // Show location permission request in a friendly way
      const permissionBubble = document.createElement("div");
      permissionBubble.className = "bubble bot-bubble";
      permissionBubble.style.cssText = `
        background: #fff3cd;
        border: 2px solid #ffc107;
        border-radius: 12px;
        padding: 12px 16px;
        margin: 8px 0;
      `;
      permissionBubble.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="color:#856404;">📍</span>
          <span style="font-weight:600;color:#856404;">Location Access Needed</span>
        </div>
        <div style="color:#856404;font-size:13px;">
          We need your location to find nearby stores. Please allow location access when prompted.
        </div>
      `;
      chatBody.appendChild(permissionBubble);
      scrollToBottom();
    
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          
          // Remove permission bubble
          permissionBubble.remove();
          
          renderBotMessage(`✅ Found your location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
          renderBotMessage("🔍 Searching for nearby stores...");
          
          try {
            showLoader("Finding nearby stores...");
            
            const res = await fetch(`${config.backend}/chat/nearby-stores`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: lat,
                longitude: lon,
                concept: config.concept,
                env: config.env,
                appId: config.appid,
                userId: config.userid,
              }),
            });
            
            hideLoader();
            const json = await res.json();
            
            if (json?.data?.stores?.length) {
              renderBotMessage(`🏪 Found ${json.data.stores.length} store(s) near you:`);
              
              json.data.stores.forEach((s, index) => {
                const distance = s.distance ? `(${s.distance} away)` : '';
                chatBody.innerHTML += `
                  <div class="bubble bot-bubble" style="background:#fff;border:2px solid ${theme.primary}20;border-radius:16px;padding:16px;margin:12px 0;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                      <div style="font-weight:700;color:#1e293b;font-size:15px;">${s.storeName}</div>
                      <div style="font-size:12px;color:#64748b;">${distance}</div>
                    </div>
                    
                    <div style="color:#475569;font-size:13px;margin-bottom:8px;line-height:1.4;">
                      📍 ${s.line1 || ''} ${s.line2 ? ', ' + s.line2 : ''} ${s.postalCode ? ' - ' + s.postalCode : ''}
                    </div>
                    
                    ${s.contactNumber ? `
                      <div style="color:#475569;font-size:13px;margin-bottom:6px;">
                        📞 ${s.contactNumber}
                      </div>
                    ` : ''}
                    
                    ${s.workingHours ? `
                      <div style="color:#475569;font-size:13px;margin-bottom:12px;">
                        🕒 ${s.workingHours}
                      </div>
                    ` : ''}
                    
                    <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                       style="display:inline-flex;align-items:center;gap:6px;background:${theme.gradient};color:white;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;transition:all 0.2s ease;"
                       onmouseenter="this.style.transform='scale(1.05)'" 
                       onmouseleave="this.style.transform='scale(1)'">
                      🗺️ View on Map
                    </a>
                  </div>`;
              });
            } else {
              renderBotMessage("😔 No nearby stores found. Please try a different location.");
            }
          } catch (err) {
            hideLoader();
            console.error("❌ Store fetch error:", err);
            renderBotMessage("⚠️ Error fetching store list. Please try again.");
          }
          
          renderBackToMenu();
        },
        (error) => {
          permissionBubble.remove();
          
          let errorMsg = "❌ Unable to access your location. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += "Please allow location access to find nearby stores.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMsg += "Location request timed out. Please try again.";
              break;
            default:
              errorMsg += "Please try again.";
          }
          
          renderBotMessage(errorMsg);
          renderBackToMenu();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }

    // Global login trigger
    window.triggerChatLogin = function() {
      setTimeout(() => {
        const signupBtn = document.getElementById("account-actions-signup");
        if (signupBtn) {
          signupBtn.click();
          console.log("🔑 Triggered signup/login popup automatically");
        } else {
          console.warn("⚠️ Signup button not found (id='account-actions-signup').");
          showToast("⚠️ Please login manually from the website header", true);
        }
      }, 600);
    };

    // Initialize chat
    showGreeting();
  }

  // Enhanced Floating Button
  function createFloatingButton(chatWindow, showGreeting) {
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.setAttribute("aria-label", "Open chat");
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    
    button.innerHTML = `
      <div class="chat-fab-inner">
        <div class="chat-fab-icon">
          <img src="${theme.logo}" alt="${config.concept}" class="chat-fab-logo">
        </div>
        <div class="chat-fab-badge">💬</div>
        <div class="chat-fab-pulse"></div>
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
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });

    // Hover and focus effects
    button.onmouseenter = () => {
      button.style.transform = "scale(1.1)";
      button.style.boxShadow = `0 8px 25px ${theme.primary}40`;
    };
    button.onmouseleave = () => {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "none";
    };
    button.onfocus = () => {
      button.style.transform = "scale(1.1)";
      button.style.boxShadow = `0 0 0 3px ${theme.primary}40`;
    };
    button.onblur = () => {
      button.style.transform = "scale(1)";
      button.style.boxShadow = "none";
    };

    button.onclick = (e) => {
      e.preventDefault();
      const chatWindowEl = document.getElementById("chatbot-container");
      const isVisible = chatWindowEl.style.display === "flex";
      chatWindowEl.style.display = isVisible ? "none" : "flex";
      if (!isVisible) {
        showGreeting();
        // Add focus trap for accessibility
        setTimeout(() => chatWindowEl.querySelector('button, input')?.focus(), 100);
      }
    };

    // Keyboard support
    button.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        button.click();
      }
    };

    document.body.appendChild(button);

    // Enhanced responsive positioning
    function adjustFabForViewport() {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      if (vw < 420) {
        button.style.right = "16px";
        button.style.bottom = "16px";
        button.style.width = "60px";
        button.style.height = "60px";
      } else if (vw < 768) {
        button.style.right = "20px";
        button.style.bottom = "20px";
      } else {
        button.style.right = "25px";
        button.style.bottom = "25px";
      }
    }
    
    adjustFabForViewport();
    window.addEventListener("resize", adjustFabForViewport);
    window.addEventListener("orientationchange", adjustFabForViewport);
  }

  // Enhanced Chat Window
  function createChatWindow() {
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.setAttribute("aria-label", "Chat with customer service");
    chatWindow.setAttribute("role", "dialog");
    chatWindow.setAttribute("aria-modal", "true");
    
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 25px;
      width: min(420px, 90vw);
      height: min(680px, 80vh);
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      border: 2px solid ${theme.primary};
      z-index: 9998;
      backdrop-filter: blur(10px);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease;
    `;

    const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept);
    const logoFilter = isDarkHeader ? "filter: brightness(0) invert(1);" : "";

    chatWindow.innerHTML = `
      <style>
        /* Enhanced Chatbot Styles */
        #chatbot-container {
          animation: chatSlideIn 0.3s ease forwards;
        }
        
        @keyframes chatSlideIn {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        #chatbot-container .chat-header { 
          padding: 16px 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          font-weight: 700;
          background: ${theme.gradient};
          color: ${theme.darkText ? '#1e293b' : 'white'};
          position: relative;
        }
        
        #chatbot-container .bubble { 
          max-width: 85%; 
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        
        #chatbot-container .bot-bubble { 
          background: #f8fafc;
          border-radius: 18px 18px 18px 4px;
        }
        
        #chatbot-container .user-bubble {
          border-radius: 18px 18px 4px 18px;
        }
        
        #chatbot-container #chat-body { 
          padding: 16px; 
          background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
        }
        
        #chatbot-container button { 
          font-family: inherit;
          transition: all 0.2s ease;
        }
        
        #chatbot-container button:active {
          transform: scale(0.98);
        }

        /* Enhanced Loader */
        #chatbot-container .chat-loader { 
          position: absolute; 
          inset: 0; 
          display: none; 
          align-items: center; 
          justify-content: center; 
          background: rgba(255,255,255,0.95); 
          z-index: 9998; 
          backdrop-filter: blur(4px);
        }
        
        #chatbot-container .chat-loader-inner { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 12px; 
          padding: 20px; 
          border-radius: 16px;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        #chatbot-container .chat-spinner { 
          width: 44px; 
          height: 44px; 
          position: relative;
        }
        
        #chatbot-container .spinner-circle {
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid ${theme.primary};
          border-radius: 50%;
          animation: chat-spin 1s linear infinite;
        }
        
        @keyframes chat-spin { 
          to { transform: rotate(360deg); } 
        }
        
        #chatbot-container .chat-loader-text { 
          font-size: 14px; 
          color: #475569; 
          font-weight: 600; 
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBounce 1.4s ease-in-out infinite both;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Enhanced Responsive Design */
        @media (max-width: 420px) {
          #chatbot-container { 
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          
          #chatbot-container #chat-input-container input { 
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
          
          .chat-fab-inner {
            transform: scale(0.9);
          }
        }
        
        @media (max-width: 768px) and (min-width: 421px) {
          #chatbot-container {
            right: 16px !important;
            bottom: 80px !important;
          }
        }

        /* Enhanced Floating Button */
        .chat-fab-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .chat-fab-icon {
          background: white;
          border: 3px solid ${theme.primary};
          border-radius: 50%;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        
        .chat-fab-logo {
          width: 42px;
          height: auto;
          object-fit: contain;
          transition: all 0.3s ease;
        }
        
        .chat-fab-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: ${theme.primary};
          color: white;
          border-radius: 50%;
          padding: 6px;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          animation: badgePulse 2s ease-in-out infinite;
        }
        
        .chat-fab-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid ${theme.primary};
          border-radius: 50%;
          animation: fabPulse 2s ease-out infinite;
        }
        
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes fabPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Enhanced Input */
        #chatbot-container #chat-input {
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        #chatbot-container #chat-input:focus {
          border-color: ${theme.primary} !important;
          box-shadow: 0 0 0 3px ${theme.primary}33 !important;
        }
        
        #chatbot-container #chat-send:hover {
          background: ${theme.hover} !important;
          transform: translateY(-1px);
        }

        /* Scrollbar Styling */
        #chatbot-container #chat-body::-webkit-scrollbar {
          width: 6px;
        }
        
        #chatbot-container #chat-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        #chatbot-container #chat-body::-webkit-scrollbar-thumb {
          background: ${theme.primary}80;
          border-radius: 3px;
        }
        
        #chatbot-container #chat-body::-webkit-scrollbar-thumb:hover {
          background: ${theme.primary};
        }

        /* Focus management for accessibility */
        #chatbot-container button:focus-visible,
        #chatbot-container input:focus-visible,
        #chatbot-container a:focus-visible {
          outline: 3px solid ${theme.primary}80;
          outline-offset: 2px;
        }
      </style>
      
      <div class="chat-header">
        <span style="display:flex;align-items:center;gap:10px;">
          <img src="${theme.logo}" style="height:24px;${logoFilter}" alt="${config.concept} logo">
          <span style="font-size:16px;">Chat Support</span>
        </span>
        <button id="close-chat" style="background:none;border:none;color:inherit;cursor:pointer;padding:8px;border-radius:8px;transition:all 0.2s ease;" 
                aria-label="Close chat"
                onmouseenter="this.style.background='rgba(255,255,255,0.2)'"
                onmouseleave="this.style.background='none'">
          ✕
        </button>
      </div>
      
      <div id="chat-body" style="flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;gap:4px;"></div>
      
      <div id="chat-input-container" style="display:none;border-top:1px solid #e2e8f0;align-items:center;padding:12px;gap:10px;background:white;">
        <input id="chat-input" 
               placeholder="Type your message..." 
               style="flex:1;padding:12px 16px;border-radius:12px;border:2px solid #e2e8f0;outline:none;min-height:48px;font-size:14px;"
               aria-label="Type your message">
        <button id="chat-send" 
                style="background:${theme.gradient};color:white;border:none;padding:12px 20px;border-radius:12px;cursor:pointer;font-weight:600;transition:all 0.2s ease;min-width:80px;"
                aria-label="Send message">
          Send
        </button>
      </div>
      
      <div id="chat-footer" style="text-align:center;font-size:12px;padding:12px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;">
        Powered by <img src="${theme.logo}" style="height:18px;margin-left:6px;vertical-align:middle;"> Chat Service
      </div>
      
      <div class="chat-loader" role="status" aria-live="polite" aria-label="Loading"></div>`;

    document.body.appendChild(chatWindow);

    // Enhanced close button with animation
    chatWindow.querySelector("#close-chat").onclick = () => {
      chatWindow.style.transform = "translateY(20px)";
      chatWindow.style.opacity = "0";
      setTimeout(() => {
        chatWindow.style.display = "none";
      }, 300);
    };

    return chatWindow;
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }

})();