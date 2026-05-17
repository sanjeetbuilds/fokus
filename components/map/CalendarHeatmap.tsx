"use client";

import { useMemo } from "react";

import type { Session } from "@/types";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS = 4;
const TOTAL_DAYS = WEEKS * 7;

interface DayCell {
  iso: string;
  date: Date;
  count: number;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export interface CalendarHeatmapProps {
  sessions: Session[];
  today: Date;
}

export default function CalendarHeatmap({
  sessions,
  today,
}: CalendarHeatmapProps) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions) {
      m.set(s.date, (m.get(s.date) ?? 0) + 1);
    }
    return m;
  }, [sessions]);

  const cells = useMemo<DayCell[]>(() => {
    const out: DayCell[] = [];
    // Walk back TOTAL_DAYS - 1 days from today so today is the bottom-right.
    const cursor = new Date(today);
    cursor.setHours(0, 0, 0, 0);
    const start = new Date(cursor);
    start.setDate(start.getDate() - (TOTAL_DAYS - 1));

    // Align grid to start on Monday. Find the Monday before or equal to start.
    const startDow = (start.getDay() + 6) % 7; // 0 = Monday
    start.setDate(start.getDate() - startDow);

    const cell = new Date(start);
    while (cell <= cursor) {
      const iso = toIso(cell);
      out.push({
        iso,
        date: new Date(cell),
        count: counts.get(iso) ?? 0,
      });
      cell.setDate(cell.getDate() + 1);
    }
    return out;
  }, [counts, today]);

  const firstDate = cells[0]?.date ?? today;
  const lastDate = cells[cells.length - 1]?.date ?? today;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => {
          const bg =
            c.count === 0
              ? "var(--line-subtle)"
              : c.count === 1
                ? "var(--ink-tertiary)"
                : "var(--ink-secondary)";
          const opacity = c.count === 0 ? 1 : c.count === 1 ? 0.45 : 0.75;
          const label = c.count
            ? `${c.count} moment${c.count === 1 ? "" : "s"} on ${shortDate(c.date)}`
            : `No moments on ${shortDate(c.date)}`;
          return (
            <div
              key={c.iso}
              aria-label={label}
              title={label}
              className="aspect-square rounded-[3px]"
              style={{ backgroundColor: bg, opacity }}
            />
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-[10px] text-ink-tertiary">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-ink-tertiary">
        <span>{shortDate(firstDate)}</span>
        <span>{shortDate(lastDate)}</span>
      </div>
    </div>
  );
}
