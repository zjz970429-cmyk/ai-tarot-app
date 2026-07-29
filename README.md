# AI 塔羅 App — 專案架構（Step 1）

本階段僅建立完整專案架構與資料夾結構，尚未實作任何畫面邏輯或 AI 功能。

## 技術棧

- 前端：Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + Framer Motion
- 後端：Supabase（Auth + Database）
- AI：OpenAI API

## 設計系統

- 背景：`#0B0B0B`
- 主色：`#6D4AFF`
- 金色點綴：`#D4AF37`
- 文字：白色
- 風格：深色模式、玻璃擬態（Glassmorphism）、星空元素、簡約高級

色彩與樣式皆已設定於 `tailwind.config.ts` 與 `src/app/globals.css`，之後每個畫面可直接使用
`bg-background`、`text-gold`、`bg-primary`、`.glass` 等 class。

## 資料夾結構

```
tarot-app/
├── public/
│   ├── fonts/                     字體檔案
│   └── images/
│       ├── cards/                 78 張塔羅牌圖片
│       └── icons/                 App icon / UI icon
├── src/
│   ├── app/                       Next.js App Router
│   │   ├── layout.tsx             全站 Root Layout
│   │   ├── page.tsx               首頁
│   │   ├── globals.css            全域樣式 / 設計 token
│   │   ├── (auth)/                登入／註冊
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/                需登入的主功能區
│   │   │   ├── today/             今日塔羅
│   │   │   ├── reading/           開始占卜（含 [id] 結果詳情頁）
│   │   │   ├── history/           我的紀錄
│   │   │   ├── ai-teacher/        AI 塔羅老師
│   │   │   ├── premium/           Premium 訂閱
│   │   │   └── profile/           個人資料
│   │   └── api/                   Route Handlers
│   │       ├── tarot/draw/        抽牌 API
│   │       ├── ai/interpret/      AI 解牌 API
│   │       ├── ai/chat/           AI 塔羅老師對話 API
│   │       └── auth/callback/     Supabase Auth callback
│   ├── components/
│   │   ├── ui/                    基礎元件（Button、Card、GlassPanel、StarField…）
│   │   ├── layout/                Header、BottomNav、PageContainer
│   │   ├── tarot/                 CardDeck、TarotCard、洗牌/翻牌動畫、解牌結果
│   │   └── home/                  首頁專用區塊元件
│   ├── lib/
│   │   ├── supabase/              client.ts / server.ts / middleware.ts / database.types.ts
│   │   ├── openai/                client.ts / prompts.ts
│   │   ├── tarot/                 deck.ts（78 張牌資料）／card-meanings.ts（牌義）
│   │   └── utils/                 cn.ts（Tailwind class 合併）／date.ts
│   ├── hooks/                     use-tarot-deck / use-auth / use-reading-history
│   ├── stores/                    zustand store（reading-store、user-store）
│   ├── types/                     tarot.ts / user.ts / database.ts
│   ├── config/                    site.ts / theme.ts
│   └── middleware.ts              Supabase session middleware
└── supabase/
    ├── migrations/                資料庫 schema（尚未建立）
    └── seed.sql                   種子資料（尚未建立）
```

## 占卜流程對應的檔案位置（先預留，尚未實作）

輸入問題 → 洗牌動畫 → 抽牌 → 翻牌動畫 → AI 解牌 → 儲存紀錄

對應：`src/app/(main)/reading/page.tsx` + `src/components/tarot/*` + `src/app/api/tarot/draw` + `src/app/api/ai/interpret`

AI 解牌結構化欄位（整體分析／感情／工作／財運／今日提醒／幸運色／幸運數字／建議行動／避免事項）
已定義於 `src/types/tarot.ts` 的 `TarotInterpretation`。

## 啟動方式

```bash
npm install
cp .env.local.example .env.local   # 填入 Supabase / OpenAI 金鑰
npm run dev
```

## 下一步規劃（等待確認）

1. 資料庫 schema 設計（users / readings / subscriptions）
2. 塔羅牌資料（78 張牌 + 牌義）
3. 首頁 UI（今日塔羅／開始占卜／我的紀錄／AI塔羅老師／Premium）
4. 占卜流程 UI 與動畫（洗牌／抽牌／翻牌）
5. AI 解牌串接（OpenAI）
6. AI 塔羅老師對話介面
7. Premium 訂閱與付款
8. App Store / Google Play 上架（Capacitor 封裝）
