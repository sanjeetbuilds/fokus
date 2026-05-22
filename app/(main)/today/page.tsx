"use client";

import {
  ArrowRight,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import AppHeader from "@/components/layout/AppHeader";
import Blobs from "@/components/shared/Blobs";
import WelcomeModal from "@/components/today/WelcomeModal";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import type { ActivityLogRow, ChildRow } from "@/lib/supabase/queries";
import {
  otherIdeasForToday,
  pickRandomSwap,
  todaysHeroActivity,
  warnMissingHooks,
} from "@/lib/today-pick";
import { useActivityLog } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import { ageFromDob } from "@/lib/utils/dates";
import type { Activity, SkillKey } from "@/types";

const SWAP_KEY = "fokus_today";

interface SwapState {
  date: string; // YYYY-MM-DD
  activityId: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSwapState(): SwapState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SWAP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SwapState>;
    if (!parsed.date || !parsed.activityId) return null;
    return { date: parsed.date, activityId: parsed.activityId };
  } catch {
    return null;
  }
}

function writeSwapState(state: SwapState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SWAP_KEY, JSON.stringify(state));
  } catch {
    /* private browsing; silently ignore */
  }
}

// One-time sanity check for any activity shipped without a hook.
warnMissingHooks(ACTIVITIES);

/**
 * Today screen; daily briefing.
 *
 *   AppHeader (Fokus wordmark)
 *   Child row (avatar + name + age/pronouns, bare)
 *   "Today's focus" eyebrow
 *   Hero card (skill-color background, swap, start)
 *   "Other ideas today" eyebrow + 2-tile grid
 *   [Last session block]  (only if activity_log non-empty)
 *   Footer tagline
 *   [Browse all 64 ideas link]  (first-time only)
 *
 * The daily pick is fully date-seeded (no personalisation, no
 * measurement of the child). Swap state lives in localStorage and
 * resets at midnight when the date changes.
 */
export default function TodayPage() {
  const { child: childRow, loading: childLoading } = useChild();
  const { rows: activityLogRows, loading: activityLogLoading } =
    useActivityLog();

  const todayDate = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => todayIsoDate(), []);

  // Default hero; same on any device given the date.
  const defaultHero = useMemo(
    () => todaysHeroActivity(todayDate, ACTIVITIES),
    [todayDate],
  );

  const triedIds = useMemo(
    () => new Set(activityLogRows.map((r) => r.activity_id)),
    [activityLogRows],
  );

  // Current hero activity id. `null` until we've hydrated from
  // localStorage so the first render matches the server's default
  // pick (or "Loading…" if everything else hasn't loaded yet).
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(
    null,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readSwapState();
    if (stored && stored.date === todayIso) {
      const exists = getActivityById(stored.activityId);
      setCurrentActivityId(
        exists ? stored.activityId : defaultHero.id,
      );
    } else {
      setCurrentActivityId(defaultHero.id);
    }
    setHydrated(true);
  }, [defaultHero, todayIso]);

  const currentActivity: Activity = useMemo(
    () =>
      (currentActivityId
        ? getActivityById(currentActivityId)
        : null) ?? defaultHero,
    [currentActivityId, defaultHero],
  );

  const onSwap = useCallback(() => {
    const next = pickRandomSwap(currentActivity, ACTIVITIES, triedIds);
    setCurrentActivityId(next.id);
    writeSwapState({ date: todayIso, activityId: next.id });
  }, [currentActivity, todayIso, triedIds]);

  const otherIdeas = useMemo(
    () => otherIdeasForToday(todayDate, currentActivity, ACTIVITIES, triedIds),
    [currentActivity, todayDate, triedIds],
  );

  const lastLogged = activityLogRows[0] ?? null;

  const loaded = !childLoading && !activityLogLoading && hydrated;
  const isFirstTime = activityLogRows.length === 0;

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!childRow) {
    // OnboardingGate will redirect; this guards the brief in-between frame.
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">Setting up…</p>
      </main>
    );
  }

  const childName = childRow.name;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-5 pt-2">
        <ChildRow child={childRow} />

        <EyebrowLabel style={{ marginTop: 12 }}>Today&apos;s focus</EyebrowLabel>

        <div style={{ marginTop: 8 }}>
          <HeroCard
            activity={currentActivity}
            isFirstTime={isFirstTime}
            onSwap={onSwap}
          />
        </div>

        <EyebrowLabel style={{ marginTop: 24 }}>
          Other ideas today
        </EyebrowLabel>

        <div
          style={{
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {otherIdeas.map((a) => (
            <OtherIdeaTile key={a.id} activity={a} />
          ))}
        </div>

        {lastLogged ? (
          <div style={{ marginTop: 16 }}>
            <LastSessionBlock row={lastLogged} now={todayDate} />
          </div>
        ) : null}

        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 300,
            color: "#8E8D9B",
            lineHeight: 1.5,
            marginBottom: 32,
          }}
        >
          One thing a day, with {childName}.
        </p>

        {isFirstTime ? (
          <p
            style={{
              marginBottom: 32,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 500,
              color: "#8E8D9B",
              lineHeight: 1.5,
            }}
          >
            Browse all {ACTIVITIES.length} ideas in the{" "}
            <Link
              href="/library"
              style={{ color: "#252630", fontWeight: 700 }}
            >
              Library
            </Link>{" "}
            →
          </p>
        ) : null}
      </div>

      <WelcomeModal
        childName={childName}
        parentId={null}
        alreadySeen={false}
      />
    </main>
  );
}

