"use client";

import {
  Anchor,
  BookOpen,
  Brain,
  Compass,
  Eye,
  Heart,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { SKILLS } from "@/lib/content/skills";
import type { Activity, ActivityDifficulty } from "@/types";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>> = {
  Anchor,
  BookOpen,
  Brain,
  Compass,
  Eye,
  Heart,
  Sparkles,
  Wind,
};

const DIFFICULTY_LABEL: Record<ActivityDifficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

export interface ActivityCardProps {
  activity: Activity;
}

/**
 * Activity card with per-skill chromatic tint. The card background is the
 * skill colour at 8% opacity; the icon square at 16%; the border at 20%.
 * Together they give each row a recognizable hue without overwhelming the
 * page — every skill is identifiable at a glance.
 *
 * `${color}14` = 8% alpha in hex (0x14 ≈ 20/255 ≈ 0.078)
 * `${color}29` = 16% alpha
 * `${color}33` = 20% alpha
 */
export default function ActivityCard({ activity }: ActivityCardProps) {
  const skill = SKILLS[activity.skill];
  const Icon: LucideIcon | undefined =
    (ICONS[skill.iconName] as LucideIcon | undefined) ?? undefined;

  return (
    <div
      role="button"
      tabIndex={-1}
      className="flex items-start gap-4 rounded-lg p-4 transition-shadow duration-fast ease-out hover:shadow-sm active:scale-[0.99]"
      style={{
        backgroundColor: `${skill.color}14`,
        boxShadow: `inset 0 0 0 1px ${skill.color}33`,
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: `${skill.color}29`,
          color: skill.color,
        }}
        aria-hidden
      >
        {Icon ? <Icon size={22} strokeWidth={1.75} /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span style={{ color: skill.color }}>{skill.label}</span>
          <span className="text-ink-quaternary"> · </span>
          <span className="text-ink-secondary">{activity.duration} min</span>
          <span className="text-ink-quaternary"> · </span>
          <span className="text-ink-secondary">{DIFFICULTY_LABEL[activity.difficulty]}</span>
        </p>

        <h3 className="mt-1 text-[18px] font-semibold leading-[1.3] text-ink">
          {activity.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-[15px] text-ink-secondary">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
