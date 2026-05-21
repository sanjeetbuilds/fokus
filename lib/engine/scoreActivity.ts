import type { Activity, Child, Session } from "@/types";
import { daysSince } from "@/lib/utils/dates";
import {
  activityIdToSkill,
  responseValue,
  type ScoredActivity,
} from "./types";

/**
 * Score one activity against the child's age + session history. Pure:
 * no DB, no clock, no randomness. Returns the score and an audit trail
 * (reasons[]) for the /dev/engine debug page and tests.
 *
 * Cleanup pass: the engine no longer takes a PickContext. The Tune-
 * today input is gone, so there are no per-pick time / mood filters,
 * and the engagement / interest / struggle rules were dropped along
 * with the child-profiling page. What's left:
 *
 *   1. Recency             penalize repeats; ease off after frustration
 *   2. Skill coverage      rotate; +30 if a skill is neglected this week
 *   3. Confidence trend    ease off difficulty when the trend is rough
 *   4. Age fit             penalize out-of-range; soften at the floor
 *
 * The pick is therefore driven only by what the child's age allows and
 * how the parent has actually been using the app over the last week or
 * two. Nothing the parent reported about the child as a person feeds
 * into it.
 */
export function scoreActivity(
  activity: Activity,
  child: Child,
  sessions: Session[],
  today: Date,
): ScoredActivity {
  let score = 100;
  const reasons: string[] = [];

  const recent14 = sessions.slice(-14);
  const last7Days = sessions.filter(
    (s) => daysSince(s.date, today) <= 7,
  );

  const adjust = (delta: number, label: string): void => {
    if (delta === 0) return;
    score += delta;
    const sign = delta > 0 ? "+" : "";
    reasons.push(`${label} (${sign}${delta})`);
  };

  // ============ Rule 1: Recency ============
  const lastDoneSession = [...sessions]
    .reverse()
    .find((s) => s.activityId === activity.id);
  if (lastDoneSession) {
    const daysAgo = daysSince(lastDoneSession.date, today);
    if (daysAgo < 14) {
      const penalty = -(14 - daysAgo) * 5;
      adjust(penalty, `Done ${daysAgo}d ago`);
    }
    if (lastDoneSession.response === "frustrated" && daysAgo < 21) {
      adjust(-20, "Recent frustration on this activity");
    }
    if (lastDoneSession.response === "loved" && daysAgo > 7) {
      adjust(+5, "Loved before, ready to revisit");
    }
  }

  // ============ Rule 2: Skill coverage ============
  const skillCountWeek = last7Days.filter(
    (s) => activityIdToSkill(s.activityId) === activity.skill,
  ).length;
  if (skillCountWeek === 0) adjust(+30, "Skill neglected this week");
  if (skillCountWeek === 1) adjust(+5, "Skill seen once this week");
  if (skillCountWeek >= 3) adjust(-30, "Skill overdone this week");

  // ============ Rule 3: Confidence trend in this skill ============
  const skillSessions = recent14.filter(
    (s) => activityIdToSkill(s.activityId) === activity.skill,
  );
  const trend = skillSessions.reduce(
    (sum, s) => sum + responseValue(s.response),
    0,
  );
  if (trend < -5) {
    if (activity.difficulty === 3)
      adjust(-35, "Skill trend negative: ease off difficulty 3");
    if (activity.difficulty === 1)
      adjust(+25, "Skill trend negative: boost difficulty 1");
  }
  if (trend > 12) {
    if (activity.difficulty === 3)
      adjust(+25, "Skill trend positive: stretch with difficulty 3");
    if (activity.difficulty === 1)
      adjust(-15, "Skill trend positive: difficulty 1 too easy");
  }

  // ============ Rule 4: Age fit ============
  const [minAge, maxAge] = activity.ageRange;
  if (child.age < minAge) adjust(-50, "Child too young for this activity");
  if (child.age > maxAge) adjust(-20, "Child past upper age range");
  if (child.age === minAge && activity.difficulty === 3)
    adjust(-15, "At min age + difficulty 3");

  return { activity, score, reasons };
}
