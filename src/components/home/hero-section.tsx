"use client";

import { motion } from "framer-motion";

// 首頁上方區塊：Logo + 歡迎文字
// 動畫：Fade In（進場淡入）
// 用 `contents` 讓 motion.div 不產生額外版面盒子，維持原本 flex 版面完全不變。
export default function HeroSection() {
  return (
    <motion.div
      className="contents"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-white/5">
        <span className="text-2xl">✦</span>
      </div>
      <h1 className="mb-4 text-2xl font-semibold tracking-wide text-white">
        Mystic AI Tarot
      </h1>

      <p className="mb-10 max-w-xs text-center text-base text-white/70">
        歡迎回來，讓塔羅為你揭示今天的訊息
      </p>
    </motion.div>
  );
}
