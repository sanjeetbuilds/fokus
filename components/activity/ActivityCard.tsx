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
 * Compact activity card — used in Library and on the Skill Detail page.
 * Renders just the card surface. Wrap in a <Link> to make it navigate.
 */
export default function ActivityCard({ activity }: ActivityCardProps) {
  const skill = SKILLS[activity.skill];
  const Icon: LucideIcon | undefined =
    (ICONS[skill.iconName] as LucideIcon | undefined) ?? undefined;

  return (
    <Card variant="interactive" className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-caption uppercase tracking-[0.1em] text-ink-secondary">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
        {Icon ? (
          <Icon
            size={12}
            strokeWidth={2}
            aria-hidden
            style={{ color: skill.color }}
          />
        ) : null}
        <span>{skill.label}</span>
        <span aria-hidden className="text-ink-quaternary">·</span>
        <span>{activity.duration} min</span>
        <span aria-hidden className="text-ink-quaternary">·</span>
        <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
      </div>

      <h3 className="text-title-3 text-ink">{activity.title}</h3>

      <p className="line-clamp-1 text-body text-ink-secondary">
        {activity.description}
      </p>
    </Card>
  );
}
