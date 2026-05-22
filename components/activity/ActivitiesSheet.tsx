"use client";

import { X } from "lucide-react";
import { useMemo } from "react";

import ActivityRow from "@/components/activity/ActivityRow";
import SkillIcon from "@/components/SkillIcon";
import Sheet from "@/components/ui/Sheet";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import type { ActivityLogRow } from "@/lib/supabase/queries";
import type { Activity, SkillKey } from "@/types";

export interface ActivitiesSheetProps {
  open: boolean;
  onClose: () => void;
  /** Selected skill. When null, the sheet renders nothing (Sheet
   *  itself still animates closed on transition out). */
  skillId: SkillKey | null;
  /** All activity_log rows for the signed-in parent. Used to compute
   *  tried-vs-untried + per-activity counts in this sheet. */
  activityLog: ActivityLogRow[];
  /** Where the sheet was opened from. Drives the ?from= query param
   *  on the per-row Link so the activity detail's back button lands
   *  on the right screen. */
  fromContext: "library" | "track";
}

/**
 * Bottom-sheet view of all activities for one skill. Slides up over
 * the parent screen (Library tile grid or Track skill tiles).
 *
 *   ┌─ skill header ────────────────────────────┐
 *   │ [md SkillIcon]  Curiosity         [ × ]   │
 *   │                 3 of 8 tried              │
 *   ├───────────────────────────────────────────┤
 *   │ tried activity row (newest first)         │
 *   │ tried activity row                        │
 *   ├──────── NOT YET TRIED ────────────────────┤
 *   │ untried activity row                      │
 *   │ untried activity row                      │
 *   └───────────────────────────────────────────┘
 *
 * The "Not yet tried" divider renders only when both groups have at
 * least one row. Tap on a row navigates to /activity/[id]?from=<ctx>
 * and closes the sheet.
 */
export default function ActivitiesSheet({
  open,
  onClose,
  skillId,
  activityLog,
  fromContext,
}: ActivitiesSheetProps) {
  const data = useMemo(() => {
    if (!skillId) return null;
    const skillActivities = ACTIVITIES.filter((a) => a.skill === skillId);

    const statsById = new Map<
      string,
      { count: number; lastDate: Date }
    >();
    for (const row of activityLog) {
      if (getActivityById(row.activity_id)?.skill !== skillId) continue;
      const d = new Date(row.completed_at);
      const existing = statsById.get(row.activity_id);
      if (existing) {
        existing.count += 1;
        if (d > existing.lastDate) existing.lastDate = d;
      } else {
        statsById.set(row.activity_id, { count: 1, lastDate: d });
      }
    }

    const tried = skillActivities
      .filter((a) => statsById.has(a.id))
      .sort((a, b) => {
        const da = statsById.get(a.id)!.lastDate.getTime();
        const db = statsById.get(b.id)!.lastDate.getTime();
        return db - da;
      });
    const untried = skillActivities.filter((a) => !statsById.has(a.id));

    return { skillActivities, statsById, tried, untried };
  }, [skillId, activityLog]);

  return (
    <Sheet open={open} onClose={onClose}>
      {skillId && data ? (
        <ActivitiesSheetBody
          skillId={skillId}
          tried={data.tried}
          untried={data.untried}
          statsById={data.statsById}
          fromContext={fromContext}
          onClose={onClose}
        />
      ) : null}
    </Sheet>
  );
}

function ActivitiesSheetBody({
  skillId,
  tried,
  untried,
  statsById,
  fromContext,
  onClose,
}: {
  skillId: SkillKey;
  tried: Activity[];
  untried: Activity[];
  statsById: Map<string, { count: number; lastDate: Date }>;
  fromContext: "library" | "track";
  onClose: () => void;
}) {
  const skill = SKILLS[skillId];
  const total = tried.length + untried.length;
  const triedCount = tried.length;
  const countLine =
    triedCount > 0
      ? `${triedCount} of ${total} tried`
      : `${total} activities`;
  const hasDivider = tried.length > 0 && untried.length > 0;

  return (
    <>
      {/* Skill header; flat, on white. No colored strip behind it. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <SkillIcon skillId={skillId} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#252630",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {skill.label}
          </h2>
          <p
            style={{
              marginTop: 2,
              fontSize: 13,
              color: "#8E8D9B",
              lineHeight: 1.4,
            }}
          >
            {countLine}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "transparent",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8E8D9B",
            flexShrink: 0,
          }}
          className="transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {/* Activity list. Each row is the new shared ActivityRow card
          (white, Level 1 shadow). We use gap between rows instead of
          dividers since each card carries its own elevation. */}
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {tried.map((a) => {
          const stats = statsById.get(a.id)!;
          return (
            <li key={a.id}>
              <ActivityRow
                activity={a}
                variant="tried"
                tried={{
                  count: stats.count,
                  lastDate: stats.lastDate.toISOString(),
                }}
                fromContext={fromContext}
                onClick={onClose}
              />
            </li>
          );
        })}
        {hasDivider ? <NotYetTriedDivider /> : null}
        {untried.map((a) => (
          <li key={a.id}>
            <ActivityRow
              activity={a}
              variant="default"
              fromContext={fromContext}
              onClick={onClose}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function NotYetTriedDivider() {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 0",
      }}
    >
      <span style={{ flex: 1, height: 0.5, background: "#E5E3DA" }} />
      <span
        style={{
          padding: "0 12px",
          fontSize: 10,
          fontWeight: 600,
          color: "#C2C0CB",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        Not yet tried
      </span>
      <span style={{ flex: 1, height: 0.5, background: "#E5E3DA" }} />
    </li>
  );
}
