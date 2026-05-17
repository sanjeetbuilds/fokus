import type { Activity, Child, Session } from "@/types";
import { scoreActivity } from "./scoreActivity";
import { RestDayError, type PickContext, type ScoredActivity } from "./types";

export interface PickResult {
  pick: Activity;
  scored: ScoredActivity[]; // full list, sorted desc by score
}

/**
 * Pick today's activity. Implements SPEC §7 verbatim:
 *   1. Score every activity.
 *   2. Sort descending.
 *   3. From the top 3, do a weighted-random draw (weight = max(1, score))
 *      so the same activity isn't picked back-to-back when state is similar.
 *   4. If literally every activity scores below zero, throw RestDayError.
 *
 * `today` and `rng` are injected so tests can be deterministic.
 */
export function pickActivity(
  child: Child,
  sessions: Session[],
  context: PickContext,
  today: Date,
  activities: Activity[],
  rng: () => number = Math.random,
): PickResult {
  const scored = activities
    .map((a) => scoreActivity(a, child, sessions, context, today))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    throw new RestDayError();
  }

  const allBelowZero = scored.every((x) => x.score < 0);
  if (allBelowZero) {
    throw new RestDayError();
  }

  const top3 = scored.slice(0, 3);
  const totalWeight = top3.reduce((s, x) => s + Math.max(1, x.score), 0);
  let r = rng() * totalWeight;
  for (const x of top3) {
    r -= Math.max(1, x.score);
    if (r <= 0) return { pick: x.activity, scored };
  }
  // Fallback (shouldn't reach here unless rng() returns exactly 1.0)
  return { pick: top3[0]!.activity, scored };
}
