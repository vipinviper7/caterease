import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatCurrency(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'hh:mm a');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return format(d, 'hh:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM');
}

export function formatMessageTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatGuestCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k guests`;
  return `${count} guests`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
