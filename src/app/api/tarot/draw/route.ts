import { NextRequest, NextResponse } from "next/server";

// POST /api/tarot/draw
// 依使用者問題進行洗牌 + 抽牌，回傳抽到的牌卡（含正逆位）
// TODO: 實作抽牌邏輯（見 src/lib/tarot/deck.ts）
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { message: "Not implemented yet" },
    { status: 501 }
  );
}
