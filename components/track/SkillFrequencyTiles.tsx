"use client";

import { useMemo, useState } from "react";

import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { Session, SkillKey } from "@/types";

import { getActivityById } from "@/lib/content/activities";

/**
 * Frequency tiles for the 8 spec skills. Surfaces the 4 with the most
 * sessions this week (ties broken alphabetically by label); a toggle
 * expands to show all 8 in a 2x4 grid. NO percentages, NO goals — the
 * count is the count. Zero-session skills render "just starting" rather
 * than a 0 with a goal.
 *
 * Visual carries the colored-tile + wave shape from the round-4 design
 * pass, but the content honors SPEC §2 Principle 2 (the child is never
 * measured) and Principle 4 (no shame, no compare).
 */
export interface SkillFrequencyTilesProps {
  sessions: readonly Session[];
  /** Anchor for the "this week" window (default: now). */
  today?: Date;
}

interface SkillCount {
  key: SkillKey;
  count: number;
}

export default function SkillFrequencyTiles({
  sessions,
  today,
}: SkillFrequencyTilesProps) {
  const [expanded, setExpanded] = useState(false);

  const weeklyCounts = useMemo<Record<SkillKey, number>>(() => {
    const cutoff = new Date(today ?? new Date());
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
    const iso = cutoff.toISOString().slice(0, 10);
    const counts = Object.fromEntries(
      SKILL_KEYS.map((k) => [k, 0]),
    ) as Record<SkillKey, number>;
    for (const s of sessions) {
      if (s.response === "skipped") continue;
      if (s.date < iso) continue;
      const a = getActivityById(s.activityId);
      if (!a) continue;
      counts[a.skill]++;
    }
    return counts;
  }, [sessions, today]);

  const allTimeCounts = useMemo<Record<SkillKey, number>>(() => {
    const counts = Object.fromEntries(
      SKILL_KEYS.map((k) => [k, 0]),
    ) as Record<SkillKey, number>;
    for (const s of sessions) {
      if (s.response === "skipped") continue;
      const a = getActivityById(s.activityId);
      if (!a) continue;
      counts[a.skill]++;
    }
    return counts;
  }, [sessions]);

  const orderedSkills = useMemo<SkillKey[]>(() => {
    // Primary sort: this-week count desc. Ties → all-time count desc.
    // Final tie → alphabetical by user-facing label so it's deterministic.
    return [...SKILL_KEYS].sort((a, b) => {
      const wa = weeklyCounts[a];
      const wb = weeklyCounts[b];
      if (wa !== wb) return wb - wa;
      const ta = allTimeCounts[a];
      const tb = allTimeCounts[b];
      if (ta !== tb) return tb - ta;
      return SKILLS[a].label.localeCompare(SKILLS[b].label);
    });
  }, [allTimeCounts, weeklyCounts]);

  const visible = expanded ? orderedSkills : orderedSkills.slice(0, 4);

  return (
    <section className="mb-6">
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: expanded
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
        }}
      >
        {visible.map((key) => (
          <SkillTile
            key={key}
            skillKey={key}
            count={weeklyCounts[key]}
            compact={expanded}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold transition-colors"
        style={{ color: "var(--accent-deep)" }}
      >
        {expanded ? "Show fewer ←" : "View all 8 skills →"}
      </button>
    </section>
  );
}

function SkillTile({
  skillKey,
  count,
  compact,
}: {
  skillKey: SkillKey;
  count: number;
  compact: boolean;
}) {
  const skill = SKILLS[skillKey];
  const zero = count === 0;
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-[22px] p-4"
      style={{
        background: skill.color,
        minHeight: compact ? 116 : 152,
      }}
    >
      <p
        className="text-[11px] font-extrabold uppercase"
        style={{
          color: "rgba(255,255,255,0.78)",
          letterSpacing: "0.06em",
        }}
      >
        {skill.label}
      </p>
      <div>
        <p
          className="font-extrabold text-white"
          style={{
            fontSize: compact ? 32 : 40,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            opacity: zero ? 0.55 : 1,
          }}
        >
          {count}
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.4 }}
        >
          {zero ? "just starting" : "moments this week"}
        </p>
      </div>
      <svg
        aria-hidden
        viewBox="0 0 170 38"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        height={32}
        width="100%"
      >
        <path
          d="M0 24C18 10 30 32 48 22C66 12 76 34 96 22C116 10 128 32 148 22C158 16 164 20 170 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.32}
        />
      </svg>
    </div>
  );
}
