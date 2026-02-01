export type IstGreetingVariant = 'morning' | 'afternoon' | 'evening' | 'night';

export function getIstHour(date: Date = new Date()): number | null {
  try {
    const hourPart = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .find((p) => p.type === 'hour')?.value;

    const h = Number.parseInt(String(hourPart || ''), 10);
    if (!Number.isFinite(h)) return null;
    return h;
  } catch {
    return null;
  }
}

export function getIstGreetingVariant(date: Date = new Date()): IstGreetingVariant {
  const h = getIstHour(date);

  // If time zone formatting fails, fall back to local time.
  const hr = h == null ? date.getHours() : h;

  // Required IST time ranges:
  // 5 AM - 12 PM: morning
  // 12 PM - 5 PM: afternoon
  // 5 PM - 9 PM: evening
  // 9 PM - 5 AM: night
  if (hr >= 5 && hr < 12) return 'morning';
  if (hr >= 12 && hr < 17) return 'afternoon';
  if (hr >= 17 && hr < 21) return 'evening';
  return 'night';
}

export function getIstGreeting(
  options: {
    date?: Date;
    fallback?: string;
  } = {}
): string {
  const date = options.date ?? new Date();
  const fallback = options.fallback ?? 'Hello';

  try {
    const variant = getIstGreetingVariant(date);
    if (variant === 'morning') return 'Good morning';
    if (variant === 'afternoon') return 'Good afternoon';
    if (variant === 'evening') return 'Good evening';
    return 'Good night';
  } catch {
    return fallback;
  }
}
