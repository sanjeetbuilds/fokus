"use client";

import Link from "next/link";
import { useMemo } from "react";

import SkillIcon from "@/components/SkillIcon";
import AppHeader from "@/components/layout/AppHeader";
import { getActivityById } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import type { ActivityLogRow } from "@/lib/supabase/queries";
import { useActivityLog } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import type { SkillKey } from "@/types";

/**
 * Track — parent-facing record of what they've done with their child.
 *
 *   header  "What we've done together."
 *   subhead "With {name}."
 *
 *   (1) Monthly count line
 *   (2) 8-week heatmap of completion days, coloured by skill
 *   (3) "By skill" — 2×4 tiles of all 8 skills with distinct-count
 *   (4) "Recent" — list of completed activities, optional notes
 *
 * All four sections derive from a single Supabase query
 * (lib/use-activity-log.ts). Per SPEC §2 nothing here measures the
 * child; everything counts what the *parent* has done with the child.
 */
export default function TrackPage() {
  const { child, loading: childLoading } = useChild();
  const { rows, loading: rowsLoading } = useActivityLog();

  const loaded = !childLoading && !rowsLoading;
  const childName = child?.name ?? "your child";
  const isEmpty = rows.length === 0;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-ink"
          style={{
            paddingTop: 6,
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginBottom: 4,
          }}
        >
          What we&apos;ve done together.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6B6B6B",
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
            <div style={{ marginTop: 24 }}>
              <MonthlyCount rows={rows} />
            </div>
            <div style={{ marginTop: 32 }}>
              <Heatmap rows={rows} />
            </div>
            <div style={{ marginTop: 32 }}>
              <SkillTiles rows={rows} />
            </div>
            {!isEmpty ? (
              <div style={{ marginTop: 32 }}>
                <RecentList rows={rows} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

// ============================================================
// (1) Monthly count line
// ============================================================

function MonthlyCount({ rows }: { rows: ActivityLogRow[] }) {
  const count = useMemo(() => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    return rows.filter((r) => {
      const d = new Date(r.completed_at);
      return d.getUTCFullYear() === y && d.getUTCMonth() === m;
    }).length;
  }, [rows]);

  if (count === 0) {
    return (
      <p style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.5 }}>
        Nothing yet this month.{" "}
        <Link
          href="/today"
          style={{ color: "#1A1A1A", fontWeight: 700 }}
        >
          Today screen
        </Link>{" "}
        is waiting.
      </p>
    );
  }

  return (
    <p style={{ fontSize: 16, color: "#6B6B6B", lineHeight: 1.5 }}>
      <span style={{ color: "#1A1A1A", fontWeight: 700 }}>{count}</span> done
      together this month.
    </p>
  );
}

// ============================================================
// (2) Heatmap — 8 weeks × 7 days
// ============================================================

