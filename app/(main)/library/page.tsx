"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { Activity, SkillKey } from "@/types";

type FilterKey = "all" | SkillKey;

/**
 * Library — pill filters across the 8 spec skills (no invented
 * categories), purple Today's Pick hero, and a list of activity rows
 * with contextual Lucide icons in skill-tinted squares.
 */
export default function LibraryPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? ACTIVITIES
        : ACTIVITIES.filter((a) => a.skill === filter),
    [filter],
  );

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
          <FilterPill
            label="All"
            color={null}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {SKILL_KEYS.map((k) => (
            <FilterPill
              key={k}
              label={SKILLS[k].label}
              color={SKILLS[k].color}
              active={filter === k}
              onClick={() => setFilter(k)}
            />
          ))}
        </div>

        {featured ? <FeaturedPick activity={featured} /> : null}

        <h2
          className="text-[22px] font-extrabold text-ink"
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
            No activities in this skill yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}

function FilterPill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  /** Skill color; null for the "All" pill. */
  color: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-extrabold transition-colors"
      style={{
        background: active ? "var(--ink)" : "var(--bg-elevated)",
        border: `1.5px solid ${active ? "var(--ink)" : "var(--line)"}`,
        color: active ? "#fff" : "var(--ink)",
      }}
    >
      {color ? (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      ) : null}
      {label}
    </button>
  );
}

function FeaturedPick({ activity }: { activity: Activity }) {
  const skill = SKILLS[activity.skill];
  return (
    <Link
      href={`/activity/${activity.id}?from=library`}
      className="mb-6 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[22px]"
    >
      <div
        className="relative flex min-h-[128px] items-center gap-3.5 overflow-hidden rounded-[22px] p-4"
        style={{ background: "var(--accent)" }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[12px] font-extrabold"
            style={{ color: "rgba(255,255,255,0.68)", marginBottom: 6 }}
          >
            Today&apos;s pick
          </p>
          <p
            className="font-extrabold text-white"
            style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.025em" }}
          >
            {activity.title}
          </p>
          <p
            className="mt-1 text-[12px]"
            style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}
          >
            {activity.description}
          </p>
          <span
            className="mt-2 inline-flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[11px] font-extrabold text-white"
            style={{ background: "rgba(255,255,255,0.22)" }}
          >
            Start <ArrowRight size={11} strokeWidth={2.5} />
          </span>
        </div>
        <div
          aria-hidden
          className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: skill.color, color: "#fff" }}
        >
          <ActivityIcon
            iconName={activity.iconName}
            skill={activity.skill}
            size={36}
            strokeWidth={1.5}
          />
        </div>
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
  const skill = SKILLS[activity.skill];
  return (
    <div
      className={`flex items-center gap-3.5 py-3.5 ${
        isLast ? "" : "border-b"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px]"
        style={{ background: skill.color, color: "#fff" }}
        aria-hidden
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={22}
          strokeWidth={1.75}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[16px] font-extrabold text-ink"
          style={{ marginBottom: 3 }}
        >
          {activity.title}
        </p>
        <p className="text-[12px] text-ink-tertiary line-clamp-1">
          {activity.description}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-[10px] px-2 py-[3px] text-[11px] font-extrabold"
            style={{
              color: skill.color,
              background: `${skill.color}1F`,
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
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--bg-alt)" }}
      >
        <ChevronRight size={13} strokeWidth={2.5} className="text-ink-tertiary" />
      </span>
    </div>
  );
}
