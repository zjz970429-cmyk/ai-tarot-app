"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// 可重複使用的首頁功能卡片／按鈕
// 動畫：Hover Scale（滑鼠懸停放大）＋ Button Press（按下縮小）
interface FeatureCardProps {
  href: string;
  label: string;
  className: string;
}

const MotionLink = motion.create(Link);

export default function FeatureCard({ href, label, className }: FeatureCardProps) {
  return (
    <MotionLink
      href={href}
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {label}
    </MotionLink>
  );
}
