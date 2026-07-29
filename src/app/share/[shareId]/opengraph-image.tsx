import { ImageResponse } from "next/og";
import { getSpreadById, POSITION_LABELS } from "@/lib/spreads";
import { getSharedReading } from "./data";

// 動態 Open Graph 分享圖片（Step 22）
// 對應 /share/[shareId]，內容包含問題、抽到的牌與「AI Tarot」標識，金色 + 深色主題。
// 與 page.tsx 共用同一份 getSharedReading() 查詢（React cache，同請求內不重複打 Supabase）。
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AI Tarot Reading";

export default async function OpengraphImage({
  params,
}: {
  params: { shareId: string };
}) {
  const reading = await getSharedReading(params.shareId);

  const BG = "#0B0B0B";
  const PRIMARY = "#6D4AFF";
  const GOLD = "#D4AF37";

  if (!reading) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: BG,
            color: "#FFFFFF",
          }}
        >
          <div style={{ fontSize: 32, letterSpacing: 10, color: GOLD }}>
            AI TAROT
          </div>
          <div style={{ marginTop: 24, fontSize: 40, color: "rgba(255,255,255,0.6)" }}>
            此占卜尚未公開
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const spread = reading.spread_id ? getSpreadById(reading.spread_id) : undefined;
  const question = reading.question?.trim();
  const cards = [...reading.reading_cards].slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 50% 0%, ${PRIMARY}33 0%, ${BG} 60%)`,
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 10,
            color: GOLD,
            marginBottom: 28,
          }}
        >
          AI TAROT
        </div>

        {question && (
          <div
            style={{
              display: "flex",
              fontSize: 42,
              color: "#FFFFFF",
              textAlign: "center",
              maxWidth: 960,
              marginBottom: 36,
              lineHeight: 1.4,
            }}
          >
            「{question}」
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: `2px solid ${GOLD}`,
                borderRadius: 20,
                padding: "20px 22px",
                backgroundColor: "rgba(212,175,55,0.08)",
                minWidth: 160,
              }}
            >
              <div style={{ display: "flex", fontSize: 16, color: GOLD, marginBottom: 8 }}>
                {POSITION_LABELS[card.position] ?? card.position}
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "#FFFFFF" }}>
                {card.card_name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 6,
                }}
              >
                {card.is_reversed ? "逆位" : "正位"}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {spread ? spread.name : "塔羅牌陣"} · Mystic AI Tarot
        </div>
      </div>
    ),
    { ...size }
  );
}
