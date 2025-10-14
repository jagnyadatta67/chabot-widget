(function () {
    // Wait for DOM to load before running widget
    function initChatWidget() {
      const backendUrl = document.currentScript.getAttribute("data-backend");
      const userId = document.currentScript.getAttribute("data-userid");
  
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
        zIndex: "9999"
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
        <div style="background:#4F46E5;color:#fff;padding:10px;font-weight:bold;">Mio Assistant</div>
        <div id="chat-body" style="flex:1;padding:10px;overflow-y:auto;font-size:14px;">
          <div><b>Bot:</b> Hi 👋 I’m your shopping assistant. Ask me about your orders!</div>
        </div>
        <div style="display:flex;border-top:1px solid #ddd;">
          <input id="chat-input" style="flex:1;padding:8px;border:none;font-size:14px;" placeholder="Type your message..." />
          <button id="chat-send" style="background:#4F46E5;color:white;border:none;padding:8px 12px;">Send</button>
        </div>
      `;
      document.body.appendChild(chatWindow);
  
      // --- Toggle Window ---
      button.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
      };
  
      const chatBody = chatWindow.querySelector("#chat-body");
      const input = chatWindow.querySelector("#chat-input");
      const send = chatWindow.querySelector("#chat-send");
  
      // --- Helper: Render Bot Message ---
      function renderBotMessage(message) {
        chatBody.innerHTML += `<div style="margin-top:5px;"><b>Bot:</b> ${message}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
      }
  
      // --- Helper: Render Orders if Present ---
      function renderOrderData(data) {
        if (data.orderDetailsList && data.orderDetailsList.length > 0) {
          const customerInfo = `
            <div style="margin-top:10px;padding:8px;background:#f9fafb;border-radius:6px;">
              <b>Customer:</b> ${data.customerName || "N/A"}<br/>
              <b>Mobile:</b> ${data.mobileNo || "N/A"}
            </div>
          `;
          chatBody.innerHTML += customerInfo;
  
          data.orderDetailsList.forEach(order => {
            const card = `
              <div style="margin-top:10px;border:1px solid #eee;padding:8px;border-radius:8px;background:#fefefe;">
                <b>Order No:</b> ${order.orderNo}<br/>
                <b>Status:</b> ${order.orderStatus}<br/>
                <b>Date:</b> ${order.orderDate}<br/>
                <b>Total:</b> ₹${order.orderAmount.toFixed(2)}<br/>
                <b>Products:</b> ${order.totalProducts}
              </div>
            `;
            chatBody.innerHTML += card;
          });
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }
  
      // --- Send Message Function ---
      async function sendMessage() {
        const msg = input.value.trim();
        if (!msg) return;
  
        chatBody.innerHTML += `<div style="margin-top:8px;text-align:right;"><b>You:</b> ${msg}</div>`;
        input.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;
  
        // Show typing animation
        const typing = document.createElement("div");
        typing.id = "typing-indicator";
        typing.innerHTML = `<i>Bot is typing...</i>`;
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
  
        try {
          const res = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, message: msg })
          });
  
          const data = await res.json();
          typing.remove();
  
          // 1️⃣ Always show chat_message (AI response)
          if (data.chat_message) {
            renderBotMessage(data.chat_message);
          }
  
          // 2️⃣ If Hybris data present, show order details
          renderOrderData(data);
  
        } catch (e) {
          typing.remove();
          renderBotMessage("<span style='color:red;'>Sorry, I’m offline right now.</span>");
          console.error("Chatbot error:", e);
        }
      }
  
      send.onclick = sendMessage;
      input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
    }
  
    // Wait for DOM readiness
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", initChatWidget);
    } else {
      initChatWidget();
    }
  })();
  