<script>
(function() {
  const backendUrl = document.currentScript.getAttribute("data-backend");
  const userId = document.currentScript.getAttribute("data-userid");

  // small helper to escape HTML (prevent injection)
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // create floating button
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

  // chat window
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

  // toggle
  button.onclick = () => {
    chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
  };

  const chatBody = chatWindow.querySelector("#chat-body");
  const input = chatWindow.querySelector("#chat-input");
  const send = chatWindow.querySelector("#chat-send");

  // helper to append bot/user messages
  function appendUserMessage(text) {
    const el = document.createElement("div");
    el.style.marginTop = "8px";
    el.innerHTML = `<b>You:</b> ${escapeHtml(text)}`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendBotMessage(text) {
    const el = document.createElement("div");
    el.style.marginTop = "8px";
    el.innerHTML = `<b>Bot:</b> ${escapeHtml(text)}`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendErrorMessage(text) {
    const el = document.createElement("div");
    el.style.marginTop = "8px";
    el.style.color = "red";
    el.innerHTML = `<b>Bot:</b> ${escapeHtml(text)}`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // pretty-render order details (generic)
  function renderOrderDetails(customerName, mobileNo, orderDetailsList) {
    const container = document.createElement("div");
    container.style.marginTop = "8px";

    const headerLines = [];
    if (customerName) headerLines.push(`<div><b>Customer:</b> ${escapeHtml(customerName)}</div>`);
    if (mobileNo) headerLines.push(`<div><b>Mobile:</b> ${escapeHtml(mobileNo)}</div>`);
    container.innerHTML = headerLines.join("");

    const list = document.createElement("div");
    list.style.marginTop = "6px";
    list.style.fontSize = "13px";

    if (!Array.isArray(orderDetailsList) || orderDetailsList.length === 0) {
      list.innerHTML = `<i>No orders found.</i>`;
    } else {
      // for each order, render its keys (generic)
      orderDetailsList.forEach((order, idx) => {
        const orderBox = document.createElement("div");
        orderBox.style.border = "1px solid #eee";
        orderBox.style.padding = "8px";
        orderBox.style.marginBottom = "8px";
        orderBox.style.borderRadius = "6px";
        orderBox.style.background = "#fafafa";

        const title = document.createElement("div");
        title.style.fontWeight = "600";
        title.style.marginBottom = "6px";
        title.innerHTML = `Order #${idx + 1}`;
        orderBox.appendChild(title);

        // if order is primitive (string/number), just show
        if (typeof order !== "object" || order === null) {
          const p = document.createElement("div");
          p.textContent = String(order);
          orderBox.appendChild(p);
        } else {
          // render key:value pairs
          const table = document.createElement("div");
          table.style.display = "grid";
          table.style.gridTemplateColumns = "120px 1fr";
          table.style.gap = "4px 8px";
          Object.keys(order).forEach(key => {
            const k = document.createElement("div");
            k.style.color = "#555";
            k.style.fontSize = "13px";
            k.textContent = key;
            const v = document.createElement("div");
            v.style.fontSize = "13px";
            const val = order[key];
            // if value is array or object show JSON pretty, else show string
            if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
              v.textContent = JSON.stringify(val);
            } else {
              v.textContent = val === null || val === undefined ? "" : String(val);
            }
            table.appendChild(k);
            table.appendChild(v);
          });
          orderBox.appendChild(table);
        }
        list.appendChild(orderBox);
      });
    }
    container.appendChild(list);
    chatBody.appendChild(container);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // --- Message Send Function ---
  let sending = false;
  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg || sending) return;

    appendUserMessage(msg);
    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    // UI: disable send and show a small "sending..." indicator
    sending = true;
    send.disabled = true;
    const spinner = document.createElement("div");
    spinner.id = "chatbot-spinner";
    spinner.style.marginTop = "6px";
    spinner.style.fontSize = "13px";
    spinner.style.opacity = "0.8";
    spinner.innerHTML = `<i>sending...</i>`;
    chatBody.appendChild(spinner);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: msg })
      });

      // remove spinner
      const s = document.getElementById("chatbot-spinner");
      if (s) s.remove();

      if (!res.ok) {
        // try to read textual error body
        let bodyText = "";
        try { bodyText = await res.text(); } catch (_) {}
        appendErrorMessage(`Server returned ${res.status}${bodyText ? ": " + bodyText : ""}`);
        sending = false;
        send.disabled = false;
        return;
      }

      // parse JSON safely
      const data = await res.json();

      // If backend returns plain string
      if (typeof data === "string") {
        appendBotMessage(data);
        sending = false;
        send.disabled = false;
        return;
      }

      // If backend returns object with chat_message
      if (data && (data.chat_message || data.chatMessage)) {
        // support both keys chat_message and chatMessage
        const msgText = data.chat_message ?? data.chatMessage;
        appendBotMessage(msgText);
      } else if (data && data.response) {
        // some handlers may return { response: "..." }
        appendBotMessage(data.response);
      } else {
        // fallback: try to stringify object if nothing else
        appendBotMessage(JSON.stringify(data));
      }

      // If there are order details, render them below the bot message
      if (data && Array.isArray(data.orderDetailsList) && data.orderDetailsList.length > 0) {
        const customerName = data.customerName ?? data.customername ?? "";
        const mobileNo = data.mobileNo ?? data.mobileno ?? data.mobile ?? "";
        renderOrderDetails(customerName, mobileNo, data.orderDetailsList);
      } else if (data && data.orderDetailsList && typeof data.orderDetailsList === "object") {
        // sometimes backend returns single object instead of array
        const arr = Array.isArray(data.orderDetailsList) ? data.orderDetailsList : [data.orderDetailsList];
        const customerName = data.customerName ?? "";
        const mobileNo = data.mobileNo ?? "";
        renderOrderDetails(customerName, mobileNo, arr);
      }

    } catch (e) {
      // remove spinner if present
      const s = document.getElementById("chatbot-spinner");
      if (s) s.remove();
      appendErrorMessage("Sorry, I'm offline.");
    } finally {
      sending = false;
      send.disabled = false;
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  send.onclick = sendMessage;
  input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
})();
</script>
