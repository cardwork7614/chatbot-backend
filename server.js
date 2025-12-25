import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

/* ===== Path ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== App ===== */
dotenv.config();
const app = express();

/* ===== Middleware ===== */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== Rate limit ===== */
const RATE_LIMIT = 10;
const userRequests = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowTime = 60 * 1000;

  if (!userRequests.has(ip)) {
    userRequests.set(ip, []);
  }

  const timestamps = userRequests
    .get(ip)
    .filter(t => now - t < windowTime);

  timestamps.push(now);
  userRequests.set(ip, timestamps);

  return timestamps.length > RATE_LIMIT;
}

/* ===== OpenAI ===== */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===== Chat API ===== */
app.post("/chat", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (isRateLimited(ip)) {
    return res.status(429).json({
      reply: "คุณส่งข้อความเร็วเกินไป กรุณารอสักครู่ 🤍",
    });
  }

  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text: "คุณคือ SOULMATE AI ผู้ช่วยสุขภาพใจ พูดอย่างอ่อนโยน"
          }]
        },
        {
          role: "user",
          content: [{
            type: "input_text",
            text: message
          }]
        }
      ],
      max_output_tokens: 200,
    });

    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "ฉันยังคิดคำตอบไม่ออกตอนนี้นะ 🤍";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "เกิดข้อผิดพลาดจาก AI" });
  }
});

/* ===== Start server ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
