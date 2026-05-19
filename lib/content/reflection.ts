import type { Child, Session, SkillKey } from "@/types";

import { getActivityById } from "./activities";
import { SKILLS } from "./skills";

/**
 * Pure helpers describing what Fokus is paying attention to for a given
 * child, derived entirely from the parent's onboarding input plus the
 * session history. Every string here describes what the APP is doing or
 * what the PARENT told the app — never claims about who the child will
 * become. Used by /today (reflection block) and /profile (focus-areas
 * card + "where things are heading" paragraph).
 */

export interface ReflectionSentence {
  id: string;
  text: string;
}

export interface FocusArea {
  title: string;
  reason: string;
}

/**
 * Lowercase only the first letter so mid-sentence chip labels read
 * naturally while proper nouns inside the label keep their casing
 * (e.g. "Speaking English" → "speaking English", not "speaking english").
 */
function sentenceCase(s: string): string {
  const t = s.trim();
  if (t.length === 0) return t;
  return t[0]!.toLowerCase() + t.slice(1);
}

function joinList(items: readonly string[]): string {
  const xs = items.map(sentenceCase).filter((x) => x.length > 0);
  if (xs.length === 0) return "";
  if (xs.length === 1) return xs[0]!;
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
  const head = xs.slice(0, -1).join(", ");
  return `${head}, and ${xs[xs.length - 1]}`;
}

/**
 * Items typed from different onboarding chip groups can overlap (e.g.
 * "Sitting still" lives in both fleesFrom and struggles, "Reading" in
 * goesDeepOn and struggles). Resolve overlaps so the reflection layer
 * mentions any given item exactly once.
 *
 * Priority (for negative framings):  struggles > fleesFrom > goesDeepOn.
 */
export function dedupedEngagement(child: Child): {
  goesDeepOn: string[];
  fleesFrom: string[];
  struggles: string[];
} {
  const struggles = child.struggles;
  const struggleSet = new Set(struggles);
  const fleesFrom = child.engagement.fleesFrom.filter(
    (x) => !struggleSet.has(x),
  );
  const negativeSet = new Set([...struggles, ...fleesFrom]);
  const goesDeepOn = child.engagement.goesDeepOn.filter(
    (x) => !negativeSet.has(x),
  );
  return { goesDeepOn, fleesFrom, struggles };
}

/**
 * Compact /today reflection — capped at two lines regardless of how many
 * profile fields the parent filled in. Line 1 is name + age + ONE prioritised
 * engagement note ("Building English confidence." > "Goes deep on X." >
 * "Working on X."). The fleesFrom field stays in the DB but is deliberately
 * NOT echoed back on the home screen — it's used by the engine, not surfaced.
 */
export function buildFullReflection(child: Child): ReflectionSentence[] {
  const out: ReflectionSentence[] = [];
  const grade = child.grade?.trim();

  const dedup = dedupedEngagement(child);

  const note = (() => {
    if (
      child.englishConfidence === "hesitant" ||
      child.englishConfidence === "developing"
    ) {
      return "Building English confidence.";
    }
    if (dedup.goesDeepOn.length > 0) {
      return `Goes deep on ${sentenceCase(dedup.goesDeepOn[0]!)}.`;
    }
    if (dedup.struggles.length > 0) {
      return `Working on ${sentenceCase(dedup.struggles[0]!)}.`;
    }
    return null;
  })();

  const intro = grade
    ? `${child.name} is ${child.age}, in ${grade} standard.`
    : `${child.name} is ${child.age}.`;

  out.push({
    id: "line-1",
    text: note ? `${intro} ${note}` : intro,
  });

  return out;
}

export function fullReflectionClosing(_child: Child): string {
  return "The moments we share will lean into this. Gently.";
}

/**
 * Bullets shared by the MEDIUM block (1-2 sessions) and the COLLAPSED
 * line (3+ sessions). At most 3, in priority order:
 *   1. Building English confidence    (hesitant or developing)
 *   2. Honoring their deep focus on X (first goesDeepOn item, deduped)
 *   3. Practicing X                   (first struggle, lowercased)
 */
