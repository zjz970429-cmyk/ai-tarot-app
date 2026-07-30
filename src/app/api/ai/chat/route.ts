import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gemini, GEMINI_MODEL } from "@/lib/gemini/client";
import { POSITION_LABELS, POSITION_ORDER, getSpreadById } from "@/lib/spreads";
import { buildChatPrompt, type ChatHistoryMessage, type PromptCard } from "@/lib/ai/prompts";
import { tarotDeck } from "@/lib/tarot-data";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/ai/chat（針對某次占卜的 AI 追問聊天）
// 輸入：{ readingId, message }
// 流程：
//   1. 依 readingId 讀取原始占卜（問題／牌陣／抽出的牌／正逆位／第一次 AI 解讀）作為上下文
//   2. 讀取這次占卜先前的 chat_messages（依時間排序）延續對話
//   3. 呼叫 OpenAI，取得回覆
//   4. 把使用者訊息與 AI 回覆都寫入 chat_messages
// 不修改 /api/ai/interpret（原本的 AI 解牌 API）。
// Step 20：Prompt 內容改由 buildChatPrompt()（src/lib/ai/prompts.ts）統一組裝，
// 與 /api/ai/interpret 共用同一套人設與界線規則，回傳格式（{ reply: string }）不變。
// Step 23：套用 Rate Limit（未登入依 IP 每小時 30 次、已登入依 user_id 每日 300 次），
// 超過限制回傳 429 + { error: "Rate limit exceeded." }，不影響 Prompt 內容。
// Step 25：rate-limit.ts 內部改用 Upstash Redis 儲存次數，checkRateLimit() 變成
// 非同步，這裡加上 await；限制數字與回應格式都沒有變。
// Step 24：加入擁有者檢查。readings 的 SELECT RLS policy 是「自己的 OR is_public=true」，
// 單靠「查得到這筆 reading」不能代表請求者就是本人——任何人都能用一個已公開分享的
// readingId 呼叫這支 API，繞過「只有本人能追問」的設計。這裡額外比對
// reading.user_id 是否等於目前登入者，不是就一律當成 404，不區分「不存在」跟
// 「不是你的」，避免洩漏這筆 reading 是否存在。
type ChatRole = "user" | "assistant";

interface ChatRequestBody {
  readingId?: string;
  message?: string;
}

interface ReadingCardRow {
  position: string;
  card_id: string;
  card_name: string;
  is_reversed: boolean;
  upright_meaning: string | null;
  reversed_meaning: string | null;
}

const CARD_BY_ID: Record<string, (typeof tarotDeck)[number]> = Object.fromEntries(
  tarotDeck.map((card) => [card.id, card])
);

function toPromptCard(card: ReadingCardRow): PromptCard {
  const fullCard = CARD_BY_ID[card.card_id];

  return {
    position: POSITION_LABELS[card.position] ?? card.position,
    name: card.card_name,
    englishName: fullCard?.englishName ?? card.card_name,
    orientation: card.is_reversed ? "reversed" : "upright",
    keywords: fullCard?.keywords ?? [],
    uprightMeaning: card.upright_meaning ?? fullCard?.uprightMeaning ?? "",
    reversedMeaning: card.reversed_meaning ?? fullCard?.reversedMeaning ?? "",
  };
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const readingId = body.readingId;
  const message = body.message?.trim();

  if (!readingId) {
    return NextResponse.json({ error: "缺少 readingId" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "訊息不可為空" }, { status: 400 });
  }

  const supabase = createClient();

  // Rate Limit：已登入依 user_id，未登入依 IP。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimitResult = await checkRateLimit("chat", {
    userId: user?.id ?? null,
    ip: getClientIp(req),
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  // 1. 讀取原始占卜上下文（含牌陣 spread_id 與每張牌的完整正逆位牌義）
  const { data: readingData, error: readingError } = await supabase
    .from("readings")
    .select(
      "id, user_id, question, ai_interpretation, spread_id, reading_cards(position, card_id, card_name, is_reversed, upright_meaning, reversed_meaning)"
    )
    .eq("id", readingId)
    .single();

  if (readingError || !readingData) {
    return NextResponse.json({ error: "找不到這次占卜紀錄" }, { status: 404 });
  }

  const reading = readingData as unknown as {
    user_id: string;
    question: string | null;
    ai_interpretation: string | null;
    spread_id: string | null;
    reading_cards: ReadingCardRow[];
  };

  // 擁有者檢查：就算這筆 reading 因為已公開分享而查得到，也只有本人能追問聊天。
  if (!user || reading.user_id !== user.id) {
    return NextResponse.json({ error: "找不到這次占卜紀錄" }, { status: 404 });
  }

  // 2. 讀取先前的聊天紀錄
  const { data: priorMessages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("reading_id", readingId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: "讀取聊天紀錄失敗" }, { status: 500 });
  }

  const sortedCards = (reading.reading_cards ?? [])
    .slice()
    .sort(
      (a, b) => (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0)
    );

  const spreadName =
    (reading.spread_id ? getSpreadById(reading.spread_id)?.name : undefined) ??
    "塔羅牌陣";

  const history: ChatHistoryMessage[] = (priorMessages ?? []).map((m) => ({
    role: m.role as ChatRole,
    content: m.content as string,
  }));

  const { system, messages: chatMessages } = buildChatPrompt({
    question: reading.question ?? "",
    spreadName,
    cards: sortedCards.map(toPromptCard),
    originalInterpretation: reading.ai_interpretation ?? "",
    history,
    newMessage: message,
  });

  // buildChatPrompt() 回傳的 messages 是 OpenAI 風格的 {role:"user"|"assistant", content}
  // 陣列（history 一定是 user/assistant 交替，且一定以 newMessage 這則 user 訊息結尾）。
  // Gemini 的 contents 格式把 assistant 角色叫做 "model"，內容包在 parts: [{ text }] 裡，
  // 這裡單純做格式轉換，對話內容與順序完全不變。
  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: system,
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    });

    const reply = response.text?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "AI 沒有回傳內容，請稍後再試" },
        { status: 502 }
      );
    }

    const { error: insertError } = await supabase.from("chat_messages").insert([
      { reading_id: readingId, role: "user", content: message },
      { reading_id: readingId, role: "assistant", content: reply },
    ]);

    if (insertError) {
      console.error("寫入 chat_messages 失敗：", insertError);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI 回覆失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
