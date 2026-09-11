export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const cmp = new Date(date);
  cmp.setHours(0, 0, 0, 0);

  if (cmp.getTime() === today.getTime()) return 'Today';
  if (cmp.getTime() === yesterday.getTime()) return 'Yesterday';
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
