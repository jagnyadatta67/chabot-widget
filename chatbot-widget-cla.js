(function () {
    const scriptTag =
      document.currentScript ||
      Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();
  
    // --- Inject CSS Styles ---
    const style = document.createElement('style');
    style.textContent = `
      /* ====================================
         CHATBOT WIDGET - RESPONSIVE CSS
         ==================================== */
  
      /* Base Container Styles */
      #chatbot-container {
        position: fixed;
        bottom: 90px;
        right: 25px;
        width: 360px;
        height: 540px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        z-index: 9999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
  
      /* Floating Button */
      #chatbot-button {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        animation: pulse 2s infinite;
      }
  
      #chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }
  
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        50% {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
      }
  
      /* Chat Header */
      .chatbot-header {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: white;
        flex-shrink: 0;
      }
  
      #close-chat {
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
  
      #close-chat:hover {
        background: rgba(255, 255, 255, 0.2);
      }
  
      /* Chat Body */
      #chat-body {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        font-size: 14px;
        background: #fafafa;
        scroll-behavior: smooth;
      }
  
      /* Custom Scrollbar */
      #chat-body::-webkit-scrollbar {
        width: 6px;
      }
  
      #chat-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
  
      #chat-body::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
      }
  
      #chat-body::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }
  
      /* Chat Bubbles */
      .bubble {
        word-wrap: break-word;
        word-break: break-word;
        animation: slideIn 0.3s ease-out;
      }
  
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
  
      .bot-bubble {
        background: #f3f4f6;
        border-radius: 12px;
        padding: 8px 12px;
        margin: 6px 0;
        max-width: 88%;
        align-self: flex-start;
      }
  
      .user-bubble {
        border-radius: 12px;
        padding: 8px 12px;
        margin: 6px 0;
        align-self: flex-end;
        max-width: 88%;
        color: white;
      }
  
      /* Menu & Submenu Buttons */
      #chat-body button {
        width: 100%;
        margin: 6px 0;
        padding: 10px 12px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        text-align: left;
      }
  
      #chat-body button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
  
      #chat-body button:active {
        transform: translateY(0);
      }
  
      /* Back to Menu Button */
      #back-to-menu-btn {
        width: 90%;
        margin: 10px auto;
        display: block;
        padding: 10px;
        border-radius: 10px;
        background: #fff;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      }
  
      #back-to-menu-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
  
      /* Input Container */
      #chat-input-container {
        border-top: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        background: white;
      }
  
      #chat-input {
        flex: 1;
        padding: 10px 12px;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
      }
  
      #chat-input::placeholder {
        color: #9ca3af;
      }
  
      #chat-send {
        border: none;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 600;
        color: white;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
  
      #chat-send:hover {
        opacity: 0.9;
      }
  
      #chat-send:active {
        opacity: 0.8;
      }
  
      /* Footer */
      #chat-footer {
        text-align: center;
        font-size: 12px;
        padding: 8px;
        background: #fafafa;
        border-top: 1px solid #eee;
        flex-shrink: 0;
        color: #6b7280;
      }
  
      #chat-footer img {
        height: 20px;
        margin-left: 5px;
        vertical-align: middle;
      }
  
      /* Order Cards */
      .bubble.bot-bubble img {
        display: block;
        max-width: 100%;
        height: auto;
      }
  
      /* Copy Toast Notification */
      #chat-copy-toast {
        position: fixed;
        bottom: 160px;
        right: 30px;
        background: #111;
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        z-index: 10000;
        opacity: 0.95;
        font-size: 13px;
        animation: fadeIn 0.3s ease-out;
      }
  
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 0.95;
          transform: translateY(0);
        }
      }
  
      /* Links in Chat */
      #chat-body a {
        color: #007bff;
        text-decoration: underline;
        transition: color 0.2s;
      }
  
      #chat-body a:hover {
        color: #0056b3;
      }
  
      /* ====================================
         RESPONSIVE BREAKPOINTS
         ==================================== */
  
      /* Tablets (768px and below) */
      @media screen and (max-width: 768px) {
        #chatbot-container {
          width: 340px;
          height: 500px;
          right: 15px;
          bottom: 80px;
        }
  
        #chatbot-button {
          width: 60px;
          height: 60px;
          right: 15px;
          bottom: 15px;
        }
  
        #chatbot-button > div > div:first-child {
          width: 55px;
          height: 55px;
        }
  
        #chatbot-button img {
          width: 48px !important;
        }
  
        .bot-bubble,
        .user-bubble {
          max-width: 90%;
          font-size: 13px;
        }
      }
  
      /* Mobile Landscape & Small Tablets (667px and below) */
      @media screen and (max-width: 667px) {
        #chatbot-container {
          width: 320px;
          height: 480px;
          max-height: calc(100vh - 100px);
        }
  
        #chat-body {
          padding: 8px;
        }
  
        #chat-body button {
          padding: 9px 10px;
          font-size: 13px;
        }
      }
  
      /* Mobile Portrait (480px and below) */
      @media screen and (max-width: 480px) {
        #chatbot-container {
          width: calc(100vw - 20px);
          max-width: 380px;
          height: 460px;
          right: 10px;
          bottom: 75px;
          border-radius: 12px;
        }
  
        #chatbot-button {
          width: 56px;
          height: 56px;
          right: 10px;
          bottom: 10px;
        }
  
        #chatbot-button > div > div:first-child {
          width: 50px;
          height: 50px;
        }
  
        #chatbot-button img {
          width: 44px !important;
        }
  
        .bot-bubble,
        .user-bubble {
          font-size: 13px;
          padding: 7px 10px;
        }
  
        #chat-input {
          font-size: 13px;
          padding: 9px 10px;
        }
  
        #chat-send {
          padding: 9px 14px;
          font-size: 13px;
        }
  
        #back-to-menu-btn {
          width: 92%;
          padding: 9px;
          font-size: 13px;
        }
  
        #chat-footer {
          font-size: 11px;
          padding: 6px;
        }
  
        #chat-footer img {
          height: 18px;
        }
      }
  
      /* Small Mobile (375px and below) */
      @media screen and (max-width: 375px) {
        #chatbot-container {
          width: calc(100vw - 16px);
          height: 440px;
          right: 8px;
          bottom: 70px;
        }
  
        #chatbot-button {
          width: 52px;
          height: 52px;
          right: 8px;
          bottom: 8px;
        }
  
        #chatbot-button > div > div:first-child {
          width: 46px;
          height: 46px;
        }
  
        #chatbot-button img {
          width: 40px !important;
        }
  
        #chat-body {
          padding: 6px;
          font-size: 12px;
        }
  
        .bot-bubble,
        .user-bubble {
          font-size: 12px;
          padding: 6px 9px;
        }
  
        #chat-body button {
          padding: 8px 9px;
          font-size: 12px;
        }
      }
  
      /* Extra Small Mobile (320px) */
      @media screen and (max-width: 320px) {
        #chatbot-container {
          width: calc(100vw - 12px);
          height: 420px;
          right: 6px;
          bottom: 65px;
          border-radius: 10px;
        }
  
        #chatbot-button {
          width: 48px;
          height: 48px;
          right: 6px;
          bottom: 6px;
        }
  
        #chatbot-button > div > div:first-child {
          width: 42px;
          height: 42px;
          border-width: 2px;
        }
  
        #chatbot-button img {
          width: 36px !important;
        }
  
        .bot-bubble,
        .user-bubble {
          font-size: 11px;
          padding: 6px 8px;
          margin: 4px 0;
        }
  
        #chat-input {
          font-size: 12px;
          padding: 8px;
        }
  
        #chat-send {
          padding: 8px 12px;
          font-size: 12px;
        }
      }
  
      /* ====================================
         LANDSCAPE ORIENTATION ADJUSTMENTS
         ==================================== */
  
      @media screen and (max-height: 500px) and (orientation: landscape) {
        #chatbot-container {
          height: calc(100vh - 80px);
          max-height: 380px;
          bottom: 65px;
        }
  
        #chatbot-button {
          width: 50px;
          height: 50px;
          bottom: 8px;
        }
  
        #chatbot-button > div > div:first-child {
          width: 44px;
          height: 44px;
        }
  
        #chat-body {
          padding: 6px;
        }
      }
  
      /* ====================================
         FULL SCREEN MOBILE (iPhone notch, etc.)
         ==================================== */
  
      @media screen and (max-width: 480px) {
        #chatbot-container {
          bottom: max(75px, env(safe-area-inset-bottom, 75px));
        }
  
        #chatbot-button {
          bottom: max(10px, env(safe-area-inset-bottom, 10px));
          right: max(10px, env(safe-area-inset-right, 10px));
        }
      }
  
      /* ====================================
         ACCESSIBILITY & UTILITY CLASSES
         ==================================== */
  
      #chat-input:focus,
      #chat-body button:focus,
      #back-to-menu-btn:focus,
      #chat-send:focus {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
  
      #chat-send:disabled,
      #chat-body button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
  
      .loading {
        opacity: 0.6;
        pointer-events: none;
      }
  
      .hidden {
        display: none !important;
      }
  
      #chatbot-container.show {
        display: flex;
        animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
  
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
  
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        #chatbot-button,
        #chatbot-container {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      }
  
      @media print {
        #chatbot-container,
        #chatbot-button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  
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
        bubble.innerHTML = msg.replace(/\n/g, "<br/>");
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      };
  
      const renderUserMessage = (msg) => {
        const bubble = document.createElement("div");
        bubble.className = "bubble user-bubble";
        bubble.style.background = theme.gradient;
        bubble.innerHTML = msg;
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      };
  
      // --- Back to Menu: always inserted above footer (bottom) ---
      const renderBackToMenu = () => {
        const existing = document.getElementById("back-to-menu-btn");
        if (existing) existing.remove();
  
        const backBtn = document.createElement("button");
        backBtn.id = "back-to-menu-btn";
        backBtn.textContent = "⬅️ Back to Main Menu";
        backBtn.style.border = `1px solid ${theme.primary}`;
        backBtn.style.color = theme.primary;
  
        backBtn.onclick = () => showGreeting();
  
        const footer = chatWindow.querySelector("#chat-footer");
        if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(backBtn, footer);
        } else {
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
          renderBotMessage("Sorry, I couldn't fetch your profile details.");
          renderBackToMenu();
          return;
        }
  
        const chatMsg = payload?.data?.chat_message || profile?.chat_message || "";
  
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
            <a href="#" id="chat-login-link" style="color:#007bff; text-decoration:underline; cursor:pointer;">
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
          ? `<span style="display:inline-block;padding:4px 8px;font-weight:600;font-size:12px;color:white;background:${theme.primary};margin-left:6px;border-radius:4px;">${o.latestStatus}</span>`
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
  
      // --- Send Message ---
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
  
      // --- Menus, Submenus, etc. ---
      async function showGreeting() {
        clearBody();
        inputContainer.style.display = "none";
        renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`);
        renderBotMessage("Please choose an option below 👇");
        const menus = await fetchMenus();
        menus.forEach((menu) => renderMenuButton(menu));
        renderBackToMenu();
      }
  
      const renderMenuButton = (menu) => {
        const btn = document.createElement("button");
        btn.textContent = menu.title;
        btn.style.border = `1px solid ${theme.primary}`;
        btn.style.background = "#fff";
        btn.style.color = theme.primary;
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
        const sbtn = document.createElement("button");
        sbtn.textContent = sub.title;
        sbtn.style.border = `1px solid ${theme.primary}`;
        sbtn.style.background = sub.type === "dynamic" ? "#EEF2FF" : "#fff";
        sbtn.style.color = theme.primary;
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
          <div style="position:absolute;bottom:-4px;right:-4px;background:${theme.primary};color:white;border-radius:50%;padding:5px;font-size:14px;">💬</div>
        </div>`;
      button.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
        if (chatWindow.style.display === "flex") showGreeting();
      };
      document.body.appendChild(button);
    }
  
    function createChatWindow() {
      const chatWindow = document.createElement("div");
      chatWindow.id = "chatbot-container";
      chatWindow.style.border = `2px solid ${theme.primary}`;
  
      const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept);
      const logoFilter = isDarkHeader ? "filter: brightness(0) invert(1);" : "";
  
      chatWindow.innerHTML = `
        <div class="chatbot-header" style="background:${theme.gradient};">
          <span style="display:flex;align-items:center;gap:8px;">
            <img src="${theme.logo}" style="height:22px;${logoFilter}" alt="${config.concept} logo">
            <span>Chat Service</span>
          </span>
          <span id="close-chat">✖</span>
        </div>
        <div id="chat-body"></div>
        <div id="chat-input-container" style="display:none;">
          <input id="chat-input" placeholder="Type your message...">
          <button id="chat-send" style="background:${theme.gradient};">Send</button>
        </div>
        <div id="chat-footer">
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