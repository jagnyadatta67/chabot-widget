current code 

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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    console.log("🧠 Chatbot Response:", json);

    const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
    let messageToShow = "";

    if (typeof json.data === "string") {
      messageToShow = json.data;
    } else if (json.data?.chat_message) {
      messageToShow = json.data.chat_message;
    } else if (json.chat_message) {
      messageToShow = json.chat_message;
    } else {
      messageToShow = "No response available.";
    }

    renderBotMessage(messageToShow);
  } catch (e) {
    console.error("❌ Chatbot error:", e);
    renderBotMessage("⚠️ Something went wrong. Please try again.");
  }
}
 
 
 
 earlier code
 
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
        const json = await res.json();

        const intent = json.intent || json.data?.intent || "GENERAL_QUERY";
        lastIntent = intent;
        const payload = json.data || json;

        if (intent === "POLICY_QUESTION" || intent === "GENERAL_QUERY") {
          renderBotMessage(payload.chat_message || "No information found.");
          renderBackToMenu();
        } else if (intent === "ORDER_TRACKING") {
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
                const backendBase = config.backend || window.location.origin;
                const productLink = o.productURL ? `${backendBase}${o.productURL}` : "#";
                const returnMsg = o.returnAllow ? "✅ Return Available" : "🚫 No Return";
                const exchangeMsg = o.exchangeAllow ? "♻️ Exchange Available" : "🚫 No Exchange";
                chatBody.innerHTML += `
                  <div class="bubble bot-bubble" style="background:#fff;border:1px solid ${theme.primary};padding:10px;border-radius:10px;margin-top:6px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img src="${o.imageURL || 'https://via.placeholder.com/80'}" style="width:80px;height:80px;border-radius:6px;object-fit:cover;">
                      <div>
                        <a href="${productLink}" target="_blank" style="color:${theme.primary};font-weight:600;">${o.productName || "Product"}</a><br/>
                        <span style="font-size:13px;color:#555;">${o.color || ""} ${o.size ? " | " + o.size : ""}</span><br/>
                        <span style="font-size:13px;color:#555;">Qty: ${o.qty || 1} | <b>${o.netAmount || ""}</b></span>
                      </div>
                    </div>
                    <hr style="border:none;border-top:1px dashed #ddd;margin:8px 0;">
                    <div style="font-size:13px;color:#444;">
                      <b>Order No:</b> ${o.orderNo}<br/>
                      ${o.orderAmount ? `<b>Order Amount:</b> ₹${o.orderAmount}<br/>` : ""}
                      ${o.estmtDate ? `<b>Estimated Delivery:</b> ${o.estmtDate}<br/>` : ""}
                      ${o.latestStatus ? `<b>Latest Status:</b> <span style="color:${theme.primary};">${o.latestStatus}</span><br/>` : ""}
                    </div>
                    <div style="font-size:13px;margin-top:6px;">${returnMsg} | ${exchangeMsg}</div>
                  </div>`;
              });
            } else renderBotMessage("No recent orders found.");
          }
          renderBackToMenu();
        }
      } catch (e) {
        renderBotMessage("⚠️ Something went wrong. Please try again.");
        renderBackToMenu();
      }
    }