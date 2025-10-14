(function () {
  // --- 1️⃣ Resolve script and config safely
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

  // --- 2️⃣ Initialize Chat Widget
  function initChatWidget() {
    if (!config.backend) {
      console.error("Chatbot Widget: Missing backend URL.");
      return;
    }

    // --- Floating Chat Button ---
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
      height: 460px;
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
      <div style="background:#4F46E5;color:#fff;padding:10px;font-weight:bold;">
        LMG Chat Service
      </div>
      <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;font-size:14px;"></div>
    `;
    document.body.appendChild(chatWindow);

    button.onclick = () => {
      chatWindow.style.display =
        chatWindow.style.display === "flex" ? "none" : "flex";
      if (chatWindow.style.display === "flex") showGreeting();
    };

    const chatBody = chatWindow.querySelector("#chat-body");

    // --- 3️⃣ Render Helpers ---
    const clearBody = () => (chatBody.innerHTML = "");
    const renderBotMessage = (msg) => {
      chatBody.innerHTML += `<div style="margin:8px 0;"><b>Bot:</b> ${msg}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const renderUserMessage = (msg) => {
      chatBody.innerHTML += `<div style="text-align:right;margin:8px 0;"><b>You:</b> ${msg}</div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    };

    // --- 4️⃣ Fetch Menu List from Backend ---
    async function fetchMenus() {
      try {
        const res = await fetch(`${config.backend}/menus`);
        const menus = await res.json();
        return menus;
      } catch (err) {
        console.error("Menu fetch failed:", err);
        renderBotMessage("⚠️ Unable to load menu right now. Please try later.");
        return [];
      }
    }

    // --- 5️⃣ Fetch Submenus ---
    async function fetchSubMenus(menuId) {
      try {
        const res = await fetch(`${config.backend}/menus/${menuId}/submenus`);
        const submenus = await res.json();
        return submenus;
      } catch (err) {
        console.error("Submenu fetch failed:", err);
        renderBotMessage("⚠️ Unable to load submenu. Try again later.");
        return [];
      }
    }

    // --- 6️⃣ Show Greeting + Menu List ---
    async function showGreeting() {
      clearBody();
      renderBotMessage("Hi and welcome to LMG Chat Service 👋");

      const menus = await fetchMenus();
      if (!menus.length) return;

      renderBotMessage("Please choose one of the following options:");

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
    }

    // --- 7️⃣ Show Submenus for a Selected Menu ---
    async function showSubMenus(menu) {
      renderUserMessage(menu.title);
      clearBody();
      renderBotMessage(`Here are the options under <b>${menu.title}</b>:`);

      const submenus = await fetchSubMenus(menu.id);
      if (!submenus.length) {
        renderBotMessage("No sub-options found for this category.");
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
        btn.onclick = () => {
          renderUserMessage(sub.title);
          renderBotMessage(
            sub.type === "dynamic"
              ? "⚙️ This is a dynamic option — fetching details..."
              : `📄 Showing ${sub.title} policy details (static content).`
          );
        };
        chatBody.appendChild(btn);
      });

      const backBtn = document.createElement("button");
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
      backBtn.onclick = showGreeting;
      chatBody.appendChild(backBtn);
    }

    // Initialize
    showGreeting();
  }

  // --- 8️⃣ DOM Ready
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
