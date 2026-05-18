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

const ICONS: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>
> = {
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

export default function ActivityCard({ activity }: ActivityCardProps) {
  const skill = SKILLS[activity.skill];
  const Icon: LucideIcon | undefined =
    (ICONS[skill.iconName] as LucideIcon | undefined) ?? undefined;

  return (
    <div
      role="button"
      tabIndex={-1}
      className="flex items-start gap-4 rounded-[18px] bg-bg-elevated p-4 shadow-md transition-transform duration-fast ease-out active:scale-[0.99]"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
        style={{ backgroundColor: skill.color, color: "#FFFFFF" }}
        aria-hidden
      >
        {Icon ? <Icon size={22} strokeWidth={1.75} /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">
          <span style={{ color: skill.color }}>{skill.label}</span>
          <span className="text-ink-quaternary"> · </span>
          <span className="text-ink-secondary">{activity.duration} min</span>
          <span className="text-ink-quaternary"> · </span>
          <span className="text-ink-secondary">
            {DIFFICULTY_LABEL[activity.difficulty]}
          </span>
        </p>

        <h3 className="mt-1 text-[17px] font-semibold leading-[1.3] text-ink">
          {activity.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-[14px] text-ink-secondary">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
