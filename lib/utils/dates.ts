const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Current ISO timestamp, e.g. 2026-05-17T14:23:45.123Z */
export function now(): string {
  return new Date().toISOString();
}

/** YYYY-MM-DD for today (the calendar date the user is in). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Whole days elapsed since the given ISO date / YYYY-MM-DD.
 * Pass `fromDate` to make this deterministic in tests; defaults to "now".
 */
export function daysSince(isoDate: string, fromDate?: Date): number {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  const from = (fromDate ?? new Date()).getTime();
  const diff = from - then;
  return Math.floor(diff / MS_PER_DAY);
}

/**
 * Compute whole-year age + remainder months from a YYYY-MM-DD date of birth,
 * relative to `fromDate` (defaults to now). Returns null if the DOB is in the
 * future or unparseable. Calendar-month math — DST and tz aren't relevant for
 * an integer age count.
 */
export function ageFromDob(
  dob: string,
  fromDate?: Date,
): { years: number; months: number } | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const from = fromDate ?? new Date();
  if (birth.getTime() > from.getTime()) return null;

  let years = from.getFullYear() - birth.getFullYear();
  let months = from.getMonth() - birth.getMonth();
  if (from.getDate() < birth.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months };
}

/** "Wed · 6 Nov" — short, calm, app-wide date label. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    d,
  );
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
  return `${weekday} · ${day} ${month}`;
}
