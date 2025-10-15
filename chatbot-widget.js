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
  };

  function initChatWidget() {
    if (!config.backend) {
      console.error("Chatbot Widget: Missing backend URL.");
      return;
    }

    // --- Floating Button ---
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = "💬";
    Object.assign(button.style, {
      position: "fixed",
      bottom: "25px",
      right: "25px",
      width: "55px",
      height: "55px",
      background: "#4F46E5",
      color: "#fff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      zIndex: "9999",
    });
    document.body.appendChild(button);

    // --- Chat Window ---
    const chatWindow = document.createElement("div");
    chatWindow.id = "chatbot-container";
    chatWindow.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 25px;
      width: 340px;
      height: 480px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: Arial, sans-serif;
      z-index: 9999;
    `;
    chatWindow.innerHTML = `
      <div style="background:#4F46E5;color:#fff;padding:10px;font-weight:bold;">LMG Chat Service</div>
      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;font-size:14px;"></div>
      <div id="chat-input-container" style="display:none;border-top:1px solid #ddd;flex-shrink:0;">
        <input id="chat-input" style="width:80%;padding:8px;border:none;font-size:14px;" placeholder="Type your message..." />
        <button id="chat-send" style="width:20%;background:#4F46E5;color:#fff;border:none;">Send</button>
      </div>
    `;
    document.body.appendChild(chatWindow);

    const chatBody = chatWindow.querySelector("#chat-body");
    const inputContainer = chatWindow.querySelector("#chat-input-container");
    const inputField = chatWindow.querySelector("#chat-input");
    const sendButton = chatWindow.querySelector("#chat-send");

    // --- Toggle Window ---
    button.onclick = () => {
      chatWindow.style.display =
        chatWindow.style.display === "flex" ? "none" : "flex";
      if (chatWindow.style.display === "flex") showGreeting();
    };

    // --- Helper Functions ---
    const clearBody = () => (chatBody.innerHTML = "");
    const renderBotMessage = (msg) => {
      msg = msg
        .replace(/### (.*$)/gim, "<b>$1</b>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\n/g, "<br/>");
      chatBody.innerHTML += `<div style="margin:8px 0;"><b>Bot:</b> ${msg}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const renderUserMessage = (msg) => {
      chatBody.innerHTML += `<div style="text-align:right;margin:8px 0;"><b>You:</b> ${msg}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const showBackToMainMenu = () => {
      if (document.getElementById("back-to-main")) return;
      const backBtn = document.createElement("button");
      backBtn.id = "back-to-main";
      backBtn.textContent = "⬅️ Back to Main Menu";
      Object.assign(backBtn.style, {
        marginTop: "10px",
        padding: "8px 12px",
        background: "#4F46E5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        width: "100%",
      });
      backBtn.onclick = () => {
        document.getElementById("back-to-main")?.remove();
        inputContainer.style.display = "none";
        showGreeting();
      };
      chatBody.appendChild(backBtn);
    };

    // --- Fetch Menus ---
    async function fetchMenus() {
      try {
        const res = await fetch(`${config.backend}/menus`);
        return await res.json();
      } catch {
        renderBotMessage("⚠️ Unable to load menu right now.");
        return [];
      }
    }

    async function fetchSubMenus(menuId) {
      try {
        const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
        return await res.json();
      } catch {
        renderBotMessage("⚠️ Unable to load submenu.");
        return [];
      }
    }

    // --- Greeting ---
    async function showGreeting() {
      clearBody();
      renderBotMessage("Hi and welcome to LMG Chat Service 👋");
      renderBotMessage("Please choose one of the following options:");

      const menus = await fetchMenus();
      menus.forEach((menu) => {
        const btn = document.createElement("button");
        btn.textContent = menu.title;
        Object.assign(btn.style, {
          margin: "6px 0",
          padding: "8px 12px",
          border: "1px solid #4F46E5",
          borderRadius: "8px",
          background: "white",
          color: "#4F46E5",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          fontSize: "14px",
        });
        btn.onclick = () => showSubMenus(menu);
        chatBody.appendChild(btn);
      });
      inputContainer.style.display = "none";
    }

    // --- Show Submenus ---
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
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
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

    // --- Handle submenu selection ---
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

      inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendButton.click();
        }
      });
    }

    // --- Send Message ---
    async function sendMessage(type, userMessage) {
      const endpoint = type === "static" ? "/chat/ask" : "/chat";
      const url = `${config.backend}${endpoint}`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:
            type === "static"
              ? JSON.stringify({ question: userMessage })
              : JSON.stringify({
                  message: userMessage,
                  question: userMessage,
                  userId: config.userid,
                }),
        });

        const json = await res.json();
        const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
        const payload = json.data || json;

        // 🧹 Clear old UI before painting new
        clearBody();

        if (intent === "POLICY_QUESTION" || intent === "GENERAL_QUERY") {
          renderBotMessage(
            typeof payload === "string"
              ? payload
              : payload.data || payload.chat_message || "No information available."
          );
        } else if (intent === "ORDER_TRACKING") {
          const data = payload;
          if (data.chat_message && data.chat_message.trim()) {
            renderBotMessage(data.chat_message);
          } else {
            renderBotMessage("<b>🧾 Customer Details:</b>");
            chatBody.innerHTML += `
              <div style="margin:8px 0;padding:8px;background:#F3F4F6;border-radius:8px;">
                <b>Name:</b> ${data.customerName || "N/A"}<br/>
                <b>Mobile:</b> ${data.mobileNo || "N/A"}
              </div>
            `;
            if (Array.isArray(data.orderDetailsList) && data.orderDetailsList.length > 0) {
              renderBotMessage("<b>📦 Order Summary:</b>");
              data.orderDetailsList.forEach((order) => {
                chatBody.innerHTML += `
                  <div style="margin-top:10px;padding:8px;background:#fff;border:1px solid #ddd;border-radius:8px;">
                    <b>Order No:</b> ${order.orderNo || "N/A"}<br/>
                    <b>Status:</b> ${order.orderStatus || "N/A"}<br/>
                    <b>Date:</b> ${order.orderDate || "N/A"}<br/>
                    <b>Total:</b> ₹${order.orderAmount ? order.orderAmount.toFixed(2) : "0.00"}<br/>
                    <b>Products:</b> ${order.totalProducts || 0}
                  </div>
                `;
              });
            } else {
              renderBotMessage("No order details found for your account.");
            }
          }
        } else {
          renderBotMessage("I didn’t quite understand that. Could you rephrase?");
        }

        showBackToMainMenu();
      } catch (err) {
        console.error("Chat Error:", err);
        renderBotMessage("⚠️ Something went wrong while processing your request.");
        showBackToMainMenu();
      }
    }

    // --- Initialize ---
    showGreeting();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
