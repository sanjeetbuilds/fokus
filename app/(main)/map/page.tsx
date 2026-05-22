"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import ActivitiesSheet from "@/components/activity/ActivitiesSheet";
import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { ActivityLogRow } from "@/lib/supabase/queries";
import { useActivityLog } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import type { SkillKey } from "@/types";

const TOTAL_ACTIVITIES = ACTIVITIES.length;

/**
 * Track — parent-facing record of what they've done with their child.
 *
 *   "What we've done together." 24 / 700 ink
 *   "With {name}."              13 / 400 muted
 *
 *   ┌── Explored ────┐  ┌── Done this month ──┐
 *
 *   This week
 *   ┌── 7-day bar chart ─────────────────┐
 *
 *   By skill
 *   2x4 grid of skill cards
 *
 *   Recent
 *   list of activity_log rows (uncapped)
 *
 * Empty state (zero rows): both stat cards show 0; everything below
 * is replaced by a centred "Nothing yet." block linking to /.
 */
export default function TrackPage() {
  const { child, loading: childLoading } = useChild();
  const { rows, loading: rowsLoading } = useActivityLog();

  const [openSkill, setOpenSkill] = useState<SkillKey | null>(null);

  const childName = child?.name ?? "your child";
  const loaded = !childLoading && !rowsLoading;
  const isEmpty = rows.length === 0;

  const stats = useMemo(() => computeStats(rows), [rows]);
  const weekData = useMemo(() => computeWeek(rows, new Date()), [rows]);
  const triedBySkill = useMemo(() => {
    const m = new Map<SkillKey, Set<string>>();
    for (const k of SKILL_KEYS) m.set(k, new Set());
    for (const r of rows) {
      const skill = getActivityById(r.activity_id)?.skill;
      if (skill) m.get(skill)?.add(r.activity_id);
    }
    return m;
  }, [rows]);

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-5 pt-2">
        <h1
          style={{
            paddingTop: 6,
            fontSize: 24,
            fontWeight: 700,
            color: "#252630",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          What we&apos;ve done together.
        </h1>
        <p
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.5,
          }}
        >
          With {childName}.
        </p>

        {!loaded ? (
          <p
            className="text-footnote text-ink-tertiary"
            style={{ marginTop: 24 }}
          >
            Loading…
          </p>
        ) : (
          <>
            <div style={{ marginTop: 18 }}>
              <StatCards
                exploredCount={stats.distinctExplored}
                doneThisMonth={stats.doneThisMonth}
              />
            </div>

            {isEmpty ? (
              <EmptyState />
            ) : (
              <>
                <SectionLabel style={{ marginTop: 20 }}>
                  This week
                </SectionLabel>
                <div style={{ marginTop: 8 }}>
                  <WeekChart data={weekData} />
                </div>

                <SectionLabel style={{ marginTop: 20 }}>By skill</SectionLabel>
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {SKILL_KEYS.map((k) => (
                    <SkillCard
                      key={k}
                      skillId={k}
                      triedCount={triedBySkill.get(k)?.size ?? 0}
                      onOpen={() => setOpenSkill(k)}
                    />
                  ))}
                </div>

                <SectionLabel style={{ marginTop: 20 }}>Recent</SectionLabel>
                <ul
                  style={{
                    marginTop: 8,
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {rows.map((row, i) => (
                    <li
                      key={row.id}
                      style={{
                        borderBottom:
                          i === rows.length - 1
                            ? undefined
                            : "0.5px solid #F0F0F0",
                      }}
                    >
                      <RecentRow row={row} now={new Date()} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      <ActivitiesSheet
        open={openSkill !== null}
        onClose={() => setOpenSkill(null)}
        skillId={openSkill}
        activityLog={rows}
        fromContext="track"
      />
    </main>
  );
}

// ============================================================
// Stats
// ============================================================

interface ComputedStats {
  distinctExplored: number;
  doneThisMonth: number;
}

function computeStats(rows: ActivityLogRow[]): ComputedStats {
  const distinctIds = new Set<string>();
  const now = new Date();
  const monthY = now.getUTCFullYear();
  const monthM = now.getUTCMonth();
  let doneThisMonth = 0;
  for (const r of rows) {
    distinctIds.add(r.activity_id);
    const d = new Date(r.completed_at);
    if (d.getUTCFullYear() === monthY && d.getUTCMonth() === monthM) {
      doneThisMonth += 1;
    }
  }
  return { distinctExplored: distinctIds.size, doneThisMonth };
}

function StatCards({
  exploredCount,
  doneThisMonth,
}: {
  exploredCount: number;
  doneThisMonth: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
      }}
    >
      <StatCard
        background="#F4C84A"
        number={exploredCount}
        firstLine="explored"
        secondLine={`of ${TOTAL_ACTIVITIES}`}
      />
      <StatCard
        background="#9CA5FF"
        number={doneThisMonth}
        firstLine="done"
        secondLine="this month"
      />
    </div>
  );
}

function StatCard({
  background,
  number,
  firstLine,
  secondLine,
}: {
  background: string;
  number: number;
  firstLine: string;
  secondLine: string;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 110,
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.3,
        }}
      >
        {firstLine}
        <br />
        {secondLine}
      </span>
    </div>
  );
}

// ============================================================
// This week — bar chart
// ============================================================

interface DayBucket {
  /** Monday-based label: M T W T F S S */
  label: string;
  count: number;
  isToday: boolean;
}

/**
 * Returns 7 buckets, Monday → Sunday, counting activity_log rows that
 * land on each day of the current week (computed in the local
 * timezone — the user's "today" is what matters here).
 */
function computeWeek(rows: ActivityLogRow[], now: Date): DayBucket[] {
  // ISO week: Monday is day 1. JS getDay() returns 0 (Sun)..6 (Sat).
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // 0=Mon..6=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);

  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const buckets: DayBucket[] = labels.map((label, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const isToday = day.getTime() === today.getTime();
    return { label, count: 0, isToday };
  });

  for (const r of rows) {
    const d = new Date(r.completed_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor(
      (d.getTime() - monday.getTime()) / 86_400_000,
    );
    if (diff >= 0 && diff < 7) {
      buckets[diff]!.count += 1;
    }
  }
  return buckets;
}

function WeekChart({ data }: { data: DayBucket[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div
      style={{
        background: "#F7F7F5",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          height: 72,
          gap: 4,
        }}
      >
        {data.map((d, i) => {
          // Min 8px so the bar still reads on a zero-day.
          const heightPx = Math.max(8, Math.round((d.count / max) * 72));
          const fill = d.isToday
            ? "#3D7A5C"
            : d.count > 0
              ? "#D4EDE0"
              : "#EEEEEE";
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
              }}
            >
              <div
                aria-label={`${d.count} activit${d.count === 1 ? "y" : "ies"} on day ${i + 1}`}
                style={{
                  width: "100%",
                  height: heightPx,
                  background: fill,
                  borderRadius: 5,
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 4,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              fontWeight: d.isToday ? 700 : 500,
              color: d.isToday ? "#252630" : "#8E8D9B",
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// By skill grid card
// ============================================================

function SkillCard({
  skillId,
  triedCount,
  onOpen,
}: {
  skillId: SkillKey;
  triedCount: number;
  onOpen: () => void;
}) {
  const skill = SKILLS[skillId];
  // 8-digit hex: hex + "1A" ≈ 10% alpha background tint.
  const tintBg = `${skill.color}1A`;
  const isStarted = triedCount > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
        background: "#FFFFFF",
        border: "0.5px solid #EEEEEE",
        borderRadius: 16,
        padding: 14,
        cursor: "pointer",
        textAlign: "left",
      }}
      className="transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: tintBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: skill.color,
        }}
      >
        <ActivityIcon
          iconName={skill.iconName}
          skill={skillId}
          size={20}
          strokeWidth={2.25}
          style={{ color: skill.color }}
        />
      </span>
      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 700,
          color: "#252630",
          letterSpacing: "-0.005em",
          lineHeight: 1.2,
        }}
      >
        {skill.label}
      </p>
      <p
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 400,
          color: isStarted ? "#8E8D9B" : "#C2C0CB",
          lineHeight: 1.4,
        }}
      >
        {isStarted ? `${triedCount} of 8 tried` : "Not started yet"}
      </p>
    </button>
  );
}

// ============================================================
// Recent row
// ============================================================

function RecentRow({ row, now }: { row: ActivityLogRow; now: Date }) {
  const activity = useMemo(
    () => getActivityById(row.activity_id) ?? null,
    [row.activity_id],
  );
  if (!activity) return null;
  const skill = SKILLS[activity.skill];
  const tintBg = `${skill.color}1A`;
  const rel = relativeShortDate(row.completed_at, now);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: tintBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: skill.color,
          flexShrink: 0,
        }}
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={20}
          strokeWidth={2.25}
          style={{ color: skill.color }}
        />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#252630",
            letterSpacing: "-0.005em",
            lineHeight: 1.3,
          }}
        >
          {activity.title}
        </p>
        <p
          style={{
            marginTop: 2,
            fontSize: 12,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.4,
          }}
        >
          {skill.label} · {activity.duration} min
        </p>
        {row.parent_note ? (
          <p
            style={{
              marginTop: 4,
              fontSize: 12,
              fontStyle: "italic",
              color: "#8E8D9B",
              lineHeight: 1.5,
            }}
          >
            {row.parent_note}
          </p>
        ) : null}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: "#8E8D9B",
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        {rel}
      </span>
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================

function EmptyState() {
  return (
    <div
      style={{
        marginTop: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#252630",
        }}
      >
        Nothing yet.
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#8E8D9B",
        }}
      >
        Today&apos;s activity is waiting.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "#252630",
          textDecoration: "none",
        }}
      >
        Go to Today →
      </Link>
    </div>
  );
}

// ============================================================
// Shared
// ============================================================

function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#8E8D9B",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function relativeShortDate(iso: string, now: Date): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const startOfThen = new Date(then);
  startOfThen.setHours(0, 0, 0, 0);
  const startOfNow = new Date(now);
  startOfNow.setHours(0, 0, 0, 0);
  const days = Math.floor(
    (startOfNow.getTime() - startOfThen.getTime()) / 86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
