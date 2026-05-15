import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Vercel 服务器默认 UTC，转换为北京时间 (UTC+8)
function toBeijingTime(date: Date): Date {
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(toBeijingTime(d), { addSuffix: true, locale: zhCN });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const bj = toBeijingTime(d);
  if (isToday(bj)) return '今天';
  if (isYesterday(bj)) return '昨天';
  return format(bj, 'yyyy-MM-dd', { locale: zhCN });
}

export function formatFullDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(toBeijingTime(d), 'yyyy-MM-dd HH:mm', { locale: zhCN });
}
