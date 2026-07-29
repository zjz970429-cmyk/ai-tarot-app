import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Step 23：AI API Rate Limit（原本記憶體內固定窗口限流）
// Step 25：改用 Upstash Redis。原本的實作把次數存在單一 Node process 的記憶體 Map 裡，
// 但 Vercel 上的 API Route 是 serverless function，同時可能有多個實例、也會冷啟動重置，
// 「每小時 10 次」這種限制在多實例情況下形同虛設。Upstash Redis 是所有函式實例共用的
// 外部狀態，才能真正擋住跨實例的重複呼叫。
// 套用於 /api/ai/interpret 與 /api/ai/chat，對外的函式介面（checkRateLimit / getClientIp）
// 維持不變，只有 checkRateLimit 從同步改成非同步（呼叫端要加 await）。

export type RateLimitAction = "interpret" | "chat";

const redis = Redis.fromEnv();

// 未登入（依 IP）：AI 解牌每小時 10 次、AI 對話每小時 30 次。
const anonymousInterpretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "1 h"),
  prefix: "ratelimit:anon:interpret",
  analytics: false,
});

const anonymousChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(30, "1 h"),
  prefix: "ratelimit:anon:chat",
  analytics: false,
});

// 已登入（依 user_id）：AI 解牌每日 100 次、AI 對話每日 300 次。
const authenticatedInterpretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(100, "1 d"),
  prefix: "ratelimit:user:interpret",
  analytics: false,
});

const authenticatedChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(300, "1 d"),
  prefix: "ratelimit:user:chat",
  analytics: false,
});

export interface RateLimitIdentity {
  /** 已登入使用者的 user_id；未登入時傳入 null / undefined。 */
  userId?: string | null;
  /** 未登入時用來限流的 IP 位址。 */
  ip: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** 目前窗口重置的時間戳（ms）。 */
  resetAt: number;
}

function resolveLimiter(
  action: RateLimitAction,
  identity: RateLimitIdentity
): { limiter: Ratelimit; key: string } {
  if (identity.userId) {
    return {
      limiter: action === "interpret" ? authenticatedInterpretLimiter : authenticatedChatLimiter,
      key: `user:${identity.userId}`,
    };
  }
  return {
    limiter: action === "interpret" ? anonymousInterpretLimiter : anonymousChatLimiter,
    key: `ip:${identity.ip}`,
  };
}

// 檢查並「消耗」一次額度：允許的話會直接把這次請求計入次數（Upstash 內部以
// Redis 的 atomic INCR/EXPIRE 實作，多個 serverless 實例同時呼叫也不會算錯）。
export async function checkRateLimit(
  action: RateLimitAction,
  identity: RateLimitIdentity
): Promise<RateLimitResult> {
  const { limiter, key } = resolveLimiter(action, identity);
  const result = await limiter.limit(key);

  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

// 從 Request 取得客戶端 IP（依序嘗試常見的 proxy header，找不到則回傳 "unknown"）。
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
