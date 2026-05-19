"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES } from "@/lib/content/activities";
import type { Activity, SkillKey } from "@/types";

type FilterKey = "all" | "sensory" | "storytelling" | "movement" | "mindfulness";

interface FilterDef {
  key: FilterKey;
  label: string;
  /** Skills whose activities fit this surface category. */
  skills: SkillKey[];
}

const FILTERS: FilterDef[] = [
  { key: "all", label: "All", skills: [] },
  { key: "sensory", label: "Sensory", skills: ["observation"] },
  { key: "storytelling", label: "Storytelling", skills: ["language", "creativity"] },
  { key: "movement", label: "Movement", skills: ["decisiveness"] },
  { key: "mindfulness", label: "Mindfulness", skills: ["emotional", "resilience"] },
];

// Skill → emoji + colored chip tint used in the activity-row icon square.
const SKILL_VISUAL: Record<SkillKey, { emoji: string; bg: string; tagColor: string; tagBg: string; categoryLabel: string }> = {
  curiosity: {
    emoji: "🔮",
    bg: "var(--amber-bg)",
    tagColor: "var(--amber-text)",
    tagBg: "var(--amber-bg)",
    categoryLabel: "Curiosity",
  },
  thinking: {
    emoji: "🧩",
    bg: "var(--accent-bg)",
    tagColor: "var(--accent-deep)",
    tagBg: "var(--accent-bg)",
    categoryLabel: "Thinking",
  },
  language: {
    emoji: "📖",
    bg: "var(--accent-bg)",
    tagColor: "var(--accent-deep)",
    tagBg: "var(--accent-bg)",
    categoryLabel: "Storytelling",
  },
  emotional: {
    emoji: "🪞",
    bg: "var(--coral-bg)",
    tagColor: "var(--coral-text)",
    tagBg: "var(--coral-bg)",
    categoryLabel: "Empathy",
  },
  resilience: {
    emoji: "🌿",
    bg: "var(--coral-bg)",
    tagColor: "var(--coral-text)",
    tagBg: "var(--coral-bg)",
    categoryLabel: "Mindfulness",
  },
  creativity: {
    emoji: "🎨",
    bg: "var(--green-bg)",
    tagColor: "var(--green-text)",
    tagBg: "var(--green-bg)",
    categoryLabel: "Creative",
  },
  observation: {
    emoji: "🔍",
    bg: "var(--green-bg)",
    tagColor: "var(--green-text)",
    tagBg: "var(--green-bg)",
    categoryLabel: "Sensory",
  },
  decisiveness: {
    emoji: "🏗️",
    bg: "var(--accent-bg)",
    tagColor: "var(--accent-deep)",
    tagBg: "var(--accent-bg)",
    categoryLabel: "Movement",
  },
};

export default function LibraryPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return ACTIVITIES;
    const def = FILTERS.find((f) => f.key === filter);
    if (!def) return ACTIVITIES;
    return ACTIVITIES.filter((a) => def.skills.includes(a.skill));
  }, [filter]);

  // Featured = first activity in the active filter.
  const featured = filtered[0];
  const rest = featured ? filtered.slice(1) : filtered;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-[50px] font-extrabold text-ink"
          style={{
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            paddingTop: 6,
            marginBottom: 22,
          }}
        >
          Activity
          <br />
          Library
        </h1>

        <div className="-mr-6 mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
                style={{
                  background: on ? "var(--ink)" : "var(--bg-elevated)",
                  border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                  color: on ? "#fff" : "var(--ink)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {featured ? <FeaturedPick activity={featured} /> : null}

        <h2
          className="text-[22px] font-bold text-ink"
          style={{ letterSpacing: "-0.02em", marginBottom: 16 }}
        >
          All activities
        </h2>

        <ul>
          {rest.map((a, i) => (
            <li key={a.id}>
              <Link
                href={`/activity/${a.id}?from=library`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              >
                <ActivityRow activity={a} isLast={i === rest.length - 1} />
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-ink-tertiary">
            No activities in this category yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}

function FeaturedPick({ activity }: { activity: Activity }) {
  return (
    <Link
      href={`/activity/${activity.id}?from=library`}
      className="mb-6 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[22px]"
    >
      <div
        className="relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded-[22px] p-4"
        style={{ background: "var(--accent)" }}
      >
        <div>
          <p
            className="text-[12px] font-semibold"
            style={{ color: "rgba(255,255,255,0.68)", marginBottom: 6 }}
          >
            Today&apos;s Pick
          </p>
          <p
            className="font-extrabold text-white"
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              maxWidth: "70%",
            }}
          >
            {activity.title}
          </p>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.4, maxWidth: "70%" }}
          >
            {activity.description}
          </p>
        </div>
        <span
          className="mt-2 inline-flex w-fit items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[11px] font-bold text-white"
          style={{ background: "rgba(255,255,255,0.22)" }}
        >
          Start now <ArrowRight size={11} strokeWidth={2.5} />
        </span>
        <svg
          aria-hidden
          viewBox="0 0 170 38"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          height={38}
          width="100%"
        >
          <path
            d="M0 24C18 10 30 32 48 22C66 12 76 34 96 22C116 10 128 32 148 22C158 16 164 20 170 18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
        </svg>
      </div>
    </Link>
  );
}

function ActivityRow({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast: boolean;
}) {
  const visual = SKILL_VISUAL[activity.skill];
  return (
    <div
      className={`flex items-center gap-3.5 py-3.5 ${
        isLast ? "" : "border-b"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] text-[24px]"
        style={{ background: visual.bg }}
        aria-hidden
      >
        {visual.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[16px] font-bold text-ink"
          style={{ marginBottom: 3 }}
        >
          {activity.title}
        </p>
        <p className="text-[12px] text-ink-tertiary line-clamp-1">
          {activity.description}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-[10px] px-2 py-[3px] text-[11px] font-bold"
            style={{ color: visual.tagColor, background: visual.tagBg }}
          >
            {visual.categoryLabel}
          </span>
          <span className="text-[11px] text-ink-tertiary">
            {activity.duration} min
          </span>
        </div>
      </div>
      <span
        aria-hidden
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-alt)" }}
      >
        <ChevronRight size={13} strokeWidth={2.5} className="text-ink-tertiary" />
      </span>
    </div>
  );
}
