"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// 可重複使用的首頁動作卡片
// 用於：今日塔羅／開始占卜／我的紀錄／AI 塔羅老師／Premium
// 動畫：Fade（進場淡入）＋ Hover（滑鼠懸停）
interface ActionCardProps {
  href: string;
  title: string;
  subtitle: string;
  className: string;
  titleClassName: string;
  subtitleClassName: string;
  arrow?: string;
  arrowClassName?: string;
}

const MotionLink = motion.create(Link);

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

const hover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export default function ActionCard({
  href,
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  arrow,
  arrowClassName,
}: ActionCardProps) {
  if (arrow) {
    return (
      <MotionLink href={href} className={className} {...fadeIn} {...hover}>
        <div>
          <p className={titleClassName}>{title}</p>
          <p className={subtitleClassName}>{subtitle}</p>
        </div>
        <span className={arrowClassName}>{arrow}</span>
      </MotionLink>
    );
  }

  return (
    <MotionLink href={href} className={className} {...fadeIn} {...hover}>
      <p className={titleClassName}>{title}</p>
      <p className={subtitleClassName}>{subtitle}</p>
    </MotionLink>
  );
}
