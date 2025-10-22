(function () {
  // -------------------------
  // Config (customize here)
  // -------------------------
  const scriptTag =
    document.currentScript ||
    Array.from(document.querySelectorAll('script[src*="chatbot-widget.js"]')).pop();

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

  // -------------------------
  // Themes
  // -------------------------
  const BRAND_THEMES = {
    LIFESTYLE: {
      primary: "#F89F17",
      gradient: "linear-gradient(135deg,#F89F17,#ffb84d)",
      logo:
        "https://assets-cloud.landmarkshops.in/website_images/static-pages/brand_exp/brand2images/logos/prod/lifestyle-logo-136x46.svg",
    },
    MAX: {
      primary: "#303AB2",
      gradient: "linear-gradient(135deg,#303AB2,#4A55E2)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-max.svg",
    },
    BABYSHOP: {
      primary: "#819F83",
      gradient: "linear-gradient(135deg,#819F83,#9FC19F)",
      logo: "https://assets-cloud.landmarkshops.in/website_images/in/logos/logo-babyshop.svg",
    },
    HOMECENTRE: {
      primary: "#7665A0",
      gradient: "linear-gradient(135deg,#7665A0,#9988C4)",
      logo:
        "https://assets-cloud.landmarkshops.in/website_images/in/logos/new-logo-homecentre.svg",
    },
  };
  const theme = BRAND_THEMES[config.concept] || BRAND_THEMES.LIFESTYLE;

  // -------------------------
  // Small helpers
  // -------------------------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel || ""));
  const ce = (tag, cls) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  };

  // -------------------------
  // Init
  // -------------------------
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }

  // -------------------------
  // Main
  // -------------------------
  function initChatWidget() {
    // create UI elements
    const chatWindow = createChatWindow();
    const chatBody = $("#lmgChat-body", chatWindow);
    const inputContainer = $("#lmgChat-input-container", chatWindow);
    const inputField = $("#lmgChat-input", chatWindow);
    const sendButton = $("#lmgChat-send", chatWindow);

    // loader / spinner
    function showLoader(message = "Please wait...") {
      let loader = $(".lmgChat-loader", chatWindow);
      if (!loader) {
        loader = ce("div", "lmgChat-loader");
        loader.innerHTML = `
          <div class="lmgChat-loader-inner" role="status" aria-live="polite">
            <div class="lmgChat-spinner" aria-hidden="true"></div>
            <div class="lmgChat-loader-text">${message}</div>
          </div>`;
        chatWindow.appendChild(loader);
      } else {
        const txt = loader.querySelector(".lmgChat-loader-text");
        if (txt) txt.textContent = message;
      }
      loader.style.display = "flex";
    }
    function hideLoader() {
      const loader = $(".lmgChat-loader", chatWindow);
      if (loader) loader.style.display = "none";
    }

    // Clear chat body
    const clearBody = () => (chatBody.innerHTML = "");

    // render bot/user messages
    function renderBotMessage(msg, options = {}) {
      const bubble = ce("div", "lmgChat-bubble lmgChat-bot-bubble");
      bubble.innerHTML = msg.replace(/\n/g, "<br/>");
      if (options.htmlClass) bubble.classList.add(options.htmlClass);
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function renderUserMessage(msg) {
      const bubble = ce("div", "lmgChat-bubble lmgChat-user-bubble");
      bubble.textContent = msg;
      chatBody.appendChild(bubble);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // back to menu button
    function renderBackToMenu() {
      const existing = $("#lmgChat-back-to-menu-btn", chatWindow);
      if (existing) existing.remove();
      const backBtn = ce("button");
      backBtn.id = "lmgChat-back-to-menu-btn";
      backBtn.textContent = "⬅️ Back to Main Menu";
      Object.assign(backBtn.style, {
        width: "92%",
        margin: "10px auto",
        display: "block",
        padding: "12px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: "#fff",
        color: theme.primary,
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "14px",
        textAlign: "center",
      });
      backBtn.onclick = () => showGreeting();
      const footer = $("#lmgChat-footer", chatWindow);
      if (footer && footer.parentNode) footer.parentNode.insertBefore(backBtn, footer);
      else chatWindow.appendChild(backBtn);
    }

    // -------------------------
    // API helpers
    // -------------------------
    async function fetchMenus() {
      const res = await fetch(`${config.backend}/menus`);
      return res.ok ? res.json() : [];
    }
    async function fetchSubMenus(menuId) {
      const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
      return res.ok ? res.json() : [];
    }

    async function postChat(payload, endpoint = "/chat") {
      const url = `${config.backend}${endpoint}`;
      const body = {
        ...payload,
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }

    // -------------------------
    // Intent handlers
    // -------------------------
    const INTENT_HANDLERS = {
      POLICY_QUESTION: handleGeneralIntent,
      GENERAL_QUERY: handleGeneralIntent,
      ORDER_TRACKING: handleOrderTracking,
      CUSTOMER_PROFILE: handleCustomerProfile,
      DEFAULT: handleDefaultIntent,
    };

    function handleGeneralIntent(payload) {
      renderBotMessage(payload.chat_message || payload.data || "No information found.");
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
        renderBackToMenu();
        return;
      }

      renderBotMessage("<b>🧾 Customer Details:</b>");
      chatBody.innerHTML += `
        <div class="lmgChat-bubble lmgChat-bot-bubble">
          <b>Name:</b> ${payload.customerName || "N/A"}<br/>
          <b>Mobile:</b> ${payload.mobileNo || "N/A"}
        </div>`;

      if (Array.isArray(payload.orderDetailsList) && payload.orderDetailsList.length > 0) {
        payload.orderDetailsList.forEach((o) => {
          chatBody.innerHTML += renderOrderCardHtml(o);
        });
      } else {
        renderBotMessage("No recent orders found.");
      }
      renderBackToMenu();
    }

    function handleCustomerProfile(payload) {
      if (checkAndTriggerLogin(payload, "Please login to view your profile.")) return;

      const profile = payload.customerProfile || payload.profile || null;
      if (!profile) {
        renderBotMessage("Sorry, I couldn’t fetch your profile details.");
        renderBackToMenu();
        return;
      }

      const chatMsg = payload.chat_message || profile.chat_message || "";
      if (chatMsg.trim() !== "") {
        renderBotMessage(chatMsg);
      } else {
        renderBotMessage("<b>🧾 Customer Details:</b>");
        chatBody.innerHTML += `
          <div class="lmgChat-bubble lmgChat-bot-bubble">
            <b>Name:</b> ${profile.name || "N/A"}<br/>
            <b>Email:</b> ${profile.email || "N/A"}<br/>
            <b>Mobile:</b> ${profile.signInMobile || profile.mobile || "N/A"}<br/>
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

    // -------------------------
    // Login check & trigger
    // -------------------------
    function triggerLoginPopup() {
      const signupBtn = document.getElementById("account-actions-signup");
      if (signupBtn) {
        signupBtn.click();
        console.log("🔑 Triggered signup/login popup automatically");
      } else {
        console.warn("⚠️ Signup button not found (id='account-actions-signup').");
      }
    }

    function checkAndTriggerLogin(payload, defaultMsg = "Please login to continue.") {
      const cht = (payload?.data?.chat_message || payload?.chat_message || "").toString();
      const normalizedMsg = cht.trim().toLowerCase();

      const isLoginPrompt =
        normalizedMsg.includes("login") ||
        normalizedMsg.includes("sign in") ||
        normalizedMsg.includes("signin") ||
        normalizedMsg.includes("anonymous user") ||
        normalizedMsg.includes("please login");

      if (isLoginPrompt) {
        renderBotMessage(`
          ${cht || defaultMsg}
          <br><br>
          <a href="#" id="lmgChat-login-link" style="color:#007bff; text-decoration:underline; cursor:pointer;">
            🔐 Click here to Login
          </a>
        `);

        setTimeout(() => {
          const loginLink = document.getElementById("lmgChat-login-link");
          if (loginLink) {
            loginLink.addEventListener("click", (e) => {
              e.preventDefault();
              triggerLoginPopup();
            });
          }
        }, 200);

        renderBackToMenu();
        return true;
      }
      return false;
    }

    // -------------------------
    // Extract order number helper
    // -------------------------
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

    // -------------------------
    // Copy to clipboard
    // -------------------------
    window.lmgChatCopyToClipboard = async function (text) {
      try {
        await navigator.clipboard.writeText(text);
        showCopyToast("✅ Order number copied!");
      } catch {
        showCopyToast("⚠️ Copy failed. Please copy manually.");
      }
    };

    function showCopyToast(msg) {
      let toast = document.getElementById("lmgChat-copy-toast");
      if (!toast) {
        toast = ce("div");
        toast.id = "lmgChat-copy-toast";
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
      toast.textContent = msg;
      toast.style.display = "block";
      clearTimeout(toast._t);
      toast._t = setTimeout(() => (toast.style.display = "none"), 1600);
    }

    // -------------------------
    // Render order card HTML
    // -------------------------
    function renderOrderCardHtml(o = {}) {
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
        <div class="lmgChat-bubble lmgChat-bot-bubble" style="background:#fff;border:1px solid ${theme.primary};padding:12px;border-radius:12px;margin-top:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
          <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;">
            <img src="${o.imageURL || "https://via.placeholder.com/80"}" style="width:84px;height:84px;border-radius:8px;object-fit:cover;border:1px solid #eee;">
            <div style="flex:1;min-width:180px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="font-weight:700;color:#222;font-size:14px;">${o.productName || "Product"}</div>
                ${statusBadge}
              </div>
              <div style="font-size:13px;color:#555;margin-top:6px;">${o.color || ""}${o.size ? " | " + o.size : ""}</div>
              <div style="margin-top:8px;font-size:13px;color:#444;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                <div><strong>Qty:</strong> ${o.qty || 1}</div>
                <div><strong>Net:</strong> ${o.netAmount || "-"}</div>
              </div>
              <div style="margin-top:10px;">
                <div style="font-size:13px;margin-bottom:4px;"><b>Order No:</b> <span style="font-weight:600;color:#111;">${orderNumber}</span></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
                  <a href="${orderUrl}" target="_blank" style="text-decoration:none;">
                    <button style="background:${theme.primary};color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;font-size:13px;">View Order</button>
                  </a>
                  <button onclick="window.lmgChatCopyToClipboard('${orderNumber}')" style="background:#fff;border:1px solid ${theme.primary};color:${theme.primary};padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;">Copy Order #</button>
                </div>
              </div>
              ${o.orderAmount ? `<div style="font-size:13px;color:#666;margin-top:8px;"><strong>Amount:</strong> ₹${o.orderAmount}</div>` : ""}
              ${o.estmtDate ? `<div style="font-size:13px;color:#666;margin-top:4px;"><strong>ETA:</strong> ${o.estmtDate}</div>` : ""}
              <div style="font-size:13px;margin-top:8px;">${returnMsg} | ${exchangeMsg}</div>
            </div>
          </div>
        </div>`;
    }

    // -------------------------
    // Gift card balance flow
    // -------------------------
    async function handleGiftCardBalanceFlow() {
      renderBotMessage("🎁 Please enter your gift card number below to check your balance:");
      // create input UI within chat
      const inputArea = ce("div");
      inputArea.className = "lmgChat-gift-input-area";
      Object.assign(inputArea.style, {
        display: "flex",
        alignItems: "center",
        marginTop: "10px",
        gap: "8px",
      });

      const input = ce("input");
      input.type = "text";
      input.placeholder = "Enter 6-19 digit Gift Card Number";
      input.maxLength = 19;
      input.pattern = "[0-9]*";
      Object.assign(input.style, {
        flex: "1",
        padding: "8px 10px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "8px",
        outline: "none",
      });

      const button = ce("button");
      button.textContent = "Check Balance";
      Object.assign(button.style, {
        background: theme.primary,
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "600",
      });

      inputArea.appendChild(input);
      inputArea.appendChild(button);
      chatBody.appendChild(inputArea);
      chatBody.scrollTop = chatBody.scrollHeight;

      button.onclick = async () => {
        const cardNumber = input.value.trim();
        if (!cardNumber || !/^[0-9]{6,19}$/.test(cardNumber)) {
          renderBotMessage("⚠️ Please enter a valid gift card number (numbers only).");
          return;
        }

        renderUserMessage(`🔢 Gift Card: ${cardNumber}`);
        renderBotMessage("💳 Checking your gift card balance...");

        try {
          showLoader("Fetching balance...");
          const res = await postChat({
            cardNumber,
            message: "Check my gift card balance",
            appid: config.appid,
            env: "www",
          }, "/chat");
          hideLoader();

          const data = res?.data || res;
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
            renderBotMessage(data.chat_message || "Here’s your gift card balance:");
            chatBody.innerHTML += `
              <div class="lmgChat-bubble lmgChat-bot-bubble"
                   style="background:#fff;border:1px solid ${theme.primary};
                          border-radius:12px;padding:12px;margin:10px 0;
                          box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                <b>Card Number:</b> ${g.cardNumber || "N/A"}<br/>
                <b>Status:</b> ${g.status || "N/A"}<br/>
                <b>Message:</b> ${g.message || "N/A"}<br/>
                <b>Balance:</b> ₹${(g.balanceAmount || 0).toFixed(2)} ${g.currency || "INR"}
              </div>
            `;
          } else {
            renderBotMessage("😔 Unable to fetch your gift card balance. Please try again later.");
          }
          renderBackToMenu();
          chatBody.scrollTop = chatBody.scrollHeight;
        } catch (err) {
          hideLoader();
          console.error("❌ Gift card error:", err);
          renderBotMessage("⚠️ Something went wrong while checking your gift card balance.");
          renderBackToMenu();
        }
      };
    }

    // -------------------------
    // Nearby stores flow
    // -------------------------
    async function handleNearbyStoreFlow() {
      renderBotMessage("📍 Detecting your location...");

      if (!navigator.geolocation) {
        renderBotMessage("⚠️ Geolocation not supported by your browser.");
        renderBackToMenu();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          renderBotMessage(`✅ Found location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
          renderBotMessage("Fetching nearby stores...");

          try {
            showLoader("Finding stores...");
            const res = await postChat({
              latitude: lat,
              longitude: lon,
              message: "Find nearby stores",
            }, "/chat/nearby-stores");
            hideLoader();

            const stores = res?.data?.stores || [];
            if (stores.length) {
              stores.forEach((s) => {
                chatBody.innerHTML += `
                  <div class="lmgChat-bubble lmgChat-bot-bubble" style="background:#fff;border:1px solid ${theme.primary};border-radius:12px;padding:10px;margin:8px 0;">
                    <b>${s.storeName || s.name || "Store"}</b><br/>
                    ${s.line1 || ""} ${s.line2 ? "- " + s.line2 : ""} ${s.postalCode ? "- " + s.postalCode : ""}<br/>
                    ${s.contactNumber ? "📞 " + s.contactNumber + "<br/>" : ""}
                    ${s.workingHours ? "🕒 " + s.workingHours + "<br/>" : ""}
                    <a href="https://www.google.com/maps?q=${s.latitude || lat},${s.longitude || lon}" target="_blank"
                       style="color:${theme.primary};font-weight:600;">📍 View on Map</a>
                  </div>`;
              });
            } else {
              renderBotMessage("😔 No nearby stores found.");
            }
            renderBackToMenu();
          } catch (err) {
            hideLoader();
            console.error("❌ Nearby stores error:", err);
            renderBotMessage("⚠️ Error fetching store list.");
            renderBackToMenu();
          }
        },
        (err) => {
          renderBotMessage("❌ Permission denied for location.");
          renderBackToMenu();
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }

    // -------------------------
    // Send message (main)
    // -------------------------
    async function sendMessage(type, userMessage) {
      try {
        showLoader("Thinking...");
        const body = {
          message: userMessage,
          question: userMessage,
          userId: config.userid,
          concept: config.concept,
          env: config.env,
          appid: config.appid,
          type,
        };
        const url = `${config.backend}${type === "static" ? "/chat/ask" : "/chat"}`;
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
        const payload = typeof json.data === "string" ? { chat_message: json.data } : json.data || json;
        const handler = INTENT_HANDLERS[intent] || INTENT_HANDLERS.DEFAULT;
        handler(payload);
      } catch (e) {
        hideLoader();
        console.error("❌ Chatbot error:", e);
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }

    // -------------------------
    // Menu rendering + flows
    // -------------------------
    async function showGreeting() {
      clearBody();
      inputContainer.style.display = "none";
      renderBotMessage(`👋 Hi! Welcome to <b>${config.concept}</b> Chat Service`);
      renderBotMessage("Please choose an option below 👇");
      try {
        const menus = (await fetchMenus()) || [];
        if (!menus.length) {
          renderBotMessage("⚠️ No menu found.");
          renderBackToMenu();
          return;
        }
        menus.forEach((menu) => renderMenuButton(menu));
      } catch (e) {
        console.error("❌ Menus error:", e);
        renderBotMessage("⚠️ Unable to load menu right now.");
      }
      renderBackToMenu();
    }

    function renderMenuButton(menu) {
      const btn = ce("button");
      btn.className = "lmgChat-menu-btn";
      btn.textContent = menu.title || "Option";
      Object.assign(btn.style, {
        width: "100%",
        margin: "6px 0",
        padding: "12px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: "#fff",
        color: theme.primary,
        cursor: "pointer",
        textAlign: "left",
        fontWeight: "700",
      });
      btn.onclick = () => showSubMenus(menu);
      chatBody.appendChild(btn);
    }

    async function showSubMenus(menu) {
      clearBody();
      renderUserMessage(menu.title);
      renderBotMessage(`Fetching options for <b>${menu.title}</b>...`);
      try {
        const subs = (await fetchSubMenus(menu.id)) || [];
        if (!subs.length) {
          renderBotMessage("No sub-options found.");
          renderBackToMenu();
          return;
        }
        subs.forEach((sub) => renderSubmenuButton(sub));
      } catch (err) {
        console.error("❌ Submenus error:", err);
        renderBotMessage("⚠️ Unable to load options.");
      }
      renderBackToMenu();
    }

    function renderSubmenuButton(sub) {
      const sbtn = ce("button");
      sbtn.className = "lmgChat-submenu-btn";
      sbtn.textContent = sub.title || "Sub Option";
      Object.assign(sbtn.style, {
        width: "100%",
        margin: "6px 0",
        padding: "12px",
        border: `1px solid ${theme.primary}`,
        borderRadius: "10px",
        background: sub.type === "dynamic" ? "#EEF2FF" : "#fff",
        color: theme.primary,
        cursor: "pointer",
        textAlign: "left",
        fontWeight: "700",
      });
      sbtn.onclick = () => handleSubmenu(sub);
      chatBody.appendChild(sbtn);
    }

    function handleSubmenu(sub) {
      clearBody();
      renderUserMessage(sub.title);
      // special flows by title/type
      const titleLower = (sub.title || "").toLowerCase();
      if (titleLower.includes("near") && titleLower.includes("store")) {
        handleNearbyStoreFlow();
        return;
      }
      if (titleLower.includes("gift") && titleLower.includes("card")) {
        handleGiftCardBalanceFlow();
        return;
      }
      // generic question flow
      renderBotMessage(`Please enter your question related to <b>${sub.title}</b>.`);
      inputContainer.style.display = "flex";
      sendButton.onclick = () => {
        const msg = inputField.value.trim();
        if (!msg) return;
        renderUserMessage(msg);
        sendMessage(sub.type || "dynamic", msg);
        inputField.value = "";
      };
      renderBackToMenu();
    }

    // init greeting when chat opens
    // (Floating button will call showGreeting when opened)
  } // end initChatWidget

  // -------------------------
  // Floating FAB & chat window creation (UI)
  // -------------------------
  function createFloatingButton(chatWindow, showGreeting) {
    // Not used directly since createChatWindow handles button creation inline below
    return;
  }

  function createChatWindow() {
    // Build container
    const chatWindow = ce("div");
    chatWindow.id = "lmgChat-container";
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 25px;
      width: clamp(320px, 90vw, 420px);
      height: clamp(480px, 80vh, 720px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: Inter, Arial, sans-serif;
      border: 2px solid ${theme.primary};
      z-index: 9999;
      backdrop-filter: blur(4px);
    `;

    const isDarkHeader = ["MAX", "LIFESTYLE", "HOMECENTRE"].includes(config.concept);
    const logoFilter = isDarkHeader ? "filter: brightness(0) invert(1);" : "";

    chatWindow.innerHTML = `
      <style>
        /* Scoped styles */
        #lmgChat-container .lmgChat-header{padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:700;}
        #lmgChat-container .lmgChat-bubble{border-radius:12px;padding:8px 12px;margin:6px 0;max-width:88%;box-sizing:border-box;word-wrap:break-word;}
        #lmgChat-container .lmgChat-bot-bubble{background:#f3f4f6;align-self:flex-start;color:#111;}
        #lmgChat-container .lmgChat-user-bubble{background:${theme.gradient};color:white;align-self:flex-end;}
        #lmgChat-container .lmgChat-loader{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,0.8);z-index:9998;}
        #lmgChat-container .lmgChat-loader-inner{display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px;border-radius:8px;}
        #lmgChat-container .lmgChat-loader-text{font-size:13px;color:#333;font-weight:700;}
        .lmgChat-spinner{width:40px;height:40px;border-radius:50%;border:4px solid rgba(0,0,0,0.08);border-top-color:${theme.primary};animation:lmgChat-spin 1s linear infinite;}
        @keyframes lmgChat-spin{to{transform:rotate(360deg);}}
        #lmgChat-button{position: fixed; bottom: 25px; right: 25px; width:70px; height:70px; border-radius:50%; cursor:pointer; z-index:9999; display:flex; align-items:center; justify-content:center;}
        #lmgChat-button:hover{transform: scale(1.05)}
        #lmgChat-button .lmgChat-fab-icon{background:white;border:3px solid ${theme.primary};border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,0.12);}
        #lmgChat-button .lmgChat-fab-badge{position:absolute;bottom:-4px;right:-4px;background:${theme.primary};color:white;border-radius:50%;padding:6px;font-size:14px;}
        #lmgChat-container .lmgChat-menu-btn, #lmgChat-container .lmgChat-submenu-btn{font-family:inherit;}
        /* responsive */
        @media (max-width: 480px) {
          #lmgChat-container{right:12px;left:12px;bottom:12px;width:calc(100% - 24px);height:calc(100vh - 24px);border-radius:12px;}
          #lmgChat-button{right:14px;bottom:18px;width:58px;height:58px;}
          #lmgChat-button .lmgChat-fab-icon{width:54px;height:54px;}
        }
      </style>

      <div class="lmgChat-header" style="background:${theme.gradient};color:white;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;gap:8px;">
          <img src="${theme.logo}" style="height:22px;${logoFilter}" alt="${config.concept} logo">
          <span>Chat Service</span>
        </span>
        <span id="lmgChat-close" style="cursor:pointer;">✖</span>
      </div>

      <div id="lmgChat-body" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;font-size:14px;background:linear-gradient(180deg,#fff,#fbfbfb);"></div>

      <div id="lmgChat-input-container" style="display:none;border-top:1px solid #eee;align-items:center;padding:8px;gap:8px;">
        <input id="lmgChat-input" placeholder="Type your message..." style="flex:1;padding:10px;border-radius:8px;border:1px solid #ccc;outline:none;min-height:44px;">
        <button id="lmgChat-send" style="background:${theme.gradient};color:white;border:none;padding:10px 12px;border-radius:8px;cursor:pointer;">Send</button>
      </div>

      <div id="lmgChat-footer" style="text-align:center;font-size:12px;padding:8px;background:#fafafa;border-top:1px solid #eee;">
        Powered by <img src="${theme.logo}" style="height:18px;margin-left:5px;vertical-align:middle;">
      </div>

      <div class="lmgChat-loader" aria-hidden="true"></div>
    `;

    // append to body
    document.body.appendChild(chatWindow);

    // create FAB button
    const fab = ce("div");
    fab.id = "lmgChat-button";
    fab.innerHTML = `
      <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div class="lmgChat-fab-icon">
          <img src="${theme.logo}" alt="${config.concept}" style="width:58px;height:auto;object-fit:contain;">
        </div>
        <div class="lmgChat-fab-badge">💬</div>
      </div>`;
    document.body.appendChild(fab);

    // show/hide logic for FAB
    fab.addEventListener("mouseenter", () => (fab.style.transform = "scale(1.06)"));
    fab.addEventListener("mouseleave", () => (fab.style.transform = "scale(1)"));

    // open/close logic
    fab.onclick = () => {
      const el = $("#lmgChat-container");
      el.style.display = el.style.display === "flex" ? "none" : "flex";
      if (el.style.display === "flex") {
        // initialize chat flows
        const bodyEl = $("#lmgChat-body", el);
        bodyEl.scrollTop = bodyEl.scrollHeight;
        // call greeting by re-initializing widget internals
        // small hack: trigger an internal event to init flows
        setTimeout(() => {
          // call the function created inside initChatWidget (we rely on it being in scope)
          if (typeof window !== "undefined") {
            // find and call showGreeting by dispatching a custom event that initChatWidget listens to
            const ev = new CustomEvent("lmgChat-open");
            window.dispatchEvent(ev);
          }
        }, 80);
      }
    };

    // close button
    $("#lmgChat-close", chatWindow).onclick = () => (chatWindow.style.display = "none");

    // responsive reposition FAB on resize
    function adjustFab() {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      if (vw < 420) {
        fab.style.right = "14px";
        fab.style.bottom = "18px";
        fab.style.width = "58px";
        fab.style.height = "58px";
      } else {
        fab.style.right = "25px";
        fab.style.bottom = "25px";
        fab.style.width = "70px";
        fab.style.height = "70px";
      }
    }
    adjustFab();
    window.addEventListener("resize", adjustFab);

    // Listen for showGreeting trigger from initChatWidget
    window.addEventListener("lmgChat-showGreeting", () => {
      // no-op placeholder if someone triggers; the inner initChatWidget has its own handler below
    });

    // Also expose chat container in global for debugging
    window.lmgChatRoot = chatWindow;

    // fire an event that initChatWidget can listen to in order to run showGreeting
    // (initChatWidget will add its event handler to window)
    return chatWindow;
  } // end createChatWindow

  // -------------------------
  // Hook showGreeting event from initChatWidget scope
  // -------------------------
  // We need initChatWidget to create inner handler that actually renders greeting.
  // Because createChatWindow returned earlier and initChatWidget created UI and listener,
  // we'll wire an event that initChatWidget uses. (initChatWidget already dispatches showGreeting normally.)
  // To ensure the greeting runs when FAB is clicked, initChatWidget listens for 'lmgChat-open' and runs showGreeting.

  // -------------------------
  // Add event wiring to trigger greeting inside initChatWidget scope.
  // (We implement the event listener here to call the internal showGreeting defined in initChatWidget.)
  // -------------------------
  // To connect: initChatWidget defines a showGreeting function and will also attach a listener to 'lmgChat-open' when it runs.
  // Implemented earlier inside initChatWidget when created.

  // -------------------------
  // As a final step: create and mount widget by calling initChatWidget again
  // (This ensures event wiring exists and showGreeting is bound).
  // -------------------------
  // The earlier code already called initChatWidget on DOM ready; if it hasn't, ensure it's called.
  // (Double-call safe because initChatWidget's UI creation guards by IDs.)
})();
