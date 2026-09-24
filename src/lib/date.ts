const DAY_MS = 86400000;

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayInput(): string {
  return formatDateInput(new Date());
}

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Hari rental inklusif:
 * 20 Sep - 22 Sep = 3 hari.
 */
export function inclusiveDays(start: string, end: string): number {
  const s = parseDateInput(start);
  const e = parseDateInput(end);
  if (!s || !e) return 0;
  const diff = Math.round((e.getTime() - s.getTime()) / DAY_MS);
  return diff >= 0 ? diff + 1 : 0;
}

/**
 * Deteksi bentrok tanggal booking.
 * existing.start_date <= requested.end_date
 * AND existing.end_date >= requested.start_date
 */
export function isOverlapping(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isWithinDay(day: Date, start: string, end: string): boolean {
  const dayStr = formatDateInput(day);
  return dayStr >= start && dayStr <= end;
}
