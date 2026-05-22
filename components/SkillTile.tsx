"use client";

import ActivityIcon from "@/components/activity/ActivityIcon";
import Blobs from "@/components/shared/Blobs";
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
 * Single source of truth for the skill tile chrome used by /library.
 * Background uses the skill's bg tint; blobs add depth; text uses the
 * skill's iconColor (primary) and mid (count) tones so the entire
 * tile reads with chromatic harmony.
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
      ? `${triedCount ?? 0} of ${total} tried`
      : `${total} activities`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
        padding: 14,
        background: skill.bg,
        borderRadius: 18,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: "var(--shadow-level-1)",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        minHeight: 130,
        width: "100%",
      }}
      className="transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Blobs variant="tile" color={skill.blob} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: skill.blob,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: skill.iconColor,
            flexShrink: 0,
          }}
        >
          <ActivityIcon
            iconName={skill.iconName}
            skill={skillId}
            size={22}
            strokeWidth={2.25}
            style={{ color: skill.iconColor }}
          />
        </span>
        <span
          style={{
            marginTop: 10,
            fontSize: 13,
            fontWeight: 700,
            color: skill.iconColor,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
          }}
        >
          {skill.label}
        </span>
        <span
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 500,
            color: skill.mid,
            lineHeight: 1.4,
          }}
        >
          {countLine}
        </span>
      </div>
    </button>
  );
}
