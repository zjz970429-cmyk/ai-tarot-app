import { format } from "date-fns";

// 日期格式化共用工具
export function formatDate(date: Date | string, pattern = "yyyy/MM/dd") {
  return format(new Date(date), pattern);
}
