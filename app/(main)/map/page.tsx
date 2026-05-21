"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SkillIcon from "@/components/SkillIcon";
import SkillTile from "@/components/SkillTile";
import ActivitiesSheet from "@/components/activity/ActivitiesSheet";
import AppHeader from "@/components/layout/AppHeader";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILL_KEYS } from "@/lib/content/skills";
import type { ActivityLogRow } from "@/lib/supabase/queries";
import { useActivityLog } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import type { SkillKey } from "@/types";

/**
 * Track — parent-facing record of what they've done with their child.
 *
 *   header  "What we've done together"           28-30 / 700 ink
 *   subhead "With {name}."                       14 / 400 muted
 *
 *   ┌── Explored ────┐  ┌── Done this month ──┐
 *   │   12           │  │   3                 │
 *   │   explored     │  │   done              │
 *   │   of 64        │  │   this month        │
 *   └─ skill yellow ─┘  └─ skill periwinkle ──┘
 *
 *   BY SKILL
 *   [2x4 SkillTile grid — variant='tried']
 *
 *   RECENT
 *   list of activity_log rows, most recent first, optional parent_note
 *
 * Empty state (zero rows):
 *   Both cards show 0. Skill tiles all "0 of 8 done". Recent section
 *   hidden. A quiet inline message points to /today.
 *
 * All data on this screen derives from a single useActivityLog query.
 */
export default function TrackPage() {
  const { child, loading: childLoading } = useChild();
  const { rows, loading: rowsLoading } = useActivityLog();

  const [openSkill, setOpenSkill] = useState<SkillKey | null>(null);

  const stats = useMemo(() => computeStats(rows), [rows]);
  const loaded = !childLoading && !rowsLoading;
  const childName = child?.name ?? "your child";
  const isEmpty = rows.length === 0;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          style={{
            paddingTop: 6,
            fontSize: 38,
            fontWeight: 800,
            color: "#252630",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            marginBottom: 8,
          }}
        >
          What we&apos;ve
          <br />
          done together
        </h1>
        <p
          style={{
            fontSize: 14,
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
            <div style={{ marginTop: 24 }}>
              <StatCards
                exploredCount={stats.distinctExplored}
                doneThisMonth={stats.doneThisMonth}
              />
            </div>

            <div style={{ marginTop: 32 }}>
              <SectionHeader>By skill</SectionHeader>
              <div
                style={{
                  marginTop: 8,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {SKILL_KEYS.map((k) => (
                  <SkillTile
                    key={k}
                    skillId={k}
                    variant="tried"
                    triedCount={stats.distinctBySkill.get(k)?.size ?? 0}
                    onClick={() => setOpenSkill(k)}
                  />
                ))}
              </div>
            </div>

            {!isEmpty ? (
              <div style={{ marginTop: 32 }}>
                <SectionHeader>Recent</SectionHeader>
                <ul
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {rows.slice(0, 10).map((row) => (
                    <li key={row.id}>
                      <RecentRow row={row} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ marginTop: 32 }}>
                <p
                  style={{
                    fontSize: 15,
                    color: "#8E8D9B",
                    lineHeight: 1.5,
                  }}
                >
                  Nothing yet.{" "}
                  <Link
                    href="/today"
                    style={{ color: "#252630", fontWeight: 700 }}
                  >
                    Today screen
                  </Link>{" "}
                  is waiting.
                </p>
              </div>
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
  distinctBySkill: Map<SkillKey, Set<string>>;
}

function computeStats(rows: ActivityLogRow[]): ComputedStats {
  const distinctIds = new Set<string>();
  const distinctBySkill = new Map<SkillKey, Set<string>>();
  for (const k of SKILL_KEYS) distinctBySkill.set(k, new Set());

  const now = new Date();
  const monthY = now.getUTCFullYear();
  const monthM = now.getUTCMonth();
  let doneThisMonth = 0;

  for (const r of rows) {
    distinctIds.add(r.activity_id);
    const skill = getActivityById(r.activity_id)?.skill;
    if (skill) distinctBySkill.get(skill)?.add(r.activity_id);

    const d = new Date(r.completed_at);
    if (d.getUTCFullYear() === monthY && d.getUTCMonth() === monthM) {
      doneThisMonth += 1;
    }
  }

  return {
    distinctExplored: distinctIds.size,
    doneThisMonth,
    distinctBySkill,
  };
}

// ============================================================
// Stat cards
// ============================================================

const TOTAL_ACTIVITIES = ACTIVITIES.length;

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
        gap: 12,
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
        borderRadius: 22,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        minHeight: 130,
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1.3,
        }}
      >
        {firstLine}
        <br />
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{secondLine}</span>
      </span>
    </div>
  );
}

// ============================================================
// Recent rows
// ============================================================

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
            background: "#E5E3DA",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={recentTopRowStyle}>
            <p style={recentTitleStyle}>Unknown activity</p>
            <p style={recentDateStyle}>{formatDate(row.completed_at)}</p>
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
        <div style={recentTopRowStyle}>
          <p style={recentTitleStyle}>{activity.title}</p>
          <p style={recentDateStyle}>{formatDate(row.completed_at)}</p>
        </div>
        {row.parent_note ? (
          <p
            style={{
              marginTop: 8,
              paddingLeft: 12,
              borderLeft: "1px solid #E5E3DA",
              fontSize: 14,
              fontStyle: "italic",
              color: "#8E8D9B",
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

const recentTopRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
};

const recentTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#252630",
  letterSpacing: "-0.005em",
  lineHeight: 1.35,
};

const recentDateStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#8E8D9B",
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
        color: "#8E8D9B",
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
