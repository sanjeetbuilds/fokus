"use client";

import { ArrowRight } from "lucide-react";

import SkillIcon from "@/components/SkillIcon";
import { SKILLS } from "@/lib/content/skills";
import type { Activity } from "@/types";

export interface TodayActivityCardProps {
  activity: Activity;
  onStart: () => void;
}

/**
 * Today's activity card — the biggest, most prominent element on /today.
 * It announces the day's activity as a prompt, not an article preview.
 *
 *   1. Skill row:  md SkillIcon · skill name · duration (right-aligned)
 *   2. Activity title (36px / 800 / tracking -0.02em)
 *   3. Tagline (1 sentence, ≤12 words)
 *   4. Start CTA pill
 *
 * Solid warm-tint surface (#FBFAF7) so the card reads as the day's
 * primary object without the unfinished feel of a dashed border.
 */
export default function TodayActivityCard({
  activity,
  onStart,
}: TodayActivityCardProps) {
  const skill = SKILLS[activity.skill];

  return (
    <article
      className="w-full"
      style={{
        background: "#FBFAF7",
        borderRadius: 22,
        padding: 24,
      }}
    >
      {/* 1. Skill row */}
      <div className="flex items-center gap-3">
        <SkillIcon
          skillId={activity.skill}
          size="md"
          iconName={activity.iconName}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#252630",
            letterSpacing: "-0.005em",
          }}
        >
          {skill.label}
        </span>
        <span aria-hidden style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 14,
            color: "#8E8D9B",
          }}
        >
          {activity.duration} min
        </span>
      </div>

      {/* 2. Title */}
      <h2
        style={{
          marginTop: 20,
          fontSize: 30,
          fontWeight: 800,
          color: "#252630",
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        {activity.title}
      </h2>

      {/* 3. Tagline */}
      <p
        style={{
          marginTop: 12,
          fontSize: 16,
          fontWeight: 400,
          color: "#8E8D9B",
          lineHeight: 1.5,
        }}
      >
        {activity.description}
      </p>

      {/* 4. Start CTA */}
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex items-center gap-2 transition-opacity duration-fast ease-out active:opacity-80"
        style={{
          background: "#252630",
          color: "#FFFFFF",
          padding: "14px 22px",
          borderRadius: 27,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        Start
        <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </article>
  );
}