// ============================================================
// Child row
// ============================================================

function ChildRow({ child }: { child: ChildRow }) {
  const info = ageFromDob(child.dob);
  const age = info?.years ?? 0;
  const initial = child.name.trim().charAt(0).toUpperCase() || "•";
  const pronouns = pronounsLabel(child.pronouns);

  return (
    <div
      className="flex items-center gap-3"
      style={{ marginTop: 16, marginBottom: 4 }}
    >
      <div
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: child.photo_url ? "transparent" : "#252630",
          backgroundImage: child.photo_url
            ? `url(${child.photo_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {child.photo_url ? null : initial}
      </div>
      <div className="min-w-0 flex-1">
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#252630",
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
          }}
        >
          {child.name}
        </p>
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          Age {age} · {pronouns}
        </p>
      </div>
    </div>
  );
}

function pronounsLabel(p: "he" | "she" | "they"): string {
  switch (p) {
    case "he":
      return "he/him";
    case "she":
      return "she/her";
    case "they":
      return "they/them";
  }
}

// ============================================================
// Eyebrow label
// ============================================================

function EyebrowLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#8E8D9B",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

// ============================================================
// Hero card
// ============================================================

function HeroCard({
  activity,
  isFirstTime,
  onSwap,
}: {
  activity: Activity;
  isFirstTime: boolean;
  onSwap: () => void;
}) {
  const skill = SKILLS[activity.skill];
  const [minAge, maxAge] = activity.ageRange;
  const taglineText =
    activity.hook ||
    activity.description ||
    firstSentence(activity.howTo) ||
    "";

  return (
    <article
      style={{
        background: skill.color,
        borderRadius: 24,
        padding: 18,
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <Blobs variant="hero" />
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Top row: skill chip + swap button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(255,255,255,0.28)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
            }}
          >
            <ActivityIcon
              iconName={activity.iconName}
              skill={activity.skill}
              size={16}
              strokeWidth={2.25}
            />
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.02em",
            }}
          >
            {skill.label}
          </span>
        </div>
        <span aria-hidden style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onSwap}
          aria-label="Swap activity"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(255,255,255,0.22)",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.85)",
            cursor: "pointer",
          }}
          className="transition-opacity active:opacity-70"
        >
          <RefreshCw size={15} strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      {/* Title */}
      <h2
        style={{
          marginTop: 14,
          fontSize: 26,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        {activity.title}
      </h2>

      {/* Tagline */}
      <p
        style={{
          marginTop: 6,
          fontSize: 13,
          fontWeight: 400,
          color: "rgba(255,255,255,0.78)",
          lineHeight: 1.45,
        }}
      >
        {taglineText}
      </p>

      {/* First-time context line; sits between tagline and meta pills */}
      {isFirstTime ? (
        <p
          style={{
            marginTop: 12,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.5,
          }}
        >
          A good place to start. {skill.firstTimeNote}
        </p>
      ) : null}

      {/* Meta pills */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
        }}
      >
        <MetaPill icon={<Clock size={11} strokeWidth={2.25} aria-hidden />}>
          {activity.duration} min
        </MetaPill>
        <MetaPill
          icon={<Sparkles size={11} strokeWidth={2.25} aria-hidden />}
        >
          Ages {minAge} to {maxAge}
        </MetaPill>
      </div>

      {/* What this builds; 2-line clamp of hiddenCurriculum */}
      <div
        style={{
          marginTop: 14,
          background: "rgba(0,0,0,0.12)",
          borderRadius: 13,
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          What this builds
        </p>
        <p
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {activity.hiddenCurriculum}
        </p>
      </div>

      {/* Start CTA; pill, on-skill, inline-flex (not full width) */}
      <Link
        href={`/activity/${activity.id}?from=today`}
        style={{
          marginTop: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(0,0,0,0.18)",
          color: "#FFFFFF",
          padding: "11px 20px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          letterSpacing: "-0.005em",
        }}
        className="transition-opacity active:opacity-80"
      >
        Start
        <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
      </Link>
      </div>
    </article>
  );
}

function MetaPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(0,0,0,0.12)",
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,0.9)",
      }}
    >
      {icon}
      {children}
    </span>
  );
}

// ============================================================
// Other-ideas tile
// ============================================================

function OtherIdeaTile({ activity }: { activity: Activity }) {
  const skill = SKILLS[activity.skill];
  const taglineText =
    activity.hook ||
    activity.description ||
    firstSentence(activity.howTo) ||
    "";

  return (
    <Link
      href={`/activity/${activity.id}?from=today`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        background: skill.bg,
        borderRadius: 18,
        padding: 14,
        textDecoration: "none",
        color: "inherit",
        boxShadow: "var(--shadow-level-1)",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
      className="transition-opacity active:opacity-80"
    >
      <Blobs variant="tile" color={skill.blob} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: skill.blob,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: skill.iconColor,
        }}
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={18}
          strokeWidth={2.25}
          style={{ color: skill.iconColor }}
        />
      </span>
      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 700,
          color: skill.iconColor,
          lineHeight: 1.2,
          letterSpacing: "-0.005em",
        }}
      >
        {activity.title}
      </p>
      <p
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 400,
          color: skill.mid,
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {taglineText}
      </p>
      <span
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#F0F0EE",
          borderRadius: 8,
          padding: "3px 8px",
          fontSize: 10,
          fontWeight: 600,
          color: "#8E8D9B",
          alignSelf: "flex-start",
        }}
      >
        <Clock size={10} strokeWidth={2.25} aria-hidden />
        {activity.duration} min
      </span>
      </div>
    </Link>
  );
}

// ============================================================
// Last session block
// ============================================================

function LastSessionBlock({
  row,
  now,
}: {
  row: ActivityLogRow;
  now: Date;
}) {
  const activity = useMemo(
    () => getActivityById(row.activity_id),
    [row.activity_id],
  );
  if (!activity) return null;

  const skill = SKILLS[activity.skill];
  const relTime = relativeDayLabel(row.completed_at, now);

  return (
    <section
      style={{
        background: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        boxShadow: "var(--shadow-level-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#8E8D9B",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Last session
        </p>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#5DC87A",
          }}
        >
          {relTime}
        </p>
      </div>
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: skill.bg,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: skill.color,
            flexShrink: 0,
          }}
        >
          <ActivityIcon
            iconName={activity.iconName}
            skill={activity.skill}
            size={18}
            strokeWidth={2.25}
            style={{ color: skill.color }}
          />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#252630",
              letterSpacing: "-0.005em",
              lineHeight: 1.25,
            }}
          >
            {activity.title}
          </p>
          <p
            style={{
              marginTop: 2,
              fontSize: 12,
              fontWeight: 400,
              color: "#8E8D9B",
              lineHeight: 1.4,
            }}
          >
            {skill.label} · {activity.duration} min
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Helpers
// ============================================================

function firstSentence(s: string): string {
  if (!s) return "";
  const m = s.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : s;
}

function relativeDayLabel(iso: string, now: Date): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const startOfThen = Date.UTC(
    then.getUTCFullYear(),
    then.getUTCMonth(),
    then.getUTCDate(),
  );
  const startOfNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const days = Math.floor((startOfNow - startOfThen) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

// Re-export to keep the import surface stable for any future caller.
export type { SkillKey };
