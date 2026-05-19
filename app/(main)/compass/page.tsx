"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES } from "@/lib/content/activities";
import {
  TRAITS,
  TRAIT_KEYS,
  computeTraitStats,
  type TraitKey,
  type TraitStat,
} from "@/lib/content/traits";
import { db, getChild } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Activity, Child, Session } from "@/types";

const MONTHLY_GOAL = 12;

export default function CompassPage() {
  const activeChildId = useAppStore((s) => s.activeChildId);
  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) {
      setLoaded(true);
      return;
    }
    void (async () => {
      try {
        const [c, all] = await Promise.all([
          getChild(activeChildId),
          db.sessions.where("childId").equals(activeChildId).toArray(),
        ]);
        if (cancelled) return;
        setChild(c ?? null);
        setSessions(all);
      } catch (err) {
        console.error("[/compass] load:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const stats = useMemo(() => computeTraitStats(sessions), [sessions]);
  const monthCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const iso = cutoff.toISOString().slice(0, 10);
    return sessions.filter(
      (s) => s.date >= iso && s.response !== "skipped",
    ).length;
  }, [sessions]);

  // Top-two traits get strength detail cards. We sort by session count then
  // by the trait order so ties resolve deterministically.
  const topStrengths = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.sessions - a.sessions)
        .filter((s) => s.sessions > 0)
        .slice(0, 2),
    [stats],
  );

  const nurturePicks = useMemo(() => pickNurture(sessions, stats), [
    sessions,
    stats,
  ]);

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!child) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">No active child.</p>
      </main>
    );
  }

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
          Invisible
          <br />
          Strengths
        </h1>

        <ProfileCard
          child={child}
          monthCount={monthCount}
          goal={MONTHLY_GOAL}
        />

        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
          {stats.map((s) => (
            <TraitStatCard key={s.key} stat={s} />
          ))}
        </div>

        {topStrengths.length > 0 ? (
          <div className="mb-4 flex flex-col gap-3">
            {topStrengths.map((s) => (
              <StrengthCard key={s.key} stat={s} />
            ))}
          </div>
        ) : null}

        <h2
          className="text-[22px] font-bold text-ink"
          style={{ letterSpacing: "-0.02em", marginBottom: 12, marginTop: 8 }}
        >
          Nurture today
        </h2>

        <ul>
          {nurturePicks.map((a, i) => (
            <li key={a.id}>
              <Link
                href={`/activity/${a.id}?from=compass`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              >
                <NurtureRow
                  activity={a}
                  isLast={i === nurturePicks.length - 1}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function ProfileCard({
  child,
  monthCount,
  goal,
}: {
  child: Child;
  monthCount: number;
  goal: number;
}) {
  const pct = Math.min(100, Math.round((monthCount / goal) * 100));
  return (
    <div
      className="rounded-[20px] border-[1.5px] border-dashed bg-bg-elevated p-[18px]"
      style={{ borderColor: "var(--ink-quaternary)", marginBottom: 20 }}
    >
      <div className="mb-4 flex items-center gap-3.5">
        <div
          aria-hidden
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-[26px]"
          style={{
            background:
              "linear-gradient(135deg, #5BC8F5, #29A8E0)",
            color: "#fff",
          }}
        >
          {child.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={child.photoUrl}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            "🙂"
          )}
        </div>
        <div>
          <p
            className="text-[18px] font-extrabold text-ink"
            style={{ letterSpacing: "-0.02em" }}
          >
            {child.name}
          </p>
          <p className="mt-0.5 text-[13px] text-ink-tertiary">
            {child.ageBand ?? `Age ${child.age}`} · Growing well
          </p>
        </div>
      </div>
      <p className="mb-1.5 text-[13px] text-ink-secondary">Growth this month</p>
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className="text-[28px] font-extrabold text-ink"
          style={{ letterSpacing: "-0.025em" }}
        >
          {monthCount} {monthCount === 1 ? "moment" : "moments"}
        </span>
        <span className="text-[13px] text-ink-tertiary">Goal {goal}</span>
      </div>
      <div className="h-2 rounded-full bg-bg-alt">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--accent), var(--amber))",
          }}
        />
      </div>
    </div>
  );
}

