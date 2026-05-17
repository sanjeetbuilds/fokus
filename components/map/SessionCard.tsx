"use client";

import Card from "@/components/ui/Card";
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
 * Recent-moments card on the Map and Skill Detail pages. Reads activity
 * metadata from the static library; if the activity id is unknown (stale
 * record), falls back to rendering the id.
 */
export default function SessionCard({ session }: SessionCardProps) {
  const activity = getActivityById(session.activityId);
  const skill = activity ? SKILLS[activity.skill] : null;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-caption uppercase tracking-[0.1em]">
        <div className="flex items-center gap-2">
          {skill ? (
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: skill.color }}
            />
          ) : null}
          <span style={{ color: skill?.color ?? "var(--ink-secondary)" }}>
            {skill?.label ?? "Unknown skill"}
          </span>
        </div>
        <span className="text-ink-tertiary">
          {formatDate(session.date)}
        </span>
      </div>

      <h3 className="text-title-3 text-ink">
        {activity?.title ?? session.activityId}
      </h3>

      <p className="text-footnote text-ink-secondary">
        {RESPONSE_LABEL[session.response]}
      </p>

      {session.note ? (
        <blockquote className="mt-1 border-l-2 border-line pl-3 text-body italic text-ink-secondary">
          {session.note}
        </blockquote>
      ) : null}
    </Card>
  );
}
