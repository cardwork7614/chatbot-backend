const input = document.getElementById("chatbot-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("chatbot-messages");

// เพิ่มข้อความเข้าแชท
function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = "message " + who;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ส่งข้อความ
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  try {
    const res = await fetch("https://chatbot-backend-buct.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    addMessage(data.reply, "bot");

  } catch (err) {
    addMessage("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", "bot");
  }
}

// ปุ่มกด
sendBtn.addEventListener("click", sendMessage);

// กด Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
