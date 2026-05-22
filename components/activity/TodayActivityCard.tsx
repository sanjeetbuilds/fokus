"use client";

import { ArrowRight, Info } from "lucide-react";

import SkillIcon from "@/components/SkillIcon";
import { SKILLS } from "@/lib/content/skills";
import type { Activity } from "@/types";

export interface TodayActivityCardProps {
  activity: Activity;
  onStart: () => void;
  /**
   * First-time-only "why start here?" context block. Renders inside
   * the card between the tagline and Start CTA when true. After the
   * parent's first completion this turns off forever.
   */
  showFirstTimeContext?: boolean;
}

/**
 * Today's activity card.
 *
 *   1. Skill row: sm SkillIcon · skill name · duration (right-aligned)
 *   2. Activity title (26 / 700)
 *   3. Hook tagline (14 / 300, 1 sentence)
 *   4. [first-time-only] "Why start here?" context block
 *   5. Start CTA pill (left-aligned, not full-width)
 *
 * Solid warm-tint surface (#FBFAF7).
 */
export default function TodayActivityCard({
  activity,
  onStart,
  showFirstTimeContext = false,
}: TodayActivityCardProps) {
  const skill = SKILLS[activity.skill];
  // 8-digit hex for the first-time block's ~6% wash over white.
  const skillWash = `${skill.color}10`;

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
          size="sm"
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
          fontSize: 26,
          fontWeight: 700,
          color: "#252630",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {activity.title}
      </h2>

      {/* 3. Hook tagline */}
      <p
        style={{
          marginTop: 10,
          fontSize: 14,
          fontWeight: 300,
          color: "#8E8D9B",
          lineHeight: 1.5,
        }}
      >
        {activity.hook}
      </p>

      {/* 4. First-time context block */}
      {showFirstTimeContext ? (
        <div
          style={{
            marginTop: 16,
            background: skillWash,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Info
              size={14}
              strokeWidth={2.25}
              aria-hidden
              style={{ color: skill.color, flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#252630",
              }}
            >
              Why start here?
            </span>
          </div>
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 400,
              color: "#8E8D9B",
              lineHeight: 1.5,
            }}
          >
            {skill.firstTimeNote}
          </p>
        </div>
      ) : null}

      {/* 5. Start CTA */}
      <button
        type="button"
        onClick={onStart}
        className="mt-5 inline-flex items-center gap-2 transition-opacity duration-fast ease-out active:opacity-80"
        style={{
          background: "#252630",
          color: "#FFFFFF",
          padding: "12px 20px",
          borderRadius: 27,
          fontSize: 15,
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
