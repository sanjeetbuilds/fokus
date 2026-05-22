"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
      {/* Skill header — flat, on white. No colored strip behind it. */}
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

      {/* Activity list */}
      <ul style={{ display: "flex", flexDirection: "column" }}>
        {tried.map((a, i) => (
          <li
            key={a.id}
            style={{
              borderBottom:
                i === tried.length - 1 && !hasDivider
                  ? undefined
                  : "1px solid #E5E3DA",
            }}
          >
            <ActivityRow
              activity={a}
              stats={statsById.get(a.id) ?? null}
              fromContext={fromContext}
              onClick={onClose}
            />
          </li>
        ))}
        {hasDivider ? <NotYetTriedDivider /> : null}
        {untried.map((a, i) => (
          <li
            key={a.id}
            style={{
              borderBottom:
                i === untried.length - 1 ? undefined : "1px solid #E5E3DA",
            }}
          >
            <ActivityRow
              activity={a}
              stats={null}
              fromContext={fromContext}
              onClick={onClose}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function ActivityRow({
  activity,
  stats,
  fromContext,
  onClick,
}: {
  activity: Activity;
  stats: { count: number; lastDate: Date } | null;
  fromContext: "library" | "track";
  onClick: () => void;
}) {
  const isTried = stats !== null;
  const triedMeta = stats
    ? `Done ${stats.count} time${stats.count === 1 ? "" : "s"} · last ${formatDate(stats.lastDate)}`
    : "";

  return (
    <Link
      href={`/activity/${activity.id}?from=${fromContext}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 0",
        textDecoration: "none",
      }}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
    >
      <SkillIcon
        skillId={activity.skill}
        size="xs"
        iconName={activity.iconName}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#252630",
            letterSpacing: "-0.005em",
            lineHeight: 1.3,
          }}
        >
          {activity.title}
        </p>
        {isTried ? (
          <p
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 500,
              color: "#5DC87A",
              lineHeight: 1.4,
            }}
          >
            {triedMeta}
          </p>
        ) : (
          <p
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 400,
              color: "#8E8D9B",
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activity.hook}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 12,
          color: "#8E8D9B",
          flexShrink: 0,
        }}
      >
        {activity.duration} min
      </span>
    </Link>
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

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