const HEATMAP_WEEKS = 8;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function Heatmap({ rows }: { rows: ActivityLogRow[] }) {
  // The grid is anchored on today: the bottom-right cell is today's
  // weekday, the top-left is 8 weeks ago aligned to the start of that
  // week. Build a map of date → most-recent skill that day.
  const skillByDate = useMemo(() => {
    const m = new Map<string, SkillKey>();
    // Iterate oldest → newest so later writes win (most recent).
    // rows are returned by Supabase newest-first; reverse for that.
    const oldestFirst = [...rows].reverse();
    for (const r of oldestFirst) {
      const skill = getActivityById(r.activity_id)?.skill;
      if (!skill) continue;
      const key = dateKey(new Date(r.completed_at));
      m.set(key, skill);
    }
    return m;
  }, [rows]);

  const cells = useMemo(() => buildHeatmapCells(skillByDate), [skillByDate]);

  return (
    <div>
      <div
        role="grid"
        aria-label="Last 8 weeks of activity"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, 18px)`,
          gridAutoRows: "18px",
          gap: 4,
          justifyContent: "center",
        }}
      >
        {DAY_LABELS.map((label, i) => (
          <span
            key={`label-${i}`}
            role="columnheader"
            style={{
              fontSize: 10,
              color: "#8A8A8A",
              textAlign: "center",
              lineHeight: 1,
              alignSelf: "center",
            }}
          >
            {label}
          </span>
        ))}
        {cells.map((cell, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: cell ?? "#F7F7F5",
            }}
          />
        ))}
      </div>
      <p
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: "#8A8A8A",
        }}
      >
        Last 8 weeks
      </p>
    </div>
  );
}

function dateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build the cell array for the 8×7 grid in column order: each row of
 * the grid is one weekday (Mon..Sun) across 8 weeks. The leftmost
 * column is the oldest week, the rightmost is the current week. Days
 * after "today" in the current week stay empty.
 */
function buildHeatmapCells(skillByDate: Map<string, SkillKey>): (string | null)[] {
  const today = new Date();
  // Find the Monday of the current week in UTC. getUTCDay: 0=Sun..6=Sat
  const todayMidnight = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const dow = todayMidnight.getUTCDay(); // 0=Sun..6=Sat
  const offsetFromMonday = (dow + 6) % 7; // Mon=0, Sun=6
  const currentMonday = new Date(todayMidnight);
  currentMonday.setUTCDate(todayMidnight.getUTCDate() - offsetFromMonday);

  // First Monday of the window: HEATMAP_WEEKS - 1 weeks before this one
  const startMonday = new Date(currentMonday);
  startMonday.setUTCDate(currentMonday.getUTCDate() - 7 * (HEATMAP_WEEKS - 1));

  // Grid is rendered row-by-row: row 0 = Monday across 8 weeks etc.
  // We need a 7×8 array, then flatten column-by-column? No — CSS grid
  // with 7 columns / N auto rows reads in row-major order, so we need
  // 7×N cells where each row is one weekday across the 8 weeks.
  //
  // Actually re-reading the spec: 7 columns × 8 rows works better on
  // mobile, days across the top, weeks stacking down. So:
  //   - row 0 = oldest week (Mon..Sun in columns 0..6)
  //   - row 7 = current week
  // Each cell = startMonday + (week * 7 + day) days.
  const cells: (string | null)[] = [];
  for (let week = 0; week < HEATMAP_WEEKS; week++) {
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(startMonday);
      cellDate.setUTCDate(startMonday.getUTCDate() + week * 7 + day);
      if (cellDate.getTime() > todayMidnight.getTime()) {
        cells.push(null);
        continue;
      }
      const key = dateKey(cellDate);
      const skill = skillByDate.get(key);
      cells.push(skill ? SKILLS[skill].color : null);
    }
  }
  return cells;
}

// ============================================================
// (3) Skill tiles — 2 × 4
// ============================================================

function SkillTiles({ rows }: { rows: ActivityLogRow[] }) {
  const distinctBySkill = useMemo(() => {
    const map = new Map<SkillKey, Set<string>>();
    for (const k of SKILL_KEYS) map.set(k, new Set());
    for (const r of rows) {
      const skill = getActivityById(r.activity_id)?.skill;
      if (!skill) continue;
      map.get(skill)?.add(r.activity_id);
    }
    return map;
  }, [rows]);

  return (
    <section>
      <SectionHeader>By skill</SectionHeader>
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {SKILL_KEYS.map((key) => {
          const count = distinctBySkill.get(key)?.size ?? 0;
          return <SkillTile key={key} skillKey={key} count={count} />;
        })}
      </div>
    </section>
  );
}

function SkillTile({
  skillKey,
  count,
}: {
  skillKey: SkillKey;
  count: number;
}) {
  const skill = SKILLS[skillKey];
  return (
    <Link
      href={`/library?skill=${skillKey}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        background: "#FFFFFF",
        border: "1px solid #EEEEEE",
        borderRadius: 12,
        textDecoration: "none",
      }}
    >
      <SkillIcon skillId={skillKey} size="md" />
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1A1A1A",
          lineHeight: 1.3,
        }}
      >
        {skill.label}
      </p>
      {count === 0 ? (
        <p style={{ fontSize: 12, color: "#8A8A8A", lineHeight: 1.4 }}>
          Not started
        </p>
      ) : (
        <p style={{ fontSize: 12, color: "#1A1A1A", lineHeight: 1.4 }}>
          {count} done
        </p>
      )}
    </Link>
  );
}

// ============================================================
// (4) Recent list
// ============================================================

function RecentList({ rows }: { rows: ActivityLogRow[] }) {
  return (
    <section>
      <SectionHeader>Recent</SectionHeader>
      <ul style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 16 }}>
        {rows.map((row) => (
          <li key={row.id}>
            <RecentRow row={row} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentRow({ row }: { row: ActivityLogRow }) {
  const activity = useMemo(
    () => getActivityById(row.activity_id) ?? null,
    [row.activity_id],
  );

  if (!activity) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "#EEEEEE",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p style={rowTitleStyle}>Unknown activity</p>
            <p style={rowDateStyle}>{formatDate(row.completed_at)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <SkillIcon
        skillId={activity.skill}
        size="sm"
        iconName={activity.iconName}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p style={rowTitleStyle}>{activity.title}</p>
          <p style={rowDateStyle}>{formatDate(row.completed_at)}</p>
        </div>
        {row.parent_note ? (
          <p
            style={{
              marginTop: 8,
              paddingLeft: 12,
              borderLeft: "1px solid #EEEEEE",
              fontSize: 14,
              fontStyle: "italic",
              color: "#6B6B6B",
              lineHeight: 1.55,
            }}
          >
            {row.parent_note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const rowTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1A1A1A",
  letterSpacing: "-0.005em",
  lineHeight: 1.35,
};

const rowDateStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6B6B6B",
  flexShrink: 0,
  lineHeight: 1.4,
};

// ============================================================
// Shared
// ============================================================

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#8A8A8A",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </p>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
