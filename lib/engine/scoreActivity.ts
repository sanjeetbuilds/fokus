import type { Activity, Child, Session, SkillKey } from "@/types";
import { daysSince } from "@/lib/utils/dates";
import {
  activityIdToSkill,
  responseValue,
  type PickContext,
  type ScoredActivity,
} from "./types";

/**
 * Skill → struggle phrases. Used by Rule 10. Mirrors SPEC §7 exactly:
 *   "// etc." in the spec is left as a tail comment; we keep just the
 *   pairs the spec actually lists so we don't invent linkages.
 */
const SKILL_TO_STRUGGLE: Partial<Record<SkillKey, readonly string[]>> = {
  language: ["Speaking English", "Reading"],
  emotional: ["Big feelings", "Losing games", "Sharing"],
  resilience: [
    "Trying new things",
    "Finishing what they start",
    "Losing games",
  ],
  decisiveness: ["Asking questions"],
  curiosity: ["Asking questions"],
};

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
 * Implements SPEC §7 verbatim: all 10 rules, in spec order. If you find
 * yourself wanting to "tidy" a rule, re-read the spec first; the
 * asymmetries are intentional.
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

  // ============ Rule 3: Language load × English confidence ============
  if (child.englishConfidence === "hesitant") {
    if (activity.languageLoad === "high" && activity.skill !== "language") {
      adjust(-20, "Hesitant English + high language load");
    }
    if (activity.skill === "language") {
      adjust(+25, "Hesitant English needs language activities");
    }
  }
  if (
    child.englishConfidence === "comfortable" &&
    activity.skill === "language"
  ) {
    adjust(-10, "Comfortable English: language less critical");
  }

  // ============ Rule 4: Engagement routing ============
  const activityText = (
    activity.title +
    " " +
    activity.description +
    " " +
    activity.howTo +
    " " +
    activity.requires
  ).toLowerCase();

  for (const deep of child.engagement.goesDeepOn) {
    const needle = deep.toLowerCase();
    if (activityText.includes(needle)) {
      adjust(+25, `Engagement match (goes deep on "${deep}")`);
    }
    if (activity.worksWellWith.includes(needle)) {
      adjust(+20, `Tagged worksWellWith "${deep}"`);
    }
  }
  for (const flees of child.engagement.fleesFrom) {
    const needle = flees.toLowerCase();
    if (activityText.includes(needle)) {
      adjust(-30, `Engagement penalty (flees from "${flees}")`);
    }
  }

  // ============ Rule 5: Interest alignment ============
  for (const interest of child.interests) {
    const needle = interest.toLowerCase();
    if (activityText.includes(needle)) {
      adjust(+12, `Interest match: "${interest}"`);
    }
    if (activity.worksWellWith.includes(needle)) {
      adjust(+15, `Interest tagged in worksWellWith: "${interest}"`);
    }
  }

  // ============ Rule 6: Recency ============
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

  // ============ Rule 7: Skill coverage ============
  const skillCountWeek = last7Days.filter(
    (s) => activityIdToSkill(s.activityId) === activity.skill,
  ).length;
  if (skillCountWeek === 0) adjust(+30, "Skill neglected this week");
  if (skillCountWeek === 1) adjust(+5, "Skill seen once this week");
  if (skillCountWeek >= 3) adjust(-30, "Skill overdone this week");

  // ============ Rule 8: Confidence trend in this skill ============
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

  // ============ Rule 9: Age fit ============
  const [minAge, maxAge] = activity.ageRange;
  if (child.age < minAge) adjust(-50, "Child too young for this activity");
  if (child.age > maxAge) adjust(-20, "Child past upper age range");
  if (child.age === minAge && activity.difficulty === 3)
    adjust(-15, "At min age + difficulty 3");

  // ============ Rule 10: Struggle prioritization ============
  const relevant = SKILL_TO_STRUGGLE[activity.skill] ?? [];
  const matchingStruggles = child.struggles.filter((s) =>
    relevant.includes(s),
  ).length;
  if (matchingStruggles > 0) {
    adjust(
      matchingStruggles * 10,
      `Struggle prioritization: ${matchingStruggles} match${matchingStruggles > 1 ? "es" : ""}`,
    );
  }

  return { activity, score, reasons };
}
