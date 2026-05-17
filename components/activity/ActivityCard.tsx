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

import Card from "@/components/ui/Card";
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
 * Activity card (round-2 identity). Layout: small colored icon square on the
 * left, caption row + title + one-line description on the right.
 *
 * Renders the surface only — wrap in a <Link> to make it navigate. The icon
 * square uses a 13% tint of the skill colour so each skill's row reads
 * visually grouped without each card screaming for attention.
 */
export default function ActivityCard({ activity }: ActivityCardProps) {
  const skill = SKILLS[activity.skill];
  const Icon: LucideIcon | undefined =
    (ICONS[skill.iconName] as LucideIcon | undefined) ?? undefined;

  return (
    <Card variant="interactive" className="flex items-start gap-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: `${skill.color}22`,
          color: skill.color,
        }}
        aria-hidden
      >
        {Icon ? <Icon size={22} strokeWidth={1.75} /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-secondary">
          <span style={{ color: skill.color }}>{skill.label}</span>
          <span className="text-ink-quaternary"> · </span>
          <span>{activity.duration} min</span>
          <span className="text-ink-quaternary"> · </span>
          <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
        </p>

        <h3 className="mt-1 text-[18px] font-semibold leading-[1.3] text-ink">
          {activity.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-[15px] text-ink-secondary">
          {activity.description}
        </p>
      </div>
    </Card>
  );
}
