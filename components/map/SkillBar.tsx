"use client";

import {
  Anchor,
  BookOpen,
  Brain,
  ChevronRight,
  Compass,
  Eye,
  Heart,
  Sparkles,
  Wind,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { SKILLS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

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

export interface SkillBarProps {
  skillKey: SkillKey;
  sessionsCount: number;
  confidence: number; // 0–100
}

/**
 * Row in the Map "Skill development" section. Whole row is a Link to
 * /map/skill/[skillKey] so tap targets are large.
 */
export default function SkillBar({
  skillKey,
  sessionsCount,
  confidence,
}: SkillBarProps) {
  const skill = SKILLS[skillKey];
  const Icon = ICONS[skill.iconName];

  return (
    <Link
      href={`/map/skill/${skillKey}`}
      className="block rounded-md transition-colors duration-fast ease-out hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${skill.color}22`, color: skill.color }}
          >
            {Icon ? <Icon size={14} strokeWidth={1.75} aria-hidden /> : null}
          </span>
          <span className="truncate text-callout text-ink">{skill.label}</span>
        </div>
        <div className="flex items-center gap-2 text-footnote text-ink-tertiary">
          <span>
            {sessionsCount} session{sessionsCount === 1 ? "" : "s"}
          </span>
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="text-ink-quaternary"
          />
        </div>
      </div>
      <div className="mx-3 mb-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${Math.max(0, Math.min(100, confidence))}%`,
            backgroundColor: skill.color,
          }}
          aria-label={`Confidence ${Math.round(confidence)} out of 100`}
        />
      </div>
    </Link>
  );
}
