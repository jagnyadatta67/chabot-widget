;(() => {
  const scriptTag =
    document.currentScript || Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop()

  // --- Config ---
  const config = {
    backend: "https://6aaf2dea1fc1.ngrok-free.app/api/chat",
    userid: scriptTag?.getAttribute("data-userid") || window.CHATBOT_CONFIG?.userid || "UNKNOWN_USER",
    concept: (scriptTag?.getAttribute("data-concept") || window.CHATBOT_CONFIG?.concept || "LIFESTYLE").toUpperCase(),
    appid: scriptTag?.getAttribute("data-appid") || window.CHATBOT_CONFIG?.appid || "UNKNOWN_APP",
    env: scriptTag?.getAttribute("data-env") || window.CHATBOT_CONFIG?.env || "uat5",
  }

  console.log("💎 Chatbot Config:", config)

  // --- Brand Themes ---
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      secondary: "#FFB84D",
      dark: "#1a1a1a",
      light: "#f8f9fa",
      logo: "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
    },
    MAX: {
      primary: "#303AB2",
      secondary: "#4A55E2",
      dark: "#1a1a1a",
      light: "#f8f9fa",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
    },
    BABYSHOP: {
      primary: "#819F83",
      secondary: "#9FC19F",
      dark: "#1a1a1a",
      light: "#f8f9fa",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
    },
    HOMECENTRE: {
      primary: "#7665A0",
      secondary: "#9988C4",
      dark: "#1a1a1a",
      light: "#f8f9fa",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
    },
  }

  const theme = BRAND_THEMES[config.concept] || BRAND_THEMES.LIFESTYLE

  function injectStyles() {
    const styleId = "chatbot-widget-styles"
    if (document.getElementById(styleId)) return

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      /* === CHATBOT WIDGET STYLES === */
      * {
        box-sizing: border-box;
      }

      /* Floating Button */
      #chatbot-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: white;
        border: 3px solid ${theme.primary};
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
      }

      #chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
      }

      #chatbot-button:active {
        transform: scale(0.95);
      }

      .chat-fab-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chat-fab-icon img {
        width: 48px;
        height: auto;
        object-fit: contain;
      }

      .chat-fab-badge {
        position: absolute;
        bottom: -8px;
        right: -8px;
        background: ${theme.primary};
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Chat Window */
      #chatbot-container {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: min(90vw, 420px);
        height: min(85vh, 680px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
      }

      #chatbot-container.open {
        display: flex;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Header */
      .chat-header {
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .chat-header-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }

     .chat-header-logo.max-concept {
        height: 24px;
        width: auto;
        object-fit: contain;
        filter: brightness(0) invert(1);
      }
      .chat-header-logo {
        height: 24px;
        width: auto;
        object-fit: contain;
       
      }

      .chat-header-title {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.3px;
      }

      #close-chat {
        cursor: pointer;
        font-size: 20px;
        opacity: 0.8;
        transition: opacity 0.2s;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #close-chat:hover {
        opacity: 1;
      }

      /* Chat Body */
      #chat-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: ${theme.light};
      }

      #chat-body::-webkit-scrollbar {
        width: 6px;
      }

      #chat-body::-webkit-scrollbar-track {
        background: transparent;
      }

      #chat-body::-webkit-scrollbar-thumb {
        background: ${theme.primary};
        border-radius: 3px;
        opacity: 0.5;
      }

      /* Message Bubbles */
      .bubble {
        display: flex;
        animation: fadeIn 0.3s ease-out;
        word-wrap: break-word;
        max-width: 85%;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .bot-bubble {
        align-self: flex-start;
        background: white;
        color: ${theme.dark};
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
      }

      .user-bubble {
        align-self: flex-end;
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        color: white;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }

      /* Input Container */
      #chat-input-container {
        display: none;
        border-top: 1px solid #e5e7eb;
        padding: 12px;
        gap: 8px;
        background: white;
        flex-shrink: 0;
      }

      #chat-input-container.active {
        display: flex;
      }

      #chat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
        min-height: 40px;
      }

      #chat-input:focus {
        border-color: ${theme.primary};
        box-shadow: 0 0 0 3px rgba(${hexToRgb(theme.primary)}, 0.1);
      }

      #chat-send {
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      #chat-send:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      #chat-send:active {
        transform: translateY(0);
      }

      /* Loader */
      .chat-loader {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9998;
        backdrop-filter: blur(2px);
      }

      .chat-loader.active {
        display: flex;
      }

      .chat-loader-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .chat-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 0, 0, 0.08);
        border-top-color: ${theme.primary};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .chat-loader-text {
        font-size: 13px;
        color: ${theme.dark};
        font-weight: 500;
      }

      /* Menu Buttons */
      .menu-btn, .submenu-btn, #back-to-menu-btn {
        width: 100%;
        padding: 12px 14px;
        margin: 6px 0;
        border: 1.5px solid ${theme.primary};
        border-radius: 10px;
        background: white;
        color: ${theme.primary};
        cursor: pointer;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
        font-family: inherit;
      }

      .menu-btn:hover, .submenu-btn:hover, #back-to-menu-btn:hover {
        background: ${theme.light};
        transform: translateX(-2px);
      }

      .menu-btn:active, .submenu-btn:active, #back-to-menu-btn:active {
        transform: translateX(0);
      }

      .submenu-btn.dynamic {
        background: #f0f4ff;
      }

      /* Order Card */
      .order-card {
        background: white;
        border: 1px solid ${theme.primary};
        border-radius: 12px;
        padding: 12px;
        margin-top: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        display: flex;
        gap: 12px;
      }

      .order-card-image {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        object-fit: cover;
        border: 1px solid #e5e7eb;
        flex-shrink: 0;
      }

      .order-card-content {
        flex: 1;
        min-width: 0;
      }

      .order-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }

      .order-card-title {
        font-weight: 700;
        color: ${theme.dark};
        font-size: 14px;
      }

      .order-status-badge {
        display: inline-block;
        padding: 4px 8px;
        font-weight: 600;
        font-size: 11px;
        color: white;
        background: ${theme.primary};
        border-radius: 4px;
        white-space: nowrap;
      }

      .order-card-meta {
        font-size: 13px;
        color: #666;
        margin-bottom: 8px;
      }

      .order-card-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      .order-btn {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
        font-family: inherit;
      }

      .order-btn-primary {
        background: ${theme.primary};
        color: white;
      }

      .order-btn-primary:hover {
        opacity: 0.9;
      }

      .order-btn-secondary {
        background: white;
        border: 1px solid ${theme.primary};
        color: ${theme.primary};
      }

      .order-btn-secondary:hover {
        background: ${theme.light};
      }

      /* Profile Card */
      .profile-card {
        background: white;
        border: 1px solid ${theme.primary};
        border-radius: 12px;
        padding: 14px;
        margin-top: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .profile-field {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        line-height: 1.5;
      }

      .profile-field:last-child {
        border-bottom: none;
      }

      .profile-label {
        font-weight: 600;
        color: ${theme.dark};
        min-width: 80px;
        flex-shrink: 0;
      }

      .profile-value {
        color: #555;
        text-align: right;
        flex: 1;
        margin-left: 12px;
        word-break: break-word;
      }

      @media (max-width: 480px) {
        .profile-field {
          flex-direction: column;
          align-items: flex-start;
        }

        .profile-value {
          text-align: left;
          margin-left: 0;
          margin-top: 4px;
        }
      }

      /* Toast */
      #chat-copy-toast {
        position: fixed;
        bottom: 160px;
        right: 30px;
        background: ${theme.dark};
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideInUp 0.3s ease-out;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Gift Card Input */
      .gift-card-input-container {
        display: flex;
        align-items: center;
        margin-top: 10px;
        gap: 8px;
      }

      .gift-card-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid ${theme.primary};
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        font-family: inherit;
      }

      .gift-card-input:focus {
        box-shadow: 0 0 0 3px rgba(${hexToRgb(theme.primary)}, 0.1);
      }

      .gift-card-btn {
        background: ${theme.primary};
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s;
        font-family: inherit;
      }

      .gift-card-btn:hover {
        opacity: 0.9;
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        #chatbot-button {
          bottom: 16px;
          right: 16px;
          width: 56px;
          height: 56px;
        }

        .chat-fab-icon img {
          width: 40px;
        }

        #chatbot-container {
          bottom: 80px;
          right: 12px;
          left: 12px;
          width: calc(100% - 24px);
          height: calc(100vh - 100px);
          border-radius: 12px;
        }

        .bubble {
          max-width: 90%;
        }

        #chat-body {
          padding: 12px;
          gap: 10px;
        }

        .order-card {
          flex-direction: column;
        }

        .order-card-image {
          width: 100%;
          height: 120px;
        }

        #chat-copy-toast {
          bottom: 100px;
          right: 16px;
          left: 16px;
        }
      }

      @media (max-width: 360px) {
        #chatbot-button {
          width: 52px;
          height: 52px;
        }

        .chat-fab-icon img {
          width: 36px;
        }

        .chat-header-title {
          font-size: 13px;
        }

        .bubble {
          max-width: 95%;
        }
      }
    `
    document.head.appendChild(style)
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
      : "0, 0, 0"
  }

  function initChatWidget() {
    injectStyles()

    const chatWindow = createChatWindow()
    const chatBody = chatWindow.querySelector("#chat-body")
    const inputContainer = chatWindow.querySelector("#chat-input-container")
    const inputField = chatWindow.querySelector("#chat-input")
    const sendButton = chatWindow.querySelector("#chat-send")
    const loader = chatWindow.querySelector(".chat-loader")

    function showLoader(message = "Please wait...") {
      const loaderText = loader.querySelector(".chat-loader-text")
      if (loaderText) loaderText.textContent = message
      loader.classList.add("active")
    }

    function hideLoader() {
      loader.classList.remove("active")
    }

    const clearBody = () => (chatBody.innerHTML = "")

    const renderBotMessage = (msg) => {
      const bubble = document.createElement("div")
      bubble.className = "bubble bot-bubble"
      bubble.innerHTML = msg.replace(/\n/g, "<br/>")
      chatBody.appendChild(bubble)
      chatBody.scrollTop = chatBody.scrollHeight
    }

    const renderUserMessage = (msg) => {
      const bubble = document.createElement("div")
      bubble.className = "bubble user-bubble"
      bubble.innerHTML = msg
      chatBody.appendChild(bubble)
      chatBody.scrollTop = chatBody.scrollHeight
    }

    const renderBackToMenu = () => {
      const existing = document.getElementById("back-to-menu-btn")
      if (existing) existing.remove()

      const backBtn = document.createElement("button")
      backBtn.id = "back-to-menu-btn"
      backBtn.textContent = "⬅️ Back to Main Menu"
      backBtn.onclick = () => showGreeting()

      const footer = chatWindow.querySelector("#chat-footer")
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(backBtn, footer)
      } else {
        chatWindow.appendChild(backBtn)
      }
    }

    async function fetchMenus() {
      try {
        showLoader("Loading menu...")
        const res = await fetch(`${config.backend}/menus`)
        hideLoader()
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      } catch (e) {
        hideLoader()
        console.error("❌ Menu fetch error:", e)
        throw e
      }
    }

    async function fetchSubMenus(menuId) {
      try {
        showLoader("Loading options...")
        const res = await fetch(`${config.backend}/menus/${menuId}/submenus`)
        hideLoader()
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      } catch (e) {
        hideLoader()
        console.error("❌ Submenu fetch error:", e)
        throw e
      }
    }

    const INTENT_HANDLERS = {
      POLICY_QUESTION: handleGeneralIntent,
      GENERAL_QUERY: handleGeneralIntent,
      ORDER_TRACKING: handleOrderTracking,
      CUSTOMER_PROFILE: handleCustomerProfile,
      DEFAULT: handleDefaultIntent,
    }

    function handleGeneralIntent(payload) {
      renderBotMessage(payload.chat_message || "No information found.")
      renderBackToMenu()
    }

    function handleDefaultIntent(payload) {
      renderBotMessage(payload.chat_message || payload.data || "No response available.")
      renderBackToMenu()
    }

    function handleOrderTracking(payload) {
      if (checkAndTriggerLogin(payload, "Please login to check your order details.")) return
      if (payload.chat_message && payload.chat_message.trim() !== "") {
        renderBotMessage(payload.chat_message)
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>")
        chatBody.innerHTML += `
          <div class="bubble bot-bubble">
            <b>Name:</b> ${payload.customerName || "N/A"}<br/>
            <b>Mobile:</b> ${payload.mobileNo || "N/A"}
          </div>`

        if (Array.isArray(payload.orderDetailsList) && payload.orderDetailsList.length > 0) {
          payload.orderDetailsList.forEach((o) => {
            chatBody.innerHTML += renderOrderCard(o)
          })
        } else {
          renderBotMessage("No recent orders found.")
        }
      }
      renderBackToMenu()
    }

    function handleCustomerProfile(payload) {
      if (checkAndTriggerLogin(payload, "Please login to check your profile details.")) return

      const profile = payload.customerProfile
      if (!profile) {
        renderBotMessage("Sorry, I couldn't fetch your profile details.")
        renderBackToMenu()
        return
      }

      const chatMsg = payload?.data?.chat_message || profile?.chat_message || ""
      if (chatMsg.trim() !== "") {
        renderBotMessage(chatMsg)
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>")

        const profileCard = document.createElement("div")
        profileCard.className = "profile-card"

        const fields = [
          { label: "Name", value: profile.name || "N/A" },
          { label: "Email", value: profile.email || "N/A" },
          { label: "Mobile", value: profile.signInMobile || "N/A" },
          { label: "Gender", value: profile.gender || "N/A" },
          {
            label: "Address",
            value: profile.defaultAddress
              ? `${profile.defaultAddress.line1 || ""}, ${profile.defaultAddress.town || ""}, ${
                  profile.defaultAddress.region?.name || ""
                }, ${profile.defaultAddress.country?.name || ""} - ${profile.defaultAddress.postalCode || ""}`
              : "N/A",
          },
        ]

        fields.forEach((field) => {
          const fieldDiv = document.createElement("div")
          fieldDiv.className = "profile-field"
          fieldDiv.innerHTML = `
            <span class="profile-label">${field.label}:</span>
            <span class="profile-value">${field.value}</span>
          `
          profileCard.appendChild(fieldDiv)
        })

        chatBody.appendChild(profileCard)
        chatBody.scrollTop = chatBody.scrollHeight
      }
      renderBackToMenu()
    }

    function checkAndTriggerLogin(payload, defaultMsg = "Please login to continue.") {
      const cht = payload?.data?.chat_message || payload?.chat_message || ""
      const normalizedMsg = cht.trim().toLowerCase()

      const isLoginPrompt =
        normalizedMsg.includes("login") ||
        normalizedMsg.includes("sign in") ||
        normalizedMsg.includes("signin") ||
        normalizedMsg.includes("anonymous user")

      if (isLoginPrompt) {
        renderBotMessage(`
          ${cht || defaultMsg}
          <br><br>
          <a href="#" id="chat-login-link" style="color:${theme.primary}; text-decoration:underline; cursor:pointer; font-weight:600;">
            🔐 Click here to Login
          </a>
        `)

        setTimeout(() => {
          const loginLink = document.getElementById("chat-login-link")
          if (loginLink) {
            loginLink.addEventListener("click", (e) => {
              e.preventDefault()
              const signupBtn = document.getElementById("account-actions-signup")
              if (signupBtn) {
                signupBtn.click()
                console.log("🔑 Login popup triggered from chat link")
              }
            })
          }
        }, 300)

        renderBackToMenu()
        return true
      }
      return false
    }

    function extractOrderNumber(orderNo) {
      if (!orderNo) return "N/A"
      try {
        const m = orderNo.match(/\/order\/([^/?#]+)/i)
        if (m && m[1]) return m[1]
        const m2 = orderNo.match(/(\d{5,})/)
        if (m2) return m2[1]
        return orderNo.split("?")[0].split("#")[0]
      } catch {
        return orderNo
      }
    }

    window.copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        let toast = document.getElementById("chat-copy-toast")
        if (!toast) {
          toast = document.createElement("div")
          toast.id = "chat-copy-toast"
          document.body.appendChild(toast)
        }
        toast.textContent = "✅ Order number copied!"
        toast.style.display = "block"
        clearTimeout(toast._t)
        toast._t = setTimeout(() => (toast.style.display = "none"), 1600)
      } catch {
        alert("Copy failed. Please copy manually.")
      }
    }

    const renderOrderCard = (o) => {
      const orderNumber = extractOrderNumber(o.orderNo)
      const orderUrl =
        o.orderNo && o.orderNo.startsWith("http")
          ? o.orderNo
          : `${window.location.origin}/my-account/order/${orderNumber}`
      const returnMsg = o.returnAllow ? "✅ Return Available" : "🚫 No Return"
      const exchangeMsg = o.exchangeAllow ? "♻️ Exchange Available" : "🚫 No Exchange"
      const statusBadge = o.latestStatus ? `<span class="order-status-badge">${o.latestStatus}</span>` : ""

      return `
        <div class="order-card">
          <img src="${o.imageURL || "https://via.placeholder.com/80"}" alt="Product" class="order-card-image">
          <div class="order-card-content">
            <div class="order-card-header">
              <div class="order-card-title">${o.productName || "Product"}</div>
              ${statusBadge}
            </div>
            <div class="order-card-meta">${o.color || ""}${o.size ? " | " + o.size : ""}</div>
            <div class="order-card-meta"><strong>Qty:</strong> ${o.qty || 1} | <strong>Net:</strong> ${o.netAmount || "-"}</div>
            <div class="order-card-meta"><strong>Order #:</strong> ${orderNumber}</div>
            <div class="order-card-actions">
              <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                <button class="order-btn order-btn-primary">View Order</button>
              </a>
              <button class="order-btn order-btn-secondary" onclick="copyToClipboard('${orderNumber}')">Copy Order #</button>
            </div>
            ${o.orderAmount ? `<div class="order-card-meta"><strong>Amount:</strong> ₹${o.orderAmount}</div>` : ""}
            ${o.estmtDate ? `<div class="order-card-meta"><strong>ETA:</strong> ${o.estmtDate}</div>` : ""}
            <div class="order-card-meta">${returnMsg} | ${exchangeMsg}</div>
          </div>
        </div>`
    }

    async function sendMessage(type, userMessage) {
      const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`
      try {
        showLoader("Thinking...")
        const body = {
          message: userMessage,
          question: userMessage,
          userId: config.userid,
          concept: config.concept,
          env: config.env,
          appid: config.appid,
        }
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        hideLoader()
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        console.log("🧠 Chatbot Response:", json)
        const intent = json.intent || json.data?.intent || "DEFAULT"
        const payload = typeof json.data === "string" ? { chat_message: json.data } : json.data || json
        const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS.DEFAULT
        handler(payload)
      } catch (e) {
        hideLoader()
        console.error("❌ Chatbot error:", e)
        renderBotMessage("⚠️ Something went wrong. Please try again.")
        renderBackToMenu()
      }
    }

    async function showGreeting() {
      clearBody()
      inputContainer.classList.remove("active")
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`)
      renderBotMessage("Please choose an option below 👇")
      try {
        const menus = await fetchMenus()
        menus.forEach((menu) => renderMenuButton(menu))
      } catch (e) {
        renderBotMessage("⚠️ Unable to load menu right now.")
      }
      renderBackToMenu()
    }

    const renderMenuButton = (menu) => {
      const btn = document.createElement("button")
      btn.className = "menu-btn"
      btn.textContent = menu.title
      btn.onclick = () => showSubMenus(menu)
      chatBody.appendChild(btn)
    }

    async function showSubMenus(menu) {
      clearBody()
      renderUserMessage(menu.title)
      renderBotMessage(`Fetching options for <b>${menu.title}</b>...`)
      try {
        const subs = await fetchSubMenus(menu.id)
        if (!subs?.length) {
          renderBotMessage("No sub-options found.")
          renderBackToMenu()
          return
        }
        subs.forEach((sub) => renderSubmenuButton(sub))
      } catch (e) {
        renderBotMessage("⚠️ Unable to load options.")
      }
      renderBackToMenu()
    }

    const renderSubmenuButton = (sub) => {
      const sbtn = document.createElement("button")
      sbtn.className = `submenu-btn ${sub.type === "dynamic" ? "dynamic" : ""}`
      sbtn.textContent = sub.title
      sbtn.onclick = () => handleSubmenu(sub)
      chatBody.appendChild(sbtn)
    }

    async function handleSubmenu(sub) {
      clearBody()
      renderUserMessage(sub.title)
      if (sub.title.toLowerCase().includes("near") && sub.title.toLowerCase().includes("store")) {
        await handleNearbyStore()
        renderBackToMenu()
        return
      }
      if (sub.title.toLowerCase().includes("gift") && sub.title.toLowerCase().includes("card")) {
        await handleGiftCardBalance()
        renderBackToMenu()
        return
      }
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b>.`)
      inputContainer.classList.add("active")
      sendButton.onclick = () => {
        const msg = inputField.value.trim()
        if (!msg) return
        renderUserMessage(msg)
        sendMessage(sub.type, msg)
        inputField.value = ""
      }
      renderBackToMenu()
    }

    async function handleGiftCardBalance() {
      renderBotMessage("🎁 Please enter your gift card number below to check your balance:")

      const inputContainer = document.createElement("div")
      inputContainer.className = "gift-card-input-container"

      const input = document.createElement("input")
      input.type = "text"
      input.className = "gift-card-input"
      input.placeholder = "Enter 16-digit Gift Card Number"
      input.maxLength = 16
      input.pattern = "[0-9]*"

      const button = document.createElement("button")
      button.className = "gift-card-btn"
      button.textContent = "Check Balance"

      inputContainer.appendChild(input)
      inputContainer.appendChild(button)
      chatBody.appendChild(inputContainer)
      chatBody.scrollTop = chatBody.scrollHeight

      button.onclick = async () => {
        const cardNumber = input.value.trim()

        if (!cardNumber || !/^[0-9]{6,19}$/.test(cardNumber)) {
          renderBotMessage("⚠️ Please enter a valid gift card number (numbers only).")
          return
        }

        renderUserMessage(`🔢 Gift Card: ${cardNumber}`)
        renderBotMessage("💳 Checking your gift card balance...")

        try {
          showLoader("Fetching balance...")

          const res = await fetch(`${config.backend}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cardNumber,
              concept: config.concept,
              env: "www",
              appid: config.appid,
              userId: config.userid,
              message: "Check my gift card balance",
            }),
          })

          hideLoader()

          const json = await res.json()
          const data = json?.data || json
          const g = data?.giftCardDetails || data

          if (g?.errorOccurred) {
            const errorReason = g?.errors?.[0]?.message || ""
            if (errorReason === "lmg.giftcard.card.not.found") {
              renderBotMessage("❌ Invalid gift card number. Please check and try again.")
            } else if (errorReason === "lmg.giftcard.client.server.error") {
              renderBotMessage("⚠️ Gift card service is currently unavailable. Please try later.")
            } else {
              renderBotMessage("😔 Unable to fetch your gift card balance. Please try again later.")
            }
          } else if (g?.balanceAmount != null) {
            renderBotMessage(data.chat_message || "Here's your gift card balance:")
            chatBody.innerHTML += `
              <div class="bubble bot-bubble" style="border:1px solid ${theme.primary};">
                <b>Card Number:</b> ${g.cardNumber || "N/A"}<br/>
                <b>Status:</b> ${g.status || "N/A"}<br/>
                <b>Message:</b> ${g.message || "N/A"}<br/>
                <b>Balance:</b> ₹${g.balanceAmount?.toFixed(2) || "0.00"} ${g.currency || "INR"}
              </div>
            `
          } else {
            renderBotMessage("😔 Unable to fetch your gift card balance. Please try again later.")
          }

          renderBackToMenu()
          chatBody.scrollTop = chatBody.scrollHeight
        } catch (err) {
          hideLoader()
          console.error("❌ Gift card balance error:", err)
          renderBotMessage("⚠️ Something went wrong while checking your gift card balance.")
          renderBackToMenu()
        }
      }
    }

    async function handleNearbyStore() {
      renderBotMessage("📍 Detecting your location...")
      if (!navigator.geolocation) {
        renderBotMessage("⚠️ Geolocation not supported.")
        showPincodeOption()
        return
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords
          renderBotMessage(`✅ Found location (${lat.toFixed(4)}, ${lon.toFixed(4)})`)
          renderBotMessage("Fetching nearby stores...")
          await fetchNearbyStores({ latitude: lat, longitude: lon })
        },
        () => {
          renderBotMessage("❌ Permission denied for location.")
          showPincodeOption()
        },
      )
    }
    
    function showPincodeOption() {
      const pincodeContainer = document.createElement("div")
      pincodeContainer.id = "pincode-fallback"
      pincodeContainer.style.cssText = `
        display: flex;
        gap: 12px;
        margin: 16px 0;
        padding: 16px;
        border: 2px solid #f5a623;
        border-radius: 8px;
        background-color: #fafafa;
        align-items: center;
      `
    
      const label = document.createElement("div")
      label.style.cssText = `
        font-size: 14px;
        font-weight: 500;
        color: #333;
        min-width: 140px;
        line-height: 1.4;
      `
      label.textContent = "No problem! Enter your pincode to find nearby stores:"
    
      const inputWrapper = document.createElement("div")
      inputWrapper.style.cssText = `
        display: flex;
        gap: 8px;
        flex: 1;
      `
    
      const input = document.createElement("input")
      input.type = "text"
      input.id = "pincode-input"
      input.placeholder = "Enter pincode"
      input.style.cssText = `
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      `
    
      const button = document.createElement("button")
      button.textContent = "Search"
      button.style.cssText = `
        padding: 10px 24px;
        background-color: #f5a623;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      `
    
      button.addEventListener("click", () => handlePincodeSearch(input.value))
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handlePincodeSearch(input.value)
      })
    
      inputWrapper.appendChild(input)
      inputWrapper.appendChild(button)
      pincodeContainer.appendChild(label)
      pincodeContainer.appendChild(inputWrapper)
      chatBody.appendChild(pincodeContainer)
      input.focus()
    }
    
    async function handlePincodeSearch(pincode) {
      if (!pincode || pincode.trim().length === 0) {
        renderBotMessage("⚠️ Please enter a valid pincode.")
        return
      }
    
      renderBotMessage(`🔍 Searching stores for pincode: ${pincode}`)
      await fetchNearbyStores({ pincode: pincode.trim() })
    }
    
    async function fetchNearbyStores(params) {
      try {
        showLoader("Finding stores...")
        const payload = {
          concept: config.concept,
          env: config.env,
          appId: config.appid,
          userId: config.userid,
          ...params,
        }
    
        const res = await fetch(`${config.backend}/chat/nearby-stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
    
        hideLoader()
        const json = await res.json()
    
        if (json?.data?.stores?.length) {
          json.data.stores.forEach((s) => {
            chatBody.innerHTML += `
              <div class="bubble bot-bubble" style="border:1px solid ${theme.primary};">
                <b>${s.storeName}</b><br/>
                ${s.line1 || ""} ${s.line2 ? "- " + s.line2 : ""} ${s.postalCode ? "- " + s.postalCode : ""}<br/>
                ${s.contactNumber ? "📞 " + s.contactNumber + "<br/>" : ""}
                ${s.workingHours ? "🕒 " + s.workingHours + "<br/>" : ""}
                <a href="https://www.google.com/maps?q=${s.latitude},${s.longitude}" target="_blank"
                   style="color:${theme.primary};font-weight:600;text-decoration:none;">📍 View on Map</a>
              </div>`
          })
        } else {
          renderBotMessage("😔 No nearby stores found.")
        }
        renderBackToMenu()
      } catch (err) {
        hideLoader()
        renderBotMessage("⚠️ Error fetching store list.")
        renderBackToMenu()
      }
    }

    createFloatingButton(chatWindow, showGreeting)
  }

  function createFloatingButton(chatWindow, showGreeting) {
    const button = document.createElement("div")
    button.id = "chatbot-button"
    button.innerHTML = `
      <div class="chat-fab-icon">
        <img src="${theme.logo}" alt="${config.concept}" />
      </div>
      <div class="chat-fab-badge">💬</div>`

    document.body.appendChild(button)

    button.onclick = () => {
      chatWindow.classList.toggle("open")
      if (chatWindow.classList.contains("open")) {
        showGreeting()
      }
    }

    function adjustFabForViewport() {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      if (vw < 480) {
        button.style.bottom = "16px"
        button.style.right = "16px"
      } else {
        button.style.bottom = "24px"
        button.style.right = "24px"
      }
    }

    adjustFabForViewport()
    window.addEventListener("resize", adjustFabForViewport)
  }

  function createChatWindow() {
    const chatWindow = document.createElement("div")
    chatWindow.id = "chatbot-container"

    const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept)

    chatWindow.innerHTML = `
     <div class="chat-header">
  <div class="chat-header-content">
    <img
      src="${theme.logo}"
      alt="${config.concept} logo"
      class="chat-header-logo ${config.concept === 'MAX' || config.concept === 'HOMECENTRE' ? 'max-concept' : ''}"
    />
    <span class="chat-header-title">Chat Service</span>
  </div>
  <span id="close-chat">✖</span>
</div>

      <div id="chat-body"></div>
      <div id="chat-input-container">
        <input id="chat-input" placeholder="Type your message..." />
        <button id="chat-send">Send</button>
      </div>
      <div id="chat-footer" style="text-align:center;font-size:12px;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        Powered by ${config.concept}
      </div>
      <div class="chat-loader" role="status" aria-live="polite">
        <div class="chat-loader-inner">
          <div class="chat-spinner"></div>
          <div class="chat-loader-text">Please wait...</div>
        </div>
      </div>`

    document.body.appendChild(chatWindow)

    chatWindow.querySelector("#close-chat").onclick = () => {
      chatWindow.classList.remove("open")
    }

    return chatWindow
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget)
  } else {
    initChatWidget()
  }
})()
