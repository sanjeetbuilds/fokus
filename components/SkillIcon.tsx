"use client";

import ActivityIcon from "@/components/activity/ActivityIcon";
import { SKILLS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

export type SkillIconSize = "sm" | "md" | "lg";

export interface SkillIconProps {
  skillId: SkillKey;
  size?: SkillIconSize;
  /**
   * Optional per-activity Lucide icon name. If omitted (or unresolved)
   * the skill's own icon is used. This lets us keep activity-specific
   * symbols inside library rows while the surrounding square always
   * comes from the skill palette.
   */
  iconName?: string;
  className?: string;
  "aria-hidden"?: boolean;
}

const SIZE: Record<SkillIconSize, { box: number; icon: number }> = {
  sm: { box: 40, icon: 20 },
  md: { box: 56, icon: 28 },
  lg: { box: 80, icon: 40 },
};

/**
 * The only place in the app that builds the skill icon square.
 *
 *   - 16px corner radius (reference .act-ico)
 *   - solid skill color background
 *   - white Lucide glyph at stroke-width 2.25
 *   - three sizes: sm (40x40 / 20px), md (56x56 / 28px), lg (80x80 / 40px)
 *
 * No shadows, no borders, no gradients. If a screen wants a skill-tinted
 * tile that isn't an icon (e.g. a tinted card surface), it should use
 * the raw skill color from lib/content/skills.ts directly — SkillIcon is
 * specifically for the icon-in-squircle motif.
 */
export default function SkillIcon({
  skillId,
  size = "md",
  iconName,
  className,
  "aria-hidden": ariaHidden = true,
}: SkillIconProps) {
  const skill = SKILLS[skillId];
  const dim = SIZE[size];
  return (
    <span
      aria-hidden={ariaHidden}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim.box,
        height: dim.box,
        borderRadius: 16,
        background: skill.color,
        color: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      <ActivityIcon
        iconName={iconName ?? skill.iconName}
        skill={skillId}
        size={dim.icon}
        strokeWidth={2.25}
      />
    </span>
  );
}
