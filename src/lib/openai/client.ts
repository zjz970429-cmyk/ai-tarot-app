import OpenAI from "openai";

// OpenAI client 單例（僅供伺服器端使用，切勿在 Client Component 中引用）
//
// 用 Proxy 延後真正 new OpenAI(...) 的時機到第一次實際使用（例如
// openai.chat.completions.create(...)）才建立，而不是在 import 這個檔案的當下
// 就建立。原因：OpenAI SDK 的 constructor 只要 apiKey 是空字串就會直接 throw，
// 而 Next.js build 的「Collecting page data」階段會靜態 import 每個 API Route
// 的模組（包含這個檔案），如果當下環境變數還沒設定（例如 Vercel 專案還沒填
// OPENAI_API_KEY），整個 build 就會在這個階段直接失敗——即使沒有任何一個請求
// 真的呼叫到 AI API。延後建立可以讓 build 本身不依賴這把金鑰是否已設定，金鑰
// 真正遺漏時仍然會在「實際呼叫 AI API」的當下丟出清楚的錯誤。
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
