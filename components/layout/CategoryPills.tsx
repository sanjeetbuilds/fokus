"use client";

import Chip from "@/components/ui/Chip";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

export type CategoryValue = SkillKey | "all";

export interface CategoryPillsProps {
  selected: CategoryValue;
  onChange: (value: CategoryValue) => void;
}

/**
 * Horizontal-scroll pill row matching the design's `.pill` filter pattern.
 * Selecting "All" or a specific skill key. Used by Today and Library.
 */
export default function CategoryPills({
  selected,
  onChange,
}: CategoryPillsProps) {
  return (
    <div
      className="-mx-5 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex w-max gap-2 px-5 pb-1">
        <Chip
          size="sm"
          selected={selected === "all"}
          onClick={() => onChange("all")}
        >
          All
        </Chip>
        {SKILL_KEYS.map((k) => {
          const skill = SKILLS[k];
          const isSel = selected === k;
          return (
            <Chip
              key={k}
              size="sm"
              selected={isSel}
              onClick={() => onChange(k)}
              leftIcon={
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: isSel ? "currentColor" : skill.color,
                  }}
                />
              }
            >
              {skill.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
