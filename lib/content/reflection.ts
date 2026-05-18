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

/** Sentences for the FULL reflection block on /today (zero sessions). */
export function buildFullReflection(child: Child): ReflectionSentence[] {
  const out: ReflectionSentence[] = [];

  const grade = child.grade?.trim();
  out.push({
    id: "age",
    text: grade
      ? `${child.name} is ${child.age}, in ${grade} standard.`
      : `${child.name} is ${child.age}.`,
  });

  // Sentence 2 deliberately starts with the verb so it reads correctly
  // regardless of the child's pronoun — avoids the "they goes" trap.
  if (child.engagement.goesDeepOn.length > 0) {
    out.push({
      id: "goes-deep",
      text: `Goes deep on ${joinList(child.engagement.goesDeepOn)}.`,
    });
  }

  if (child.engagement.fleesFrom.length > 0) {
    out.push({
      id: "flees",
      text: `Tries to get away from ${joinList(child.engagement.fleesFrom)}.`,
    });
  }

  if (child.struggles.length > 0) {
    const list =
      child.struggles.length > 3
        ? `${joinList(child.struggles.slice(0, 2))}, among other things`
        : joinList(child.struggles);
    out.push({ id: "struggles", text: `Gets stuck on ${list}.` });
  }

  const ec = child.englishConfidence;
  out.push({
    id: "english",
    text:
      ec === "hesitant"
        ? "Hesitant with English."
        : ec === "developing"
          ? "Picking up English steadily."
          : "Comfortable in English.",
  });

  return out;
}

export function fullReflectionClosing(child: Child): string {
  return `The moments we share with ${child.name} will lean into these. Gently.`;
}

/**
 * Bullets shared by the MEDIUM block (1-2 sessions) and the COLLAPSED
 * line (3+ sessions). At most 3, in priority order:
 *   1. Building English confidence    (hesitant or developing)
 *   2. Honoring their deep focus on X (first goesDeepOn item)
 *   3. Practicing X                   (first struggle, lowercased)
 */
export function todayFocusBullets(child: Child): string[] {
  const out: string[] = [];
  if (
    child.englishConfidence === "hesitant" ||
    child.englishConfidence === "developing"
  ) {
    out.push("Building English confidence");
  }
  if (child.engagement.goesDeepOn.length > 0) {
    out.push(
      `Honoring their deep focus on ${sentenceCase(child.engagement.goesDeepOn[0]!)}`,
    );
  }
  if (child.struggles.length > 0) {
    out.push(`Practicing ${sentenceCase(child.struggles[0]!)}`);
  }
  return out.slice(0, 3);
}

/**
 * Attributed focus rows for the Profile "what Fokus is paying attention
 * to" card. Up to 4 rows, priority: English > Goes-deep > specific
 * struggles > Curiosity fallback.
 */
export function profileFocusAreas(child: Child): FocusArea[] {
  const out: FocusArea[] = [];

  if (child.englishConfidence === "hesitant") {
    out.push({
      title: "Building English confidence",
      reason: "Because you said they're hesitant in English.",
    });
  } else if (child.englishConfidence === "developing") {
    out.push({
      title: "Building English confidence",
      reason: "Because you said they're still picking up English.",
    });
  }

  if (child.engagement.goesDeepOn.length > 0) {
    out.push({
      title: `Honoring their deep focus on ${sentenceCase(child.engagement.goesDeepOn[0]!)}`,
      reason: "Because you said they go deep when doing this.",
    });
  }

  if (child.struggles.includes("Finishing what they start")) {
    out.push({
      title: "Practicing finishing things",
      reason: "Because you said this is hard for them.",
    });
  }

  if (
    child.struggles.includes("Big feelings") ||
    child.struggles.includes("Losing games")
  ) {
    out.push({
      title: "Building emotional steadiness",
      reason: "Because you said these moments are hard.",
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
