import { NextRequest, NextResponse } from "next/server";
import { gemini, GEMINI_MODEL } from "@/lib/gemini/client";
import { POSITION_LABELS, spreads } from "@/lib/spreads";
import { buildInterpretPrompt, type PromptCard } from "@/lib/ai/prompts";
import { tarotDeck } from "@/lib/tarot-data";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/ai/interpret
// 輸入：使用者問題 + 牌陣抽出的牌（支援任意牌陣，不限定 3 張過去/現在/未來）
//       每張牌含 position（牌陣位置 key）、正逆位與基本牌義
// 輸出：一段 AI 解讀文字（不變：{ interpretation: string }）
// Step 20：Prompt 內容改由 buildInterpretPrompt()（src/lib/ai/prompts.ts）統一組裝。
// Step 23：套用 Rate Limit（未登入依 IP 每小時 10 次、已登入依 user_id 每日 100 次），
// 超過限制回傳 429 + { error: "Rate limit exceeded." }，不影響 Prompt 內容。
// Step 25：rate-limit.ts 內部改用 Upstash Redis 儲存次數，checkRateLimit() 變成
// 非同步，這裡加上 await；限制數字與回應格式都沒有變。
interface InterpretCard {
  position: string;
  name: string;
  englishName: string;
  reversed: boolean;
  meaning: string;
}

interface InterpretRequestBody {
  question?: string;
  cards?: InterpretCard[];
}

// englishName → 完整牌卡資料（含 keywords、正逆位牌義），用來補齊 Prompt 需要但目前
// 前端請求尚未送出的欄位，不需要修改 UI 或請求格式。
const CARD_BY_ENGLISH_NAME: Record<string, (typeof tarotDeck)[number]> =
  Object.fromEntries(tarotDeck.map((card) => [card.englishName, card]));

function toPromptCard(card: InterpretCard): PromptCard {
  const fullCard = CARD_BY_ENGLISH_NAME[card.englishName];

  return {
    position: POSITION_LABELS[card.position] ?? card.position,
    name: card.name,
    englishName: card.englishName,
    orientation: card.reversed ? "reversed" : "upright",
    keywords: fullCard?.keywords ?? [],
    uprightMeaning: fullCard?.uprightMeaning ?? (!card.reversed ? card.meaning : ""),
    reversedMeaning: fullCard?.reversedMeaning ?? (card.reversed ? card.meaning : ""),
  };
}

export async function POST(req: NextRequest) {
  let body: InterpretRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  const question = body.question?.trim() ?? "";
  const cards = body.cards;

  if (!Array.isArray(cards) || cards.length === 0) {
    return NextResponse.json({ error: "缺少抽牌資料" }, { status: 400 });
  }

  // Rate Limit：已登入依 user_id，未登入依 IP。
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const rateLimitResult = await checkRateLimit("interpret", {
    userId: authUser?.id ?? null,
    ip: getClientIp(req),
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }

  // 依第一張牌的 position key 反查所屬牌陣（所有牌陣的 position key 全域唯一），
  // 藉此取得牌陣名稱，不需要修改 UI 請求格式（目前請求本來就沒有帶 spreadId）。
  const matchedSpread = spreads.find((spread) =>
    spread.positions.some((p) => p.key === cards[0].position)
  );
  const spreadName = matchedSpread?.name ?? `${cards.length} 張牌牌陣`;

  const { system, user } = buildInterpretPrompt({
    question,
    spreadName,
    cards: cards.map(toPromptCard),
  });

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: user }] }],
      config: {
        systemInstruction: system,
        temperature: 0.8,
        maxOutputTokens: 900,
      },
    });

    const interpretation = response.text?.trim();

    if (!interpretation) {
      return NextResponse.json(
        { error: "AI 沒有回傳內容，請稍後再試" },
        { status: 502 }
      );
    }

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error("AI interpret error:", error);
    return NextResponse.json(
      { error: "AI 解牌失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
