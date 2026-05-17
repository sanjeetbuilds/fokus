"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ActivityCard from "@/components/activity/ActivityCard";
import Wordmark from "@/components/shared/Wordmark";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

type Filter = SkillKey | "all";

export default function LibraryPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? ACTIVITIES
        : ACTIVITIES.filter((a) => a.skill === filter),
    [filter],
  );

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <div className="flex items-center justify-between">
        <Wordmark size="sm" />
      </div>

      <header className="mt-6">
        <h1
          className="font-display text-[36px] font-semibold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.1 }}
        >
          All activities
        </h1>
        <p className="mt-3 text-[16px] text-ink-secondary" style={{ lineHeight: 1.5 }}>
          {ACTIVITIES.length} activities across 8 skill areas. Pick any one to
          do today.
        </p>
      </header>

      {/* Filter row — horizontal scroll on mobile, no scrollbar */}
      <div
        className="-mx-5 mt-6 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex w-max gap-2 px-5">
          <Chip
            selected={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </Chip>
          {SKILL_KEYS.map((k) => {
            const skill = SKILLS[k];
            const selected = filter === k;
            return (
              <Chip
                key={k}
                selected={selected}
                onClick={() => setFilter(k)}
                leftIcon={
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: selected ? "currentColor" : skill.color,
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

      {/* List */}
      <section className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="No activities in this skill yet."
            description="The library should have eight per skill — if you see this, something's wrong with the content file."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((activity) => (
              <li key={activity.id}>
                <Link
                  href={`/activity/${activity.id}?from=library`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                >
                  <ActivityCard activity={activity} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
