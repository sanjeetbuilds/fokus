import { getActivityById } from "@/lib/content/activities";
import type { Activity, SessionResponse, SkillKey } from "@/types";

/**
 * Numeric value assigned to each response, per spec §7.
 *   loved: +8, engaged: +5, neutral: +1,
 *   struggled: -2, frustrated: -5, skipped: -1
 */
export type ResponseValue = -5 | -2 | -1 | 1 | 5 | 8 | 0;

const RESPONSE_VALUE: Record<SessionResponse, ResponseValue> = {
  loved: 8,
  engaged: 5,
  neutral: 1,
  struggled: -2,
  frustrated: -5,
  skipped: -1,
};

export function responseValue(response: SessionResponse): ResponseValue {
  return RESPONSE_VALUE[response] ?? 0;
}

/**
 * The output of scoreActivity: the activity, its score, and a transparent
 * audit trail. `reasons` is appended-to by every rule that adjusted the
 * score (skipped rules add nothing). Useful for the /dev/engine debug page
 * and for tests that need to assert "this rule fired."
 */
export interface ScoredActivity {
  activity: Activity;
  score: number;
  reasons: string[];
}

/**
 * Look up an activity's skill from its id. Used by the engine when scoring
 * sessions whose skill is implied by the activityId they reference.
 * Returns undefined for unknown ids (stale data); callers treat those
 * sessions as belonging to no current skill.
 */
export function activityIdToSkill(activityId: string): SkillKey | undefined {
  return getActivityById(activityId)?.skill;
}

/**
 * Thrown by pickActivity when literally every activity scores below zero.
 * Caller is expected to catch and render the "rest day" message from spec
 * §7 ("Take today off. Just be with [Child]. The work is the relationship.").
 */
export class RestDayError extends Error {
  constructor() {
    super(
      "All activities scored below zero. Rest day. Just be with your child.",
    );
    this.name = "RestDayError";
  }
}
