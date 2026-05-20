"use client";

import { ArrowRight } from "lucide-react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import { SKILLS } from "@/lib/content/skills";
import type { Activity, ActivityDifficulty } from "@/types";

const DIFFICULTY_LABEL: Record<ActivityDifficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

export interface TodayActivityCardProps {
  activity: Activity;
  onMore: () => void;
  onDidIt: () => void;
  onSkip: () => void;
  skipBusy?: boolean;
  truncatedHowTo: string;
}

/**
 * The big card on /today, matching the design's primary activity card:
 * tag at top-left, title in skill colour, italic description, a big
 * skill-tinted icon hero in place of the design's photo placeholder,
 * one-line-to-say with a colored dot prefix, then a footer with the
 * green "Did it →" CTA. Skip and "More" sit underneath as text links.
 */
export default function TodayActivityCard({
  activity,
  onMore,
  onDidIt,
  onSkip,
  skipBusy,
  truncatedHowTo,
}: TodayActivityCardProps) {
  const skill = SKILLS[activity.skill];

  return (
    <article className="rounded-[18px] bg-bg-elevated p-5 shadow-md">
      {/* Top row: skill tag + difficulty mini-pill */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold"
          style={{
            backgroundColor: `${skill.color}1F`,
            color: skill.color,
          }}
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: skill.color }}
          />
          {skill.label}
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-tertiary">
          {activity.duration} min · {DIFFICULTY_LABEL[activity.difficulty]}
        </span>
      </div>

      {/* Title */}
      <h2
        className="mt-3 text-[24px] font-extrabold leading-[1.2] tracking-[-0.01em]"
        style={{ color: skill.color }}
      >
        {activity.title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-[14px] italic leading-[1.55] text-ink-secondary">
        {activity.description}
      </p>

      {/* Hero block: a large skill-tinted panel showing the activity's
          specific icon. */}
      <div
        className="mt-4 flex h-[140px] items-center justify-center rounded-[14px]"
        style={{ backgroundColor: `${skill.color}14` }}
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={56}
          strokeWidth={1.5}
          style={{ color: skill.color }}
        />
      </div>

      {/* Short howTo */}
      <p className="mt-4 text-[14px] leading-[1.6] text-ink">
        {truncatedHowTo}
      </p>

      {/* The one thing to say */}
      <p className="mt-3 flex gap-2 text-[13px] leading-[1.55] text-ink-secondary">
        <span
          aria-hidden
          className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
        <span className="italic">{activity.oneLineToSay}</span>
      </p>

      {/* Footer: skip + more on the left, primary CTA on the right */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSkip}
            disabled={skipBusy}
            className="text-[13px] text-ink-tertiary transition-colors duration-fast ease-out hover:text-ink disabled:opacity-50"
          >
            Skip today
          </button>
          <button
            type="button"
            onClick={onMore}
            className="text-[13px] font-extrabold text-accent-mid transition-colors duration-fast ease-out hover:text-accent"
          >
            More →
          </button>
        </div>
        <button
          type="button"
          onClick={onDidIt}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[13px] font-extrabold text-white shadow-[0_4px_12px_-2px_rgba(42,92,65,0.25)] transition-colors duration-fast ease-out hover:bg-accent-pressed"
        >
          Did it
          <ArrowRight size={13} strokeWidth={2.5} aria-hidden />
        </button>
      </div>
    </article>
  );
}
