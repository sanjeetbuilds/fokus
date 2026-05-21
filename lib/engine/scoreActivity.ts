import type { Activity, Child, Session } from "@/types";
import { daysSince } from "@/lib/utils/dates";
import {
  activityIdToSkill,
  responseValue,
  type PickContext,
  type ScoredActivity,
} from "./types";

const DURATION_FIT: Record<
  PickContext["timeAvailable"],
  { ideal: number; range: [number, number] }
> = {
  short: { ideal: 7, range: [5, 10] },
  medium: { ideal: 13, range: [10, 18] },
  long: { ideal: 22, range: [18, 30] },
};

/**
 * Score one activity against one child + their session history + today's
 * context. Pure: no DB, no clock, no randomness. Returns the score and
 * an audit trail (reasons[]) for the /dev/engine debug page and tests.
 *
 * Cleanup pass: dropped the engagement / interests / struggle-priority
 * rules that personalised the pick to tag selections on the (now
 * deleted) child-profiling page. The remaining rules score by:
 *   - time fit (duration vs context.timeAvailable)
 *   - mood fit (difficulty + skill vs context.childMood)
 *   - recency (don't repeat too soon)
 *   - skill coverage (rotate)
 *   - confidence trend in this skill
 *   - age fit
 *
 * Rules 1 + 2 will be removed in the next pass when the Tune-today
 * input disappears; the engine will be called with default context
 * until then.
 */
export function scoreActivity(
  activity: Activity,
  child: Child,
  sessions: Session[],
  context: PickContext,
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

  // ============ Rule 1: Time fit ============
  const durationMatch = DURATION_FIT[context.timeAvailable];
  if (activity.duration < durationMatch.range[0]) {
    adjust(-40, "Duration too short for time available");
  } else if (activity.duration > durationMatch.range[1]) {
    adjust(-60, "Duration too long for time available");
  } else {
    adjust(+10, "Time fit");
  }

  // ============ Rule 2: Mood fit ============
  if (context.childMood === "low") {
    if (activity.difficulty === 3)
      adjust(-35, "Mood low: difficulty 3 too much");
    if (activity.skill === "resilience")
      adjust(-25, "Mood low: resilience skill");
    if (activity.difficulty === 1)
      adjust(+15, "Mood low: difficulty 1 fits");
  }
  if (context.childMood === "high") {
    if (activity.difficulty === 3)
      adjust(+20, "Mood high: difficulty 3 welcome");
    if (activity.skill === "resilience")
      adjust(+15, "Mood high: resilience skill");
    if (activity.skill === "creativity")
      adjust(+10, "Mood high: creativity skill");
    if (activity.difficulty === 1)
      adjust(-10, "Mood high: difficulty 1 too easy");
  }

  // ============ Rule 3: Recency ============
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

  // ============ Rule 4: Skill coverage ============
  const skillCountWeek = last7Days.filter(
    (s) => activityIdToSkill(s.activityId) === activity.skill,
  ).length;
  if (skillCountWeek === 0) adjust(+30, "Skill neglected this week");
  if (skillCountWeek === 1) adjust(+5, "Skill seen once this week");
  if (skillCountWeek >= 3) adjust(-30, "Skill overdone this week");

  // ============ Rule 5: Confidence trend in this skill ============
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

  // ============ Rule 6: Age fit ============
  const [minAge, maxAge] = activity.ageRange;
  if (child.age < minAge) adjust(-50, "Child too young for this activity");
  if (child.age > maxAge) adjust(-20, "Child past upper age range");
  if (child.age === minAge && activity.difficulty === 3)
    adjust(-15, "At min age + difficulty 3");

  return { activity, score, reasons };
}
