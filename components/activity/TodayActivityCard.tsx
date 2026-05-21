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
 * Card background uses the neutral fill #F7F7F5 against the white page
 * so all 8 skill colors carry the same visual weight in the card chrome.
 *
 * Skill-name + CTA weights come in at 800 instead of the T5-spec 500 to
 * respect the global "Inter 400 / 800 only" rule established in T1.
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
        background: "#F7F7F5",
        borderRadius: 24,
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
            color: "#6B6B6B",
            letterSpacing: "-0.005em",
          }}
        >
          {skill.label}
        </span>
        <span aria-hidden style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 14,
            color: "#8A8A8A",
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
          fontWeight: 700,
          color: "#1A1A1A",
          letterSpacing: "-0.01em",
          lineHeight: 1.05,
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
          color: "#6B6B6B",
          lineHeight: 1.4,
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
          background: "#1A1A1A",
          color: "#FFFFFF",
          padding: "14px 22px",
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Start
        <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </article>
  );
}
