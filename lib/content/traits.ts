import type { Session, SkillKey } from "@/types";

import { getActivityById } from "./activities";

/**
 * Round-4 design surfaces 4 "traits" (Confidence / Curiosity / Resilience /
 * Empathy) rather than the engine's 8 internal skills. This module owns the
 * mapping from 8 → 4 plus the per-trait percentage / badge derivation used
 * across Compass, Profile, and Today.
 *
 * Mapping (each surface trait gets exactly two internal skills, no overlap):
 *
 *   Confidence  ← decisiveness + language
 *   Curiosity   ← curiosity + thinking
 *   Resilience  ← resilience + observation
 *   Empathy     ← emotional + creativity
 *
 * Why: percentages computed from session counts stay stable when skills
 * shift weight, and the mapping is grounded in skill semantics (decisiveness
 * + language → speaking up confidently; observation supports resilience by
 * noticing what's actually happening; creativity supports empathy by being
 * able to imagine someone else's view).
 */

export type TraitKey = "confidence" | "curiosity" | "resilience" | "empathy";

export interface TraitDefinition {
  label: string;
  /** One-line description for the strength detail card. */
  description: string;
  /** Color from the round-4 palette — drives card bg + bar fill. */
  color: string;
  /** Soft tint used for icon chips / sparkle backdrops. */
  bg: string;
  /** Emoji shown on illustrations + tag pills. */
  emoji: string;
  /** Internal skills that contribute to this trait. */
  skills: SkillKey[];
}

export const TRAITS: Record<TraitKey, TraitDefinition> = {
  confidence: {
    label: "Confidence",
    description:
      "Speaking up, making real choices, and matching the speed of the decision to its stakes.",
    color: "var(--green)",
    bg: "var(--green-bg)",
    emoji: "💪",
    skills: ["decisiveness", "language"],
  },
  curiosity: {
    label: "Curiosity",
    description:
      "Looking behind appearances, generating alternatives, and reasoning out loud.",
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    emoji: "🔍",
    skills: ["curiosity", "thinking"],
  },
  resilience: {
    label: "Resilience",
    description:
      "Staying with hard things long enough to learn from them, and noticing what's actually there.",
    color: "var(--coral)",
    bg: "var(--coral-bg)",
    emoji: "🧠",
    skills: ["resilience", "observation"],
  },
  empathy: {
    label: "Empathy",
    description:
      "Recognising emotions in others and imagining their view widely enough to respond with kindness.",
    color: "var(--accent)",
    bg: "var(--accent-bg)",
    emoji: "💚",
    skills: ["emotional", "creativity"],
  },
};

export const TRAIT_KEYS: TraitKey[] = [
  "confidence",
  "curiosity",
  "resilience",
  "empathy",
];

export interface TraitStat {
  key: TraitKey;
  /** Count of sessions touching any of this trait's skills (in window). */
  sessions: number;
  /** 0–100 — the trait's share of attention, scaled so the busiest = 100. */
  percent: number;
  /** Trend tag for the badge shown on the stat card. */
  badge: "Growing fast" | "Strong" | "Emerging" | "Steady" | "—";
}

/**
 * Compute per-trait session counts + relative percentages from a list of
 * sessions. Sessions older than `windowDays` (default 30) are dropped.
 * "Skipped" sessions don't count toward growth.
 */
export function computeTraitStats(
  sessions: readonly Session[],
  options: { windowDays?: number; today?: Date } = {},
): TraitStat[] {
  const windowDays = options.windowDays ?? 30;
  const today = options.today ?? new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const counts: Record<TraitKey, number> = {
    confidence: 0,
    curiosity: 0,
    resilience: 0,
    empathy: 0,
  };

  for (const s of sessions) {
    if (s.response === "skipped") continue;
    if (s.date < cutoffIso) continue;
    const a = getActivityById(s.activityId);
    if (!a) continue;
    const key = traitForSkill(a.skill);
    if (key) counts[key]++;
  }

  const max = Math.max(...TRAIT_KEYS.map((k) => counts[k]));

  return TRAIT_KEYS.map((key) => {
    const n = counts[key];
    const percent = max === 0 ? 0 : Math.round((n / max) * 100);
    return {
      key,
      sessions: n,
      percent,
      badge: badgeFor(n),
    };
  });
}

function traitForSkill(skill: SkillKey): TraitKey | null {
  for (const t of TRAIT_KEYS) {
    if (TRAITS[t].skills.includes(skill)) return t;
  }
  return null;
}

function badgeFor(n: number): TraitStat["badge"] {
  if (n === 0) return "—";
  if (n >= 16) return "Strong";
  if (n >= 9) return "Growing fast";
  if (n >= 4) return "Steady";
  return "Emerging";
}
