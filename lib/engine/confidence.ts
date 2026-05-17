import type { Session, SkillKey } from "@/types";
import { SKILL_KEYS } from "@/lib/content/skills";
import { activityIdToSkill, responseValue } from "./types";

/**
 * 0 to 100 confidence in one skill, formula from SPEC §7:
 *   no sessions      → 0
 *   else             → clamp(30 + sum(responseValue) * 2, 0, 100)
 *
 * The +30 floor lets a single neutral session show as visible progress; the
 * value compresses toward 100 as accumulated positive responses pile up.
 */
export function skillConfidence(
  skill: SkillKey,
  sessions: Session[],
): number {
  const skillSessions = sessions.filter(
    (s) => activityIdToSkill(s.activityId) === skill,
  );
  if (skillSessions.length === 0) return 0;
  const totalValue = skillSessions.reduce(
    (sum, s) => sum + responseValue(s.response),
    0,
  );
  return Math.min(100, Math.max(0, 30 + totalValue * 2));
}

export interface SkillCoverageEntry {
  sessions: number;
  confidence: number;
  /** Sum of responseValue across the last 3 sessions in this skill. */
  trend: number;
}

/**
 * Per-skill summary used by the Map view and the engine debug page.
 * `trend` reflects the very recent direction in this skill (last 3 sessions).
 */
export function skillCoverage(
  sessions: Session[],
): Record<SkillKey, SkillCoverageEntry> {
  const result = {} as Record<SkillKey, SkillCoverageEntry>;
  for (const key of SKILL_KEYS) {
    const inSkill = sessions.filter(
      (s) => activityIdToSkill(s.activityId) === key,
    );
    const trendSlice = inSkill.slice(-3);
    const trend = trendSlice.reduce(
      (sum, s) => sum + responseValue(s.response),
      0,
    );
    result[key] = {
      sessions: inSkill.length,
      confidence: skillConfidence(key, sessions),
      trend,
    };
  }
  return result;
}
