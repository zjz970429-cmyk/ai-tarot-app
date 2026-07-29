import OpenAI from "openai";

// OpenAI client 單例（僅供伺服器端使用，切勿在 Client Component 中引用）
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
