"use client";

import { getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import { formatDate } from "@/lib/utils/dates";
import type { Session, SessionResponse } from "@/types";

const RESPONSE_LABEL: Record<SessionResponse, string> = {
  loved: "loved",
  engaged: "engaged",
  neutral: "neutral",
  struggled: "struggled",
  frustrated: "frustrated",
  skipped: "skipped",
};

export interface SessionCardProps {
  session: Session;
}

/**
 * Recent-moment card with per-skill chromatic tint, matching ActivityCard.
 * If the activityId is unknown (stale record), fall back to a neutral card
 * with the raw id rendered as the title.
 */
export default function SessionCard({ session }: SessionCardProps) {
  const activity = getActivityById(session.activityId);
  const skill = activity ? SKILLS[activity.skill] : null;

  const color = skill?.color ?? "var(--line)";
  const bg = skill ? `${skill.color}14` : "var(--bg-elevated)";
  const border = skill ? `${skill.color}33` : "var(--line)";

  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-4"
      style={{
        backgroundColor: bg,
        boxShadow: `inset 0 0 0 1px ${border}`,
      }}
    >
      <div className="flex items-center justify-between gap-3 text-caption uppercase tracking-[0.1em]">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="font-semibold"
            style={{ color: skill?.color ?? "var(--ink-secondary)" }}
          >
            {skill?.label ?? "Unknown skill"}
          </span>
        </div>
        <span className="text-ink-tertiary">{formatDate(session.date)}</span>
      </div>

      <h3 className="text-[18px] font-semibold leading-[1.3] text-ink">
        {activity?.title ?? session.activityId}
      </h3>

      <p className="text-footnote text-ink-secondary">
        {RESPONSE_LABEL[session.response]}
      </p>

      {session.note ? (
        <blockquote
          className="mt-1 border-l-2 pl-3 text-body italic text-ink-secondary"
          style={{ borderColor: color }}
        >
          {session.note}
        </blockquote>
      ) : null}
    </div>
  );
}
