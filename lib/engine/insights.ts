import type { Session } from "@/types";
import { responseValue } from "./types";

/**
 * Map insights — small derived stats kept here (rather than inside
 * /lib/engine) so the Map view can pull them with one import.
 *
 * Pure functions: no DB, no clock outside `today` (which the caller passes
 * in for testability).
 */

export interface MapStats {
  streak: number;
  totalDays: number;
  sessions: number;
}

/**
 * Streak = consecutive days with ≥1 session, counting backwards.
 *
 * If today already has a session, today counts and we walk back. If today
 * has no session yet but yesterday does, the streak is still alive (we
 * don't break a streak until the day is actually over). When `today` itself
 * has no session, we start counting from `today - 1` so the user keeps
 * yesterday's number visible until the day ends.
 */
export function computeStreak(sessions: Session[], today: string): number {
  const dates = new Set(sessions.map((s) => s.date));
  const start = new Date(today + "T00:00:00Z");

  if (!dates.has(today)) {
    start.setUTCDate(start.getUTCDate() - 1);
  }

  let streak = 0;
  // Defensive cap so a corrupt session set can never spin forever.
  for (let i = 0; i < 10_000; i++) {
    const iso = start.toISOString().slice(0, 10);
    if (!dates.has(iso)) break;
    streak += 1;
    start.setUTCDate(start.getUTCDate() - 1);
  }
  return streak;
}

export function computeMapStats(
  sessions: Session[],
  today: string,
): MapStats {
  const distinctDays = new Set(sessions.map((s) => s.date));
  return {
    streak: computeStreak(sessions, today),
    totalDays: distinctDays.size,
    sessions: sessions.length,
  };
}

export type TrendDirection = "improving" | "steady" | "needs-attention";

export interface TrendSummary {
  direction: TrendDirection;
  label: string;
  arrow: "↑" | "→" | "↓";
  /** Sum of responseValue across the most recent N (default 3) sessions in this slice. */
  score: number;
}

/**
 * Trend for a window of recent sessions (the caller filters down to the
 * skill they care about). Thresholds tuned so:
 *   2 engaged + 1 loved (5+5+8 = 18)   → improving
 *   1 engaged + 1 neutral + 1 strgl (5+1-2 = 4) → steady
 *   2 frustrated + 1 neutral (-5-5+1 = -9)      → needs-attention
 *
 * Empty input returns "steady" — no data, no judgment.
 */
export function computeTrend(
  sessions: Session[],
  windowSize: number = 3,
): TrendSummary {
  const slice = sessions.slice(-windowSize);
  const score = slice.reduce((sum, s) => sum + responseValue(s.response), 0);

  if (slice.length === 0) {
    return { direction: "steady", label: "Steady", arrow: "→", score: 0 };
  }
  if (score > 5) {
    return { direction: "improving", label: "Improving", arrow: "↑", score };
  }
  if (score < 0) {
    return {
      direction: "needs-attention",
      label: "Needs attention",
      arrow: "↓",
      score,
    };
  }
  return { direction: "steady", label: "Steady", arrow: "→", score };
}
