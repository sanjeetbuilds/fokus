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
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { SKILLS } from "@/lib/content/skills";
import type { Activity } from "@/types";

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

export interface ActivityRowProps {
  activity: Activity;
}

/**
 * Compact list row matching the design's `.card-sm .act-row` pattern:
 *   [colored icon] Title
 *                  Subtitle (1 line, ellipsised)
 *                  [skill tag] · duration                  [▶ arrow]
 */
export default function ActivityRow({ activity }: ActivityRowProps) {
  const skill = SKILLS[activity.skill];
  const Icon: LucideIcon | undefined =
    (ICONS[skill.iconName] as LucideIcon | undefined) ?? undefined;

  return (
    <div className="flex items-center gap-3.5 rounded-[18px] bg-bg-elevated p-3.5 shadow-md transition-transform duration-fast ease-out active:scale-[0.99]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: skill.color, color: "#FFFFFF" }}
        aria-hidden
      >
        {Icon ? <Icon size={22} strokeWidth={1.75} /> : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight text-ink">
          {activity.title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-ink-tertiary">
          {activity.description}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${skill.color}1F`,
              color: skill.color,
            }}
          >
            {skill.label}
          </span>
          <span className="text-[11px] text-ink-tertiary">
            {activity.duration} min
          </span>
        </div>
      </div>

      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-alt text-ink-secondary"
      >
        <ChevronRight size={14} strokeWidth={2} />
      </span>
    </div>
  );
}
