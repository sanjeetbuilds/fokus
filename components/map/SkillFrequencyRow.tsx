"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SKILLS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

export interface SkillFrequencyRowProps {
  skillKey: SkillKey;
  sessionsCount: number;
}

export default function SkillFrequencyRow({
  skillKey,
  sessionsCount,
}: SkillFrequencyRowProps) {
  const skill = SKILLS[skillKey];
  const faded = sessionsCount === 0;

  return (
    <Link
      href={`/map/skill/${skillKey}`}
      className="flex items-center justify-between gap-3 rounded-md px-3 py-3 transition-colors duration-fast ease-out hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: faded ? "var(--line)" : skill.color,
          }}
        />
        <span
          className={`truncate text-callout ${
            faded ? "text-ink-tertiary" : "text-ink"
          }`}
        >
          {skill.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-footnote">
        <span className={faded ? "text-ink-tertiary" : "text-ink-secondary"}>
          {sessionsCount === 0
            ? "no moments yet"
            : `${sessionsCount} moment${sessionsCount === 1 ? "" : "s"}`}
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="text-ink-quaternary"
        />
      </div>
    </Link>
  );
}
