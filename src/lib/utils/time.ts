import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return '今天';
  if (isYesterday(d)) return '昨天';
  return format(d, 'yyyy-MM-dd', { locale: zhCN });
}

export function formatFullDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}