export function todayFocusBullets(child: Child): string[] {
  const dedup = dedupedEngagement(child);
  const out: string[] = [];
  if (
    child.englishConfidence === "hesitant" ||
    child.englishConfidence === "developing"
  ) {
    out.push("Building English confidence");
  }
  if (dedup.goesDeepOn.length > 0) {
    out.push(
      `Honoring their deep focus on ${sentenceCase(dedup.goesDeepOn[0]!)}`,
    );
  }
  if (dedup.struggles.length > 0) {
    out.push(`Practicing ${sentenceCase(dedup.struggles[0]!)}`);
  }
  return out.slice(0, 3);
}

/** Natural-language join of items the parent supplied. Pre-sentence-cased
 *  so they can be dropped into the middle of a sentence ("big feelings"). */
function joinSpecific(items: readonly string[]): string {
  return joinList(items);
}

/**
 * Attributed focus rows for the Profile "what Fokus is paying attention
 * to" card. Up to 4 rows, priority: English > Goes-deep > specific
 * struggles > Curiosity fallback. Reasons name the parent's exact picks
 * — never collapse multiple selections into a vague "these moments."
 */
export function profileFocusAreas(child: Child): FocusArea[] {
  const out: FocusArea[] = [];
  const dedup = dedupedEngagement(child);
  const name = child.name;

  if (child.englishConfidence === "hesitant") {
    out.push({
      title: "Building English confidence",
      reason: `Because you said ${name} is hesitant in English.`,
    });
  } else if (child.englishConfidence === "developing") {
    out.push({
      title: "Building English confidence",
      reason: `Because you said ${name} is still picking up English.`,
    });
  }

  if (dedup.goesDeepOn.length > 0) {
    out.push({
      title: `Honoring their deep focus on ${sentenceCase(dedup.goesDeepOn[0]!)}`,
      reason: `Because you said ${name} goes deep when doing this.`,
    });
  }

  const finishingItems = dedup.struggles.filter(
    (s) => s === "Finishing what they start",
  );
  if (finishingItems.length > 0) {
    out.push({
      title: "Practicing finishing things",
      reason: `Because you said finishing what they start is hard for ${name}.`,
    });
  }

  const emotionalLabels = ["Big feelings", "Losing games"];
  const emotionalItems = dedup.struggles.filter((s) =>
    emotionalLabels.includes(s),
  );
  if (emotionalItems.length > 0) {
    out.push({
      title: "Building emotional steadiness",
      reason: `Because you said ${joinSpecific(emotionalItems)} ${
        emotionalItems.length === 1 ? "is" : "are"
      } hard for ${name}.`,
    });
  }

  if (out.length === 0) {
    out.push({
      title: "Following their curiosity",
      reason: "Because curiosity grows best when followed.",
    });
  }

  return out.slice(0, 4);
}

/**
 * Pick four user-facing skill labels for the "Where things are heading"
 * paragraph: primary + secondary are the current focus, tertiary +
 * quaternary are deferred. Session counts bias tertiary/quaternary
 * toward skills the parent hasn't worked on much.
 */
export function whereHeadingSkills(
  child: Child,
  sessions: readonly Session[],
): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
} {
  const all: SkillKey[] = [
    "curiosity",
    "language",
    "emotional",
    "thinking",
    "resilience",
    "creativity",
    "observation",
    "decisiveness",
  ];

  let primary: SkillKey;
  if (child.englishConfidence === "hesitant") {
    primary = "language";
  } else if (child.struggles.includes("Finishing what they start")) {
    primary = "resilience";
  } else {
    primary = "curiosity";
  }

  const secondary: SkillKey =
    primary === "curiosity" ? "language" : "curiosity";

  const counts = new Map<SkillKey, number>();
  for (const k of all) counts.set(k, 0);
  for (const s of sessions) {
    const a = getActivityById(s.activityId);
    if (!a) continue;
    counts.set(a.skill, (counts.get(a.skill) ?? 0) + 1);
  }

  const remaining = all
    .filter((k) => k !== primary && k !== secondary)
    .sort((a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0));

  return {
    primary: SKILLS[primary].label,
    secondary: SKILLS[secondary].label,
    tertiary: SKILLS[remaining[0]!].label,
    quaternary: SKILLS[remaining[1]!].label,
  };
}
