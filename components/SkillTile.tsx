"use client";

import SkillIcon from "@/components/SkillIcon";
import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

export type SkillTileVariant = "all" | "tried";

export interface SkillTileProps {
  skillId: SkillKey;
  /**
   * 'all'   → count line shows "{total} activities"
   * 'tried' → count line shows "{triedCount} of {total} done"
   */
  variant: SkillTileVariant;
  /**
   * Number of distinct tried activity_ids in this skill. Required and
   * read only when variant === 'tried'. Ignored in 'all'.
   */
  triedCount?: number;
  onClick: () => void;
}

/**
 * Single source of truth for the skill tile chrome used by both
 * /library (the 2×4 grid) and /map (the "By skill" grid). Self-
 * computes the total activities-per-skill from lib/content/activities.ts
 * so it stays correct if the library grows.
 *
 *   ┌─────────────────┐
 *   │ [md SkillIcon]  │
 *   │                 │
 *   │ Curiosity       │   15 / 700 ink, letterSpacing -0.005em
 *   │ 8 activities    │   13 / 400 muted
 *   └─────────────────┘
 *   white bg, 0.5px hair border, 16-radius, 16-padding
 */
export default function SkillTile({
  skillId,
  variant,
  triedCount,
  onClick,
}: SkillTileProps) {
  const skill = SKILLS[skillId];
  const total = ACTIVITIES.filter((a) => a.skill === skillId).length;

  const countLine =
    variant === "tried"
      ? `${triedCount ?? 0} of ${total} done`
      : `${total} activities`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        padding: 14,
        background: "#FFFFFF",
        border: "1.5px solid #E5E3DA",
        borderRadius: 22,
        textAlign: "left",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <SkillIcon skillId={skillId} size="md" />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#252630",
            letterSpacing: "-0.005em",
            lineHeight: 1.3,
          }}
        >
          {skill.label}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.4,
          }}
        >
          {countLine}
        </span>
      </div>
    </button>
  );
}
