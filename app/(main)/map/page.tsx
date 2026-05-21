"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SkillIcon from "@/components/SkillIcon";
import AppHeader from "@/components/layout/AppHeader";
import { getActivityById } from "@/lib/content/activities";
import {
  listActivityLog,
  type ActivityLogRow,
} from "@/lib/supabase/queries";
import { useChild } from "@/lib/use-child";

/**
 * Track — parent-facing record of what they've done with their child.
 *
 *   "What we've done together."                  Inter 28 / 800 ink
 *   "With {name}."                               Inter 14 / 400 muted
 *
 *   [for each completed activity, most recent first]
 *     [sm SkillIcon]  Activity title             15 / 800 ink
 *                     date (right-aligned)       13 / 400 muted
 *     ┊ optional italic note quote underneath    14 / muted, indented
 *
 *   Empty state:
 *     "Nothing yet. Start with today's activity."   + link to /today
 *
 * Per SPEC §2: no percentages, no streak counters, no skill mastery
 * levels. Just the list.
 *
 * Pulls from Supabase public.activity_log via listActivityLog().
 * Activity title and skill are resolved from the static library by
 * activity_id (the IDs are stable; the DB row only stores the ID).
 */
export default function TrackPage() {
  const { child, loading: childLoading } = useChild();
  const [rows, setRows] = useState<ActivityLogRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await listActivityLog();
        if (!cancelled) setRows(r);
      } catch (err) {
        console.error("[/map] listActivityLog:", err);
      } finally {
        if (!cancelled) setRowsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = !childLoading && !rowsLoading;
  const childName = child?.name ?? "your child";

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-ink"
          style={{
            paddingTop: 6,
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
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
            marginBottom: 28,
          }}
        >
          With {childName}.
        </p>

        {!loaded ? (
          <p className="text-footnote text-ink-tertiary">Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-5">
            {rows.map((row) => (
              <li key={row.id}>
                <ActivityLogItem row={row} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function ActivityLogItem({ row }: { row: ActivityLogRow }) {
  const activity = useMemo(
    () => getActivityById(row.activity_id) ?? null,
    [row.activity_id],
  );

  if (!activity) {
    // Unknown activity_id (library row removed, etc). Render a quiet
    // fallback so the row doesn't disappear from the parent's history.
    return (
      <div className="flex items-start gap-3">
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
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#1A1A1A",
                letterSpacing: "-0.005em",
              }}
            >
              Unknown activity
            </p>
            <p style={{ fontSize: 13, color: "#6B6B6B" }}>
              {formatDate(row.completed_at)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <SkillIcon
        skillId={activity.skill}
        size="sm"
        iconName={activity.iconName}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#1A1A1A",
              letterSpacing: "-0.005em",
              lineHeight: 1.35,
            }}
          >
            {activity.title}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#6B6B6B",
              flexShrink: 0,
              lineHeight: 1.4,
            }}
          >
            {formatDate(row.completed_at)}
          </p>
        </div>
        {row.parent_note ? (
          <p
            style={{
              marginTop: 8,
              paddingLeft: 12,
              borderLeft: "2px solid #EEEEEE",
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center" style={{ marginTop: 60 }}>
      <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.5 }}>
        Nothing yet. Start with today&apos;s activity.
      </p>
      <Link
        href="/today"
        className="mt-3 inline-block"
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#1A1A1A",
          letterSpacing: "-0.005em",
        }}
      >
        Go to Today →
      </Link>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
