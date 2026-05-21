"use client";

import { ArrowRight, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import SkillIcon from "@/components/SkillIcon";
import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import { useActivityLog } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import type { Activity, SkillKey } from "@/types";

type FilterKey = "all" | SkillKey;

function isSkillKey(value: string | null): value is SkillKey {
  return value !== null && (SKILL_KEYS as string[]).includes(value);
}

/**
 * Library — pill filters across the 8 spec skills (no invented
 * categories), purple Today's Pick hero, and a list of activity rows
 * with contextual Lucide icons in skill-tinted squares.
 *
 * When arrived from /done/[id] (?from=completion), a dismissable
 * banner sits above the title saying "Pick another with {name}."
 */
export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryBody />
    </Suspense>
  );
}

function LibraryBody() {
  const searchParams = useSearchParams();
  const skillParam = searchParams?.get("skill") ?? null;
  const initialFilter: FilterKey = isSkillKey(skillParam) ? skillParam : "all";

  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const { child } = useChild();
  const { triedActivityIds } = useActivityLog();
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    // ?skill=<key> survives a back-nav into Library; re-apply if it
    // changes (e.g. user taps a different Track tile, returns).
    if (isSkillKey(skillParam)) {
      setFilter(skillParam);
    }
  }, [skillParam]);

  useEffect(() => {
    if (searchParams?.get("from") === "completion") {
      setBannerOpen(true);
    }
  }, [searchParams]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? ACTIVITIES
        : ACTIVITIES.filter((a) => a.skill === filter),
    [filter],
  );

  const featured = filtered[0];
  const rest = featured ? filtered.slice(1) : filtered;
  const childName = child?.name ?? "your child";

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        {bannerOpen ? (
          <CompletionBanner
            childName={childName}
            onDismiss={() => setBannerOpen(false)}
          />
        ) : null}

        <h1
          className="text-[30px] font-bold text-ink"
          style={{
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            paddingTop: 6,
            marginBottom: 22,
          }}
        >
          Activity Library
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
          className="text-[22px] font-bold text-ink"
          style={{ letterSpacing: "-0.01em", marginBottom: 16 }}
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
                <ActivityRow
                  activity={a}
                  isLast={i === rest.length - 1}
                  tried={triedActivityIds.has(a.id)}
                />
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
  /** Skill color; null for the "All" pill (uses ink bg when active). */
  color: string | null;
  active: boolean;
  onClick: () => void;
}) {
  // Active pill: skill-color background (or ink for "All") + white text.
  // Inactive pill: white background, hair border, ink text. No leading dot.
  const activeBg = color ?? "#1A1A1A";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors"
      style={{
        background: active ? activeBg : "#FFFFFF",
        border: `1px solid ${active ? activeBg : "#EEEEEE"}`,
        color: active ? "#FFFFFF" : "#1A1A1A",
      }}
    >
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
        style={{ background: skill.color }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="text-[12px] font-bold"
            style={{ color: "rgba(255,255,255,0.68)", marginBottom: 6 }}
          >
            Today&apos;s pick
          </p>
          <p
            className="font-bold text-white"
            style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: "-0.01em" }}
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
            className="mt-2 inline-flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[11px] font-bold text-white"
            style={{ background: "rgba(255,255,255,0.22)" }}
          >
            Start <ArrowRight size={11} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ActivityRow({
  activity,
  isLast,
  tried,
}: {
  activity: Activity;
  isLast: boolean;
  tried: boolean;
}) {
  const skill = SKILLS[activity.skill];
  return (
    <div
      className={`flex items-center gap-3.5 py-3.5 ${
        isLast ? "" : "border-b"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <SkillIcon
        skillId={activity.skill}
        size="sm"
        iconName={activity.iconName}
      />
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
      {tried ? (
        <span
          aria-label="Try again"
          className="inline-flex shrink-0 items-center gap-1"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1A1A1A",
          }}
        >
          Try again
          <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
        </span>
      ) : (
        <span
          aria-hidden
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--bg-alt)" }}
        >
          <ChevronRight size={13} strokeWidth={2.5} className="text-ink-tertiary" />
        </span>
      )}
    </div>
  );
}

function CompletionBanner({
  childName,
  onDismiss,
}: {
  childName: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="mb-4 flex items-center gap-2 rounded-[12px] px-4 py-3"
      style={{ background: "#F7F7F5", border: "1px solid #EEEEEE" }}
    >
      <p
        className="flex-1"
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1A1A1A",
          lineHeight: 1.4,
          letterSpacing: "-0.005em",
        }}
      >
        Pick another with {childName}.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X size={16} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
