"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import TablerIcon from "@/components/activity/TablerIcon";
import { SKILLS } from "@/lib/content/skills";
import type { Activity, SkillKey } from "@/types";

export type ActivityRowVariant = "default" | "tried";

export interface ActivityRowTriedMeta {
  /** Times the parent has completed this activity. */
  count: number;
  /** Most recent completion timestamp (ISO string). */
  lastDate: string;
}

export interface ActivityRowProps {
  activity: Activity;
  /**
   * 'default' renders the activity hook on the subtitle line.
   * 'tried' replaces the hook with "Done N time(s) · last dd MMM"
   * in green. The caller picks the variant based on activity_log.
   */
  variant: ActivityRowVariant;
  /** Required when variant === 'tried'. Ignored otherwise. */
  tried?: ActivityRowTriedMeta;
  /** Where the tap-through navigates. Defaults to /activity/[id]. */
  href?: string;
  /** Optional ?from= query param for the activity detail back button. */
  fromContext?: "library" | "track" | "today";
  onClick?: () => void;
}

/**
 * Single source of truth for the activity row used in:
 *   - Library bottom sheet (per-skill list, default + tried variants)
 *   - Track recent list (tried variant only)
 *
 * Spec: white card, 18 radius, Level 1 shadow, 48 squircle in the
 * skill's bg + blob, Tabler activity icon in skill.iconColor, title
 * + hook/tried-meta subtitle, skill pill + duration footer, faint
 * chevron capsule on the right. Whole row is the tap target.
 */
export default function ActivityRow({
  activity,
  variant,
  tried,
  href,
  fromContext,
  onClick,
}: ActivityRowProps) {
  const skill = SKILLS[activity.skill];
  const finalHref =
    href ??
    `/activity/${activity.id}${fromContext ? `?from=${fromContext}` : ""}`;

  return (
    <Link
      href={finalHref}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 14px",
        background: "#FFFFFF",
        borderRadius: 18,
        boxShadow: "var(--shadow-level-1)",
        textDecoration: "none",
        color: "inherit",
      }}
      className="transition-opacity active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <IconSquircle skillKey={activity.skill} iconName={activity.icon} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#252630",
            lineHeight: 1.2,
            marginBottom: 2,
            letterSpacing: "-0.005em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activity.title}
        </p>
        {variant === "tried" && tried ? (
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#5DC87A",
              lineHeight: 1.3,
              marginBottom: 6,
            }}
          >
            {formatTriedMeta(tried)}
          </p>
        ) : (
          <p
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: "#8E8D9B",
              lineHeight: 1.3,
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activity.hook}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: skill.bg,
              color: skill.mid,
              borderRadius: 999,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {shortSkillLabel(activity.skill)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8E8D9B",
            }}
          >
            {activity.duration} min
          </span>
        </div>
      </div>

      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#F5F5F3",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C2C0CB",
          flexShrink: 0,
        }}
      >
        <ChevronRight size={12} strokeWidth={2.25} aria-hidden />
      </span>
    </Link>
  );
}

// ============================================================
// Internal: 48x48 skill-tinted squircle with a corner blob and
// the activity's Tabler icon in the skill's icon color.
// ============================================================

function IconSquircle({
  skillKey,
  iconName,
}: {
  skillKey: SkillKey;
  iconName: string;
}) {
  const skill = SKILLS[skillKey];
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        width: 48,
        height: 48,
        borderRadius: 13,
        background: skill.bg,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: 32,
          height: 32,
          borderRadius: "50%",
          right: -8,
          bottom: -8,
          background: skill.blob,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: skill.iconColor,
          zIndex: 1,
        }}
      >
        <TablerIcon
          name={iconName}
          size={22}
          strokeWidth={2}
          style={{ color: skill.iconColor }}
        />
      </span>
    </span>
  );
}

// ============================================================
// Helpers
// ============================================================

const SHORT_LABEL: Record<SkillKey, string> = {
  curiosity: "Curiosity",
  language: "Language",
  emotional: "Emotional",
  perspective: "Perspective",
  thinking: "Thinking",
  resilience: "Resilience",
  creativity: "Creativity",
  observation: "Observation",
  decisiveness: "Decisiveness",
};

function shortSkillLabel(skill: SkillKey): string {
  return SHORT_LABEL[skill];
}

function formatTriedMeta(t: ActivityRowTriedMeta): string {
  const occurrences = t.count === 1 ? "once" : `${t.count} times`;
  const last = new Date(t.lastDate);
  const lastLabel = Number.isNaN(last.getTime())
    ? ""
    : last.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  if (!lastLabel) return `Done ${occurrences}`;
  return `Done ${occurrences} · last ${lastLabel}`;
}
