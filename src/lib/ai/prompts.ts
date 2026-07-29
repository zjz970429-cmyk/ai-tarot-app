// Step 20：AI Prompt Engine
// 將原本寫死在 /api/ai/interpret 的 prompt 抽離成可重複使用的 Prompt Builder，
// 讓 /api/ai/interpret（第一次解牌）與 /api/ai/chat（追問聊天）共用同一套
// 人設、界線規則與牌卡格式化邏輯。

export type CardOrientation = "upright" | "reversed";

export interface PromptCard {
  position: string; // 牌陣位置顯示名稱，例如：過去 / Obstacle
  name: string;
  englishName: string;
  orientation: CardOrientation;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PromptMessages {
  system: string;
  user: string;
}

export interface BuildInterpretPromptInput {
  question: string; // 可為空字串
  spreadName: string;
  cards: PromptCard[];
}

export interface BuildChatPromptInput {
  question: string;
  spreadName: string;
  cards: PromptCard[];
  originalInterpretation: string;
  history: ChatHistoryMessage[];
  newMessage: string;
}

export interface ChatPromptResult {
  system: string;
  messages: ChatHistoryMessage[];
}

// 所有 Prompt 共用的塔羅師人設與界線規則。
const SYSTEM_GUIDELINES = `你是一位專業、溫暖、客觀的塔羅占卜師，正在為使用者提供塔羅解讀。

請務必遵守以下原則：
1. 保持專業、溫暖、客觀的語氣，不評判使用者的處境或選擇。
2. 絕不宣稱未來「一定」會發生什麼事；牌義代表可能的趨勢與能量，而非確定的結果。
3. 絕不提供醫療、法律、投資等具有確定性結論的專業建議；若使用者的問題觸及這些領域，請將重點放在情緒、心境與自我覺察層面，並建議使用者諮詢相關領域的專業人士。
4. 始終將塔羅視為自我探索與反思的工具，鼓勵使用者從牌義中看見自己的處境、選擇與內在狀態，而不是把牌義當作宿命的宣告。
5. 全程使用繁體中文撰寫內文，但保留題目要求的英文標題格式（Markdown Heading）。`;

function resolvedMeaning(card: PromptCard): string {
  return card.orientation === "reversed" ? card.reversedMeaning : card.uprightMeaning;
}

function formatCardBlock(card: PromptCard): string {
  const keywordsLine = card.keywords.length > 0 ? card.keywords.join(", ") : "（無）";
  return `${card.position}
${card.name} (${card.orientation})
Keywords:
${keywordsLine}
Meaning:
${resolvedMeaning(card)}`;
}

function formatCardsSection(cards: PromptCard[]): string {
  return cards.map(formatCardBlock).join("\n\n");
}

// 固定回覆格式：每個牌陣位置各一段解讀 → Overall Reading → Practical Guidance → 溫暖結語。
function formatResponseTemplate(cards: PromptCard[]): string {
  const positionSections = cards
    .map(
      (card) =>
        `## ${card.position}\n（針對「${card.position}」這個位置抽到的牌進行解讀，需呼應牌義、正逆位，並連結使用者的問題）`
    )
    .join("\n\n");

  return `${positionSections}

## Overall Reading
（整體串聯所有牌，形成一段連貫、有脈絡的解讀）

## Practical Guidance
（提供 3 點可執行、具體的建議，簡短條列呈現）

最後，請以一句溫暖、鼓勵的話作結，不需要額外標題。`;
}

// 建立「第一次 AI 解牌」的 Prompt（/api/ai/interpret 使用）。
export function buildInterpretPrompt(input: BuildInterpretPromptInput): PromptMessages {
  const { question, spreadName, cards } = input;

  const user = `使用者的問題：${question.trim() || "（使用者沒有提供具體問題）"}

牌陣：${spreadName}

抽到的牌（依牌陣位置排列）：
${formatCardsSection(cards)}

請嚴格依照以下格式回覆（標題請保留原文英文格式，內文請使用繁體中文撰寫）：

${formatResponseTemplate(cards)}`;

  return { system: SYSTEM_GUIDELINES, user };
}

// 建立「AI 追問聊天」的 Prompt（/api/ai/chat 使用）。
// 共用同一套人設與界線規則，並補上原始問題／原始牌陣／原始 AI 解牌／歷史聊天紀錄，
// 讓 AI 在追問時能保持上下文，維持與第一次解讀一致的觀點。
export function buildChatPrompt(input: BuildChatPromptInput): ChatPromptResult {
  const { question, spreadName, cards, originalInterpretation, history, newMessage } =
    input;

  const contextSystem = `${SYSTEM_GUIDELINES}

以下是這次占卜的完整背景，請在回答使用者的追問時緊扣這個背景脈絡，保持與第一次解讀一致的觀點：

原始問題：${question.trim() || "（使用者沒有提供具體問題）"}

牌陣：${spreadName}

抽到的牌（依牌陣位置排列）：
${formatCardsSection(cards)}

第一次 AI 解讀：
${originalInterpretation.trim() || "（無）"}

請使用繁體中文回答追問，語氣溫暖專業，篇幅依問題需要，不必過長，不要條列式，也不需要使用 Markdown 標題。`;

  return {
    system: contextSystem,
    messages: [...history, { role: "user", content: newMessage }],
  };
}
