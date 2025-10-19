(function () {
  const scriptTag =
    document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();

  // --- Inject CSS Styles ---
  const style = document.createElement('style');
  style.textContent = `
    /* ====================================
       CHATBOT WIDGET - BEAUTIFUL DESIGN
       ==================================== */

    /* Base Container Styles */
    #chatbot-container {
      position: fixed;
      bottom: 90px;
      right: 25px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.05);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      z-index: 9999;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    }

    #chatbot-container.show {
      display: flex;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Floating Button with Gradient Ring */
    #chatbot-button {
      position: fixed;
      bottom: 25px;
      right: 25px;
      width: 75px;
      height: 75px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9999;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
    }

    #chatbot-button:hover {
      transform: scale(1.15) rotate(5deg);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(248, 159, 23, 0.4), 
                    0 0 40px rgba(248, 159, 23, 0.2);
      }
      50% { 
        box-shadow: 0 0 30px rgba(248, 159, 23, 0.6), 
                    0 0 60px rgba(248, 159, 23, 0.3);
      }
    }

    /* Chat Header with Glassmorphism */
    .chatbot-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
      position: relative;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .chatbot-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    }

    #close-chat {
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
      padding: 6px 10px;
      border-radius: 8px;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #close-chat:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: rotate(90deg);
    }

    /* Chat Body with Pattern Background */
    #chat-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      background: 
        radial-gradient(circle at 20% 50%, rgba(248, 159, 23, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(48, 58, 178, 0.03) 0%, transparent 50%),
        linear-gradient(to bottom, #fafbfc, #ffffff);
      scroll-behavior: smooth;
      position: relative;
    }

    /* Enhanced Scrollbar */
    #chat-body::-webkit-scrollbar {
      width: 8px;
    }

    #chat-body::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 10px;
      margin: 8px 0;
    }

    #chat-body::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #c1c1c1, #a8a8a8);
      border-radius: 10px;
      transition: background 0.3s;
    }

    #chat-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #a8a8a8, #909090);
    }

    /* Chat Bubbles with Advanced Styling */
    .bubble {
      word-wrap: break-word;
      word-break: break-word;
      animation: bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    @keyframes bubbleIn {
      from {
        opacity: 0;
        transform: translateY(15px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .bot-bubble {
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 16px 16px 16px 4px;
      padding: 12px 16px;
      margin: 8px 0;
      max-width: 85%;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      position: relative;
    }

    .bot-bubble::before {
      content: '🤖';
      position: absolute;
      left: -30px;
      top: 0;
      font-size: 20px;
      animation: wave 2s ease-in-out infinite;
    }

    @keyframes wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-20deg); }
    }

    .user-bubble {
      border-radius: 16px 16px 4px 16px;
      padding: 12px 16px;
      margin: 8px 0;
      align-self: flex-end;
      max-width: 85%;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
    }

    .user-bubble::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
      animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
      0% { transform: translate(-100%, -100%); }
      100% { transform: translate(100%, 100%); }
    }

    /* Menu & Submenu Buttons with Hover Effects */
    #chat-body button {
      width: 100%;
      margin: 8px 0;
      padding: 14px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-align: left;
      position: relative;
      overflow: hidden;
    }

    #chat-body button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    #chat-body button:hover::before {
      width: 300px;
      height: 300px;
    }

    #chat-body button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    #chat-body button:active {
      transform: translateY(-1px);
    }

    /* Back to Menu Button */
    #back-to-menu-btn {
      width: 90%;
      margin: 12px auto;
      display: block;
      padding: 12px;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    #back-to-menu-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    /* Input Container with Modern Design */
    #chat-input-container {
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      flex-shrink: 0;
      background: white;
      padding: 12px;
      gap: 10px;
    }

    #chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.3s;
      background: #fafbfc;
    }

    #chat-input:focus {
      border-color: currentColor;
      background: white;
      box-shadow: 0 0 0 3px rgba(248, 159, 23, 0.1);
    }

    #chat-input::placeholder {
      color: #9ca3af;
    }

    #chat-send {
      border: none;
      padding: 12px 20px;
      cursor: pointer;
      font-weight: 600;
      color: white;
      border-radius: 12px;
      transition: all 0.3s;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    #chat-send:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    #chat-send:active {
      transform: translateY(0);
    }

    /* Footer */
    #chat-footer {
      text-align: center;
      font-size: 11px;
      padding: 10px;
      background: linear-gradient(to top, #f8f9fa, white);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      flex-shrink: 0;
      color: #6b7280;
      font-weight: 500;
    }

    #chat-footer img {
      height: 18px;
      margin-left: 5px;
      vertical-align: middle;
      opacity: 0.8;
    }

    /* Loading Animation */
    .loading-spinner {
      display: inline-flex;
      gap: 4px;
      padding: 8px 0;
    }

    .loading-spinner span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-spinner span:nth-child(1) { animation-delay: -0.32s; }
    .loading-spinner span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Welcome Screen */
    .welcome-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .welcome-icon {
      font-size: 60px;
      margin-bottom: 20px;
      animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes bounce-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .welcome-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #F89F17, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    /* Promotional Banner */
    .promo-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      margin: 10px 0;
      text-align: center;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      animation: slideIn 0.5s ease-out;
      cursor: pointer;
      transition: transform 0.3s;
    }

    .promo-banner:hover {
      transform: scale(1.05);
    }

    .promo-banner .promo-icon {
      font-size: 24px;
      display: block;
      margin-bottom: 4px;
    }

    /* Enhanced Order Cards */
    .order-card {
      background: white;
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 16px;
      margin: 12px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }

    .order-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #F89F17, #ff6b6b);
    }

    .order-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: rgba(248, 159, 23, 0.3);
    }

    /* Copy Toast with Animation */
    #chat-copy-toast {
      position: fixed;
      bottom: 160px;
      right: 30px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      z-index: 10000;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
      animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Links in Chat */
    #chat-body a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
      border-bottom: 2px solid transparent;
    }

    #chat-body a:hover {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }

    /* Typing Indicator */
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px 16px 16px 4px;
      width: fit-content;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #cbd5e0;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-10px); opacity: 1; }
    }

    /* ====================================
       RESPONSIVE BREAKPOINTS
       ==================================== */

    @media screen and (max-width: 768px) {
      #chatbot-container {
        width: 360px;
        height: 550px;
        right: 15px;
        bottom: 80px;
      }

      #chatbot-button {
        width: 65px;
        height: 65px;
        right: 15px;
        bottom: 15px;
      }
    }

    @media screen and (max-width: 480px) {
      #chatbot-container {
        width: calc(100vw - 20px);
        max-width: 400px;
        height: 500px;
        right: 10px;
        bottom: 75px;
        border-radius: 16px;
      }

      #chatbot-button {
        width: 60px;
        height: 60px;
        right: 10px;
        bottom: 10px;
      }

      .bot-bubble,
      .user-bubble {
        font-size: 13px;
        padding: 10px 14px;
      }
    }

    @media screen and (max-width: 375px) {
      #chatbot-container {
        width: calc(100vw - 16px);
        height: 480px;
      }

      .welcome-icon { font-size: 50px; }
      .welcome-title { font-size: 20px; }
    }

    @media screen and (max-width: 480px) {
      #chatbot-container {
        bottom: max(75px, env(safe-area-inset-bottom, 75px));
      }

      #chatbot-button {
        bottom: max(10px, env(safe-area-inset-bottom, 10px));
        right: max(10px, env(safe-area-inset-right, 10px));
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
      gradient: "linear-gradient(135deg, #F89F17 0%, #ffb84d 100%)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
      welcomeIcon: "🛍️",
      messages: [
        "Discover amazing deals just for you! 🎉",
        "Shop now and save up to 50% on selected items! 💰",
        "New arrivals are waiting for you! ✨"
      ]
    },
    MAX: {
      primary: "#303AB2",
      gradient: "linear-gradient(135deg, #303AB2 0%, #4A55E2 100%)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
      welcomeIcon: "👔",
      messages: [
        "Upgrade your wardrobe today! 👗",
        "Fashion that fits your lifestyle! ✨",
        "Exclusive styles just arrived! 🎁"
      ]
    },
    BABYSHOP: {
      primary: "#819F83",
      gradient: "linear-gradient(135deg, #819F83 0%, #9FC19F 100%)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
      welcomeIcon: "👶",
      messages: [
        "Everything your little one needs! 🍼",
        "Safe, soft, and adorable collections! 💝",
        "New baby essentials just for you! 🌟"
      ]
    },
    HOMECENTRE: {
      primary: "#7665A0",
      gradient: "linear-gradient(135deg, #7665A0 0%, #9988C4 100%)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
      welcomeIcon: "🏠",
      messages: [
        "Transform your space into a dream home! 🛋️",
        "Stylish home decor at great prices! ✨",
        "Make your house feel like home! 💫"
      ]
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

    const showTypingIndicator = () => {
      const typing = document.createElement("div");
      typing.className = "typing-indicator";
      typing.id = "typing-indicator";
      typing.innerHTML = "<span></span><span></span><span></span>";
      chatBody.appendChild(typing);
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    const hideTypingIndicator = () => {
      const typing = document.getElementById("typing-indicator");
      if (typing) typing.remove();
    };

    const renderBotMessage = (msg) => {
      hideTypingIndicator();
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

    const renderPromoBanner = () => {
      const randomMsg = theme.messages[Math.floor(Math.random() * theme.messages.length)];
      const banner = document.createElement("div");
      banner.className = "promo-banner";
      banner.innerHTML = `
        <span class="promo-icon">🎁</span>
        ${randomMsg}
      `;
      banner.onclick = () => {
        window.location.href = window.location.origin;
      };
      chatBody.appendChild(banner);
    };

    const renderWelcomeScreen = () => {
      const welcome = document.createElement("div");
      welcome.className = "welcome-screen";
      welcome.innerHTML = `
        <div class="welcome-icon">${theme.welcomeIcon}</div>
        <div class="welcome-title">Welcome to ${config.concept}!</div>
        <div class="welcome-subtitle">
          I'm your personal shopping assistant. <br/>
          How can I help you today?
        </div>
      `;
      chatBody.appendChild(welcome);
    };

    // --- Back to Menu ---
    const renderBackToMenu = () => {
      const existing = document.getElementById("back-to-menu-btn");
      if (existing) existing.remove();

      const backBtn = document.createElement("button");
      backBtn.id = "back-to-menu-btn";
      backBtn.textContent = "⬅️ Back to Main Menu";
      backBtn.style.border = `2px solid ${theme.primary}`;
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
      showTypingIndicator();
      const res = await fetch(`${config.backend}/menus`);
      hideTypingIndicator();
      return res.json();
    }
    
    async function fetchSubMenus(menuId) {
      showTypingIndicator();
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
      hideTypingIndicator();
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
        renderBotMessage("<b>🧾 Your Orders</b>");
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
        renderBotMessage("<b>👤 Your Profile</b>");

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
          <a href="#" id="chat-login-link" style="color:#3b82f6; text-decoration:none; font-weight:600; border-bottom:2px solid #3b82f6;">
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
        toast._t = setTimeout(() => (toast.style.display = "none"), 2000);
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
      const returnMsg = o.returnAllow ? "✅ Return" : "🚫 No Return";
      const exchangeMsg = o.exchangeAllow ? "♻️ Exchange" : "🚫 No Exchange";
      const statusBadge = o.latestStatus
        ? `<span style="display:inline-block;padding:6px 12px;font-weight:700;font-size:11px;color:white;background:${theme.gradient};margin-left:6px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">${o.latestStatus}</span>`
        : "";
      return `
        <div class="order-card" style="border-color: ${theme.primary}20;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <img src="${o.imageURL || "https://via.placeholder.com/80"}" style="width:90px;height:90px;border-radius:12px;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div style="font-weight:700;color:#1f2937;font-size:15px;">${o.productName || "Product"}</div>
                ${statusBadge}
              </div>
              <div style="font-size:13px;color:#6b7280;margin-bottom:10px;">${o.color || ""}${o.size ? " | Size: " + o.size : ""}</div>
              <div style="display:flex;gap:16px;margin-bottom:12px;font-size:13px;">
                <span style="color:#374151;"><b>Qty:</b> ${o.qty || 1}</span>
                <span style="color:#374151;"><b>Amount:</b> ₹${o.netAmount || o.orderAmount || "-"}</span>
              </div>
              <div style="background:#f9fafb;padding:10px;border-radius:8px;margin-bottom:12px;">
                <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Order Number</div>
                <div style="font-weight:700;color:#111827;font-size:14px;">${orderNumber}</div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                  <button style="background:${theme.gradient};color:#fff;padding:8px 16px;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;box-shadow:0 2px 8px ${theme.primary}40;">📦 View Order</button>
                </a>
                <button onclick="copyToClipboard('${orderNumber}')" style="background:#fff;border:2px solid ${theme.primary};color:${theme.primary};padding:8px 16px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">📋 Copy #</button>
              </div>
              ${o.estmtDate ? `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;"><b>📅 Estimated Delivery:</b> ${o.estmtDate}</div>` : ""}
              <div style="display:flex;gap:12px;font-size:12px;color:#6b7280;">
                <span>${returnMsg}</span>
                <span>•</span>
                <span>${exchangeMsg}</span>
              </div>
            </div>
          </div>
        </div>`;
    };

    // --- Send Message ---
    async function sendMessage(type, userMessage) {
      const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`;
      showTypingIndicator();
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
        hideTypingIndicator();
        console.error("❌ Chatbot error:", e);
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }

    // --- Menus, Submenus ---
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      renderWelcomeScreen();
      renderBotMessage(`Hi there! 👋 I'm here to help you with:`);
      renderPromoBanner();
      const menus = await fetchMenus();
      menus.forEach((menu) => renderMenuButton(menu));
      renderBackToMenu();
    }

    const renderMenuButton = (menu) => {
      const icons = {
        'Order': '📦',
        'Profile': '👤',
        'Policy': '📋',
        'Store': '🏪',
        'Help': '💬',
        'Track': '🔍'
      };
      
      let icon = '•';
      for (let key in icons) {
        if (menu.title.toLowerCase().includes(key.toLowerCase())) {
          icon = icons[key];
          break;
        }
      }

      const btn = document.createElement("button");
      btn.innerHTML = `<span style="margin-right:8px;">${icon}</span>${menu.title}`;
      btn.style.border = `2px solid ${theme.primary}30`;
      btn.style.background = "white";
      btn.style.color = "#374151";
      btn.onclick = () => showSubMenus(menu);
      chatBody.appendChild(btn);
    };

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      renderBotMessage(`Great choice! Let me show you the options for <b>${menu.title}</b>...`);
      const subs = await fetchSubMenus(menu.id);
      if (!subs?.length) {
        renderBotMessage("No sub-options found at the moment. 😔");
        renderBackToMenu();
        return;
      }
      subs.forEach((sub) => renderSubmenuButton(sub));
      renderBackToMenu();
    }

    const renderSubmenuButton = (sub) => {
      const sbtn = document.createElement("button");
      sbtn.textContent = sub.title;
      sbtn.style.border = `2px solid ${theme.primary}`;
      sbtn.style.background = sub.type === "dynamic" ? `${theme.primary}15` : "white";
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
      renderBotMessage(`Perfect! 👍 Please type your question about <b>${sub.title}</b> below.`);
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
      renderBotMessage("📍 Let me find stores near you...");
      if (!navigator.geolocation) {
        renderBotMessage("⚠️ Geolocation is not supported by your browser.");
        return;
      }
      showTypingIndicator();
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          hideTypingIndicator();
          renderBotMessage(`✅ Location detected! Searching nearby stores...`);
          showTypingIndicator();
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
            hideTypingIndicator();
            if (json?.data?.stores?.length) {
              renderBotMessage(`🎉 Found <b>${json.data.stores.length}</b> store(s) near you!`);
              json.data.stores.forEach((s) => {
                chatBody.innerHTML += `
                  <div class="order-card">
                    <div style="margin-bottom:8px;">
                      <div style="font-weight:700;font-size:16px;color:#1f2937;margin-bottom:4px;">🏪 ${s.storeName}</div>
                      <div style="font-size:13px;color:#6b7280;line-height:1.6;">
                        📍 ${s.line1 || ""} ${s.line2 ? ", " + s.line2 : ""} ${s.postalCode ? "- " + s.postalCode : ""}
                      </div>
                    </div>
                    ${s.contactNumber ? `<div style="font-size:13px;color:#374151;margin:6px 0;"><b>📞 Contact:</b> ${s.contactNumber}</div>` : ""}
                    ${s.workingHours ? `<div style="font-size:13px;color:#374151;margin:6px 0;"><b>🕒 Hours:</b> ${s.workingHours}</div>` : ""}
                    <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                       style="display:inline-block;margin-top:10px;padding:8px 16px;background:${theme.gradient};color:white;text-decoration:none;border-radius:10px;font-weight:600;font-size:13px;box-shadow:0 2px 8px ${theme.primary}40;">
                      📍 Get Directions
                    </a>
                  </div>`;
              });
            } else {
              renderBotMessage("😔 No nearby stores found. Try searching in a different area.");
            }
            renderBackToMenu();
          } catch {
            hideTypingIndicator();
            renderBotMessage("⚠️ Error fetching store list. Please try again.");
            renderBackToMenu();
          }
        },
        () => {
          hideTypingIndicator();
          renderBotMessage("❌ Location permission denied. Please enable location access to find nearby stores.");
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
        <div style="background:white;border:4px solid ${theme.primary};border-radius:50%;width:67px;height:67px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
          <img src="${theme.logo}" alt="${config.concept}" style="width:58px;height:auto;object-fit:contain;">
        </div>
        <div style="position:absolute;bottom:-2px;right:-2px;background:${theme.gradient};color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">💬</div>
      </div>`;
    button.onclick = () => {
      if (chatWindow.style.display === "flex") {
        chatWindow.style.display = "none";
      } else {
        chatWindow.style.display = "flex";
        chatWindow.classList.add("show");
        showGreeting();
      }
    };
    document.body.appendChild(button);
  }

  function createChatWindow() {
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.style.border = `2px solid ${theme.primary}40`;

    const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept);
    const logoFilter = isDarkHeader ? "filter: brightness(0) invert(1);" : "";

    chatWindow.innerHTML = `
      <div class="chatbot-header" style="background:${theme.gradient};">
        <span style="display:flex;align-items:center;gap:10px;">
          <img src="${theme.logo}" style="height:24px;${logoFilter}" alt="${config.concept} logo">
          <span style="font-size:16px;">Chat Assistant</span>
        </span>
        <span id="close-chat">✖</span>
      </div>
      <div id="chat-body"></div>
      <div id="chat-input-container" style="display:none;">
        <input id="chat-input" placeholder="Type your message here...">
        <button id="chat-send" style="background:${theme.gradient};">Send</button>
      </div>
      <div id="chat-footer">
        Powered by <img src="${theme.logo}">
      </div>`;

    document.body.appendChild(chatWindow);

    chatWindow.querySelector("#close-chat").onclick = () => {
      chatWindow.style.display = "none";
    };
    return chatWindow;
  }

  // --- Initialize ---
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();