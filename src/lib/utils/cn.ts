import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 合併 Tailwind class 的共用工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
