"use client";

import { useMemo } from "react";

import type { Session } from "@/types";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface Bar {
  iso: string;
  date: Date;
  count: number;
  isToday: boolean;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface WeeklyBarsProps {
  sessions: Session[];
  today: Date;
}

/**
 * Bar chart row matching the design's `.chart-wrap` pattern: 7 day bars
 * (M..S), the tallest = highest count this week, the bar under today
 * is rendered in the mulberry "today" accent rather than the soft green.
 *
 * This is engagement frequency (moments per day) — NOT a measurement of
 * the child. Same intent as the calendar heatmap, just a different shape.
 */
export default function WeeklyBars({ sessions, today }: WeeklyBarsProps) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions) {
      m.set(s.date, (m.get(s.date) ?? 0) + 1);
    }
    return m;
  }, [sessions]);

  const bars = useMemo<Bar[]>(() => {
    const out: Bar[] = [];
    // Walk back 6 days from today so today is the rightmost bar.
    const cursor = new Date(today);
    cursor.setHours(0, 0, 0, 0);
    const start = new Date(cursor);
    start.setDate(start.getDate() - 6);

    const cell = new Date(start);
    while (cell <= cursor) {
      const iso = toIso(cell);
      out.push({
        iso,
        date: new Date(cell),
        count: counts.get(iso) ?? 0,
        isToday: iso === toIso(cursor),
      });
      cell.setDate(cell.getDate() + 1);
    }
    return out;
  }, [counts, today]);

  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <div className="flex h-[100px] items-end justify-between gap-1.5">
      {bars.map((b, i) => {
        const ratio = b.count / max;
        const height = b.count === 0 ? 10 : Math.max(16, ratio * 88);
        const isEmpty = b.count === 0;
        const color = isEmpty
          ? "var(--line)"
          : b.isToday
            ? "var(--mulberry)"
            : "var(--accent-soft)";
        // Find the actual real day-of-week index for the bar label.
        const dow = (b.date.getDay() + 6) % 7;
        return (
          <div
            key={b.iso}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              aria-label={`${b.count} moment${b.count === 1 ? "" : "s"} on ${b.date.toDateString()}`}
              style={{
                height: `${height}px`,
                backgroundColor: color,
                width: b.isToday ? 26 : 18,
                borderRadius: 999,
              }}
            />
            <span
              className={`text-[11px] ${
                b.isToday
                  ? "font-extrabold text-mulberry"
                  : "text-ink-tertiary"
              }`}
            >
              {DAY_LABELS[dow]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
