export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export type UserTier = 'free' | 'pro' | 'max';

export const TIER_LIMITS = {
  free: { images: 15, model: 'gpt-4o-mini', speed: 'normal' },
  pro: { images: 50, model: 'gpt-4o', speed: 'fast' },
  max: { images: Infinity, model: 'gpt-4o', speed: 'fastest', thinking: true },
};

export const TIER_PRICES = {
  pro: 9.99,
  max: 29.99,
};
