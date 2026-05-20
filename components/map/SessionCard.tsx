"use client";

import ActivityIcon from "@/components/activity/ActivityIcon";
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

export default function SessionCard({ session }: SessionCardProps) {
  const activity = getActivityById(session.activityId);
  const skill = activity ? SKILLS[activity.skill] : null;

  return (
    <div className="flex items-start gap-4 rounded-[18px] bg-bg-elevated p-4 shadow-md">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: skill?.color ?? "var(--ink-quaternary)",
          color: "#FFFFFF",
        }}
        aria-hidden
      >
        {activity ? (
          <ActivityIcon
            iconName={activity.iconName}
            skill={activity.skill}
            size={22}
            strokeWidth={1.75}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em]">
          <span style={{ color: skill?.color ?? "var(--ink-secondary)" }}>
            {skill?.label ?? "Unknown skill"}
          </span>
          <span className="text-ink-tertiary">{formatDate(session.date)}</span>
        </div>

        <h3 className="mt-1 text-[17px] font-extrabold leading-[1.3] text-ink">
          {activity?.title ?? session.activityId}
        </h3>

        <p className="mt-1 text-[14px] text-ink-secondary">
          {RESPONSE_LABEL[session.response]}
        </p>

        {session.note ? (
          <p className="mt-2 text-[14px] italic text-ink-secondary">
            &ldquo;{session.note}&rdquo;
          </p>
        ) : null}
      </div>
    </div>
  );
}
