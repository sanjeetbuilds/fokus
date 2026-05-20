"use client";

import SkillIcon from "@/components/SkillIcon";
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
      {activity ? (
        <SkillIcon
          skillId={activity.skill}
          size="sm"
          iconName={activity.iconName}
        />
      ) : (
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "var(--ink-quaternary)",
            flexShrink: 0,
          }}
        />
      )}

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
