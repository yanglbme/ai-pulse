import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const BEIJING_TZ = 'Asia/Shanghai';

// Helper to format a date in Beijing time consistently across Server and Client
const formatInBeijing = (date: Date, options: Intl.DateTimeFormatOptions): string => {
  return new Intl.DateTimeFormat('zh-CN', { ...options, timeZone: BEIJING_TZ }).format(date);
};

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Relative time is universal. "5 mins ago" is true everywhere, no timezone shift needed.
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

export function formatFullDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use toLocaleString to get Beijing time, replace '/' with '-' for consistency
  return formatInBeijing(d, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).replace(/\//g, '-');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Compare dates based on Beijing time
  const dStr = formatInBeijing(d, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const nowStr = formatInBeijing(now, { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  // Check yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatInBeijing(yesterday, { year: 'numeric', month: '2-digit', day: '2-digit' });

  if (dStr === nowStr) return '今天';
  if (dStr === yesterdayStr) return '昨天';
  
  return dStr.replace(/\//g, '-');
}