function TraitStatCard({ stat }: { stat: TraitStat }) {
  const trait = TRAITS[stat.key];
  const arrow = stat.badge === "Strong" || stat.badge === "Growing fast"
    ? "↑"
    : stat.badge === "Steady"
      ? "→"
      : "";
  return (
    <div
      className="relative flex min-h-[152px] flex-col justify-between overflow-hidden rounded-[22px] p-4"
      style={{ background: trait.color }}
    >
      <div>
        <p
          className="text-[12px] font-semibold"
          style={{ color: "rgba(255,255,255,0.68)", marginBottom: 6 }}
        >
          {trait.label}
        </p>
        <p
          className="font-extrabold text-white"
          style={{ fontSize: 32, lineHeight: 1, letterSpacing: "-0.025em" }}
        >
          {stat.percent}%
        </p>
      </div>
      <span
        className="inline-flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[11px] font-bold"
        style={{
          background: "rgba(255,255,255,0.22)",
          color: "rgba(255,255,255,0.92)",
          width: "fit-content",
        }}
      >
        {arrow} {stat.badge}
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
  );
}

function StrengthCard({ stat }: { stat: TraitStat }) {
  const trait = TRAITS[stat.key];
  return (
    <div
      className="rounded-[20px] border-[1.5px] bg-white p-[18px]"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px] text-[22px]"
            style={{ background: trait.bg }}
          >
            {trait.emoji}
          </div>
          <div>
            <p className="text-[16px] font-bold text-ink">{trait.label}</p>
            <p
              className="mt-0.5 text-[12px] text-ink-tertiary"
              style={{ lineHeight: 1.4, maxWidth: 200 }}
            >
              {trait.description}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-[10px] px-2.5 py-1 text-[11px] font-bold"
          style={{ color: trait.color, background: trait.bg }}
        >
          {stat.badge}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-bg-alt">
        <div
          className="h-full rounded-full"
          style={{ width: `${stat.percent}%`, background: trait.color }}
        />
      </div>
    </div>
  );
}

function NurtureRow({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast: boolean;
}) {
  const visual = nurtureVisualFor(activity);
  return (
    <div
      className={`flex items-center gap-3.5 py-3.5 ${
        isLast ? "" : "border-b"
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-[20px]"
        style={{ background: visual.bg }}
        aria-hidden
      >
        {visual.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-bold text-ink"
          style={{ marginBottom: 2 }}
        >
          {activity.title}
        </p>
        <p className="text-[12px] text-ink-tertiary line-clamp-1">
          Focus on {visual.label.toLowerCase()}
        </p>
      </div>
      <span
        aria-hidden
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-bg-alt"
      >
        <ChevronRight size={13} strokeWidth={2.5} className="text-ink-tertiary" />
      </span>
    </div>
  );
}

function nurtureVisualFor(activity: Activity): {
  emoji: string;
  bg: string;
  label: string;
} {
  // Find the surface trait this activity contributes to and use its emoji.
  for (const k of TRAIT_KEYS as TraitKey[]) {
    if (TRAITS[k].skills.includes(activity.skill)) {
      return {
        emoji: TRAITS[k].emoji,
        bg: TRAITS[k].bg,
        label: TRAITS[k].label,
      };
    }
  }
  return { emoji: "✨", bg: "var(--bg-alt)", label: "Today" };
}

function pickNurture(
  sessions: readonly Session[],
  stats: TraitStat[],
): Activity[] {
  // Surface 3 activities biased toward the trait that's lagging most.
  const sortedAsc = [...stats].sort((a, b) => a.percent - b.percent);
  const used = new Set<string>();
  const out: Activity[] = [];
  for (const stat of sortedAsc) {
    const trait = TRAITS[stat.key];
    const candidate = ACTIVITIES.find(
      (a) =>
        trait.skills.includes(a.skill) &&
        !used.has(a.id) &&
        !sessions.some((s) => s.activityId === a.id),
    );
    if (candidate) {
      out.push(candidate);
      used.add(candidate.id);
    }
    if (out.length >= 3) break;
  }
  return out;
}
