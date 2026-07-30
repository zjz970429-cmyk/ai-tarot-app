import { GoogleGenAI } from "@google/genai";

// Gemini client 單例（僅供伺服器端使用，切勿在 Client Component 中引用）。
// 取代原本的 OpenAI（原因：OpenAI 沒有免費額度，Gemini 有可長期使用的免費方案）。
//
// 用 Proxy 延後真正 new GoogleGenAI(...) 的時機到第一次實際使用才建立（同 rate-limit.ts
// 對 Redis 的處理方式）：避免 Next.js build 的「Collecting page data」階段在
// GEMINI_API_KEY 還沒設定時就把整個 build 弄失敗。
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export const gemini: GoogleGenAI = new Proxy({} as GoogleGenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

// 目前使用的模型：gemini-3.5-flash（2026 年中的當前世代快速模型，有可長期使用
// 的免費額度，適合這個用量不大的塔羅占卜 App；若之後 Google 調整模型名稱，
// 只需要改這裡一個字串）。
export const GEMINI_MODEL = "gemini-3.5-flash";
