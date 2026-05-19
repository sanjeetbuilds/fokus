"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import ReflectSheet from "@/components/today/ReflectSheet";
import TellMoreNudge from "@/components/today/TellMoreNudge";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { db, getChild, getSessionsByDate } from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type {
  Activity,
  Child,
  ChildMood,
  Session,
  SkillKey,
  TimeAvailable,
} from "@/types";

const TIME: TimeAvailable = "medium";
const MOOD: ChildMood = "normal";

interface CardSpec {
  key: string;
  label: string;
  /** Background style for the colored card. */
  bg: string;
  /** Skill bias so each card surfaces a different kind of activity. */
  preferredSkills?: SkillKey[];
  /** Duration filter (minutes). */
  durationCap?: number;
  fallbackTitle: string;
  fallbackBadge: string;
}

// The 2x2 grid surfaces 4 picks — primary engine pick, plus 3 themed
// alternates filtered by skill bias and duration so each card lands on a
// different kind of moment.
const CARD_SPECS: CardSpec[] = [
  {
    key: "primary",
    label: "Today's Activity",
    bg: "var(--accent)",
    fallbackTitle: "Observation Game",
    fallbackBadge: "10 min · Empathy",
  },
  {
    key: "theme",
    label: "Today's Theme",
    bg: "var(--amber)",
    preferredSkills: ["curiosity", "thinking"],
    fallbackTitle: "Curiosity & Wonder",
    fallbackBadge: "Creative play",
  },
  {
    key: "calm",
    label: "Calm Practice",
    bg: "var(--lav)",
    preferredSkills: ["emotional"],
    durationCap: 10,
    fallbackTitle: "5 min Breathing",
    fallbackBadge: "Mindfulness",
  },
  {
    key: "movement",
    label: "Movement",
    bg: "var(--coral)",
    preferredSkills: ["decisiveness", "creativity"],
    fallbackTitle: "Active Adventure",
    fallbackBadge: "Indoor play",
  },
];

export default function TodayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);

  const [child, setChild] = useState<Child | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reflectActivityId, setReflectActivityId] = useState<string | null>(
    null,
  );
  const [diaryFilter, setDiaryFilter] = useState<
    "today" | "yesterday" | "week" | "month"
  >("today");

  const todayDate = useMemo(() => todayIso(), []);

  const reload = useCallback(async () => {
    if (!activeChildId) {
      setLoaded(true);
      return;
    }
    try {
      const [c, all, todays] = await Promise.all([
        getChild(activeChildId),
        db.sessions.where("childId").equals(activeChildId).toArray(),
        getSessionsByDate(activeChildId, todayDate),
      ]);
      setChild(c ?? null);
      setAllSessions(all);
      setTodaysSessions(todays);
    } catch (err) {
      console.error("[/today] load:", err);
    } finally {
      setLoaded(true);
    }
  }, [activeChildId, todayDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Pick the four cards. The first is the engine's primary pick; the other
  // three filter the library by skill bias / duration and pick the first
  // match that isn't the primary, so the grid shows four distinct moments.
  const cards = useMemo(() => {
    if (!child || todaysSessions.length > 0) {
      return CARD_SPECS.map((spec) => ({ spec, activity: null as Activity | null }));
    }
    const used = new Set<string>();
    const out: Array<{ spec: CardSpec; activity: Activity | null }> = [];

    const tryPrimary = () => {
      try {
        const r = pickActivity(
          child,
          allSessions,
          { timeAvailable: TIME, childMood: MOOD },
          new Date(),
          ACTIVITIES,
        );
        used.add(r.pick.id);
        return r.pick;
      } catch (err) {
        if (err instanceof RestDayError) return null;
        console.error("[/today] pickActivity:", err);
        return null;
      }
    };

    const primary = tryPrimary();
    out.push({ spec: CARD_SPECS[0]!, activity: primary });

    for (let i = 1; i < CARD_SPECS.length; i++) {
      const spec = CARD_SPECS[i]!;
      const pool = ACTIVITIES.filter((a) => {
        if (used.has(a.id)) return false;
        if (spec.preferredSkills && !spec.preferredSkills.includes(a.skill))
          return false;
        if (spec.durationCap && a.duration > spec.durationCap) return false;
        if (a.ageRange[0] > child.age || a.ageRange[1] < child.age)
          return false;
        return true;
      });
      const pick = pool[0] ?? null;
      if (pick) used.add(pick.id);
      out.push({ spec, activity: pick });
    }
    return out;
  }, [allSessions, child, todaysSessions.length]);

  const diaryRows = useMemo(() => {
    if (!child) return [];
    const now = new Date();
    const cutoff = new Date(now);
    if (diaryFilter === "today") cutoff.setHours(0, 0, 0, 0);
    else if (diaryFilter === "yesterday") {
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(0, 0, 0, 0);
    } else if (diaryFilter === "week") cutoff.setDate(cutoff.getDate() - 7);
    else cutoff.setDate(cutoff.getDate() - 30);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    return allSessions
      .filter((s) => s.date >= cutoffIso)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 6);
  }, [allSessions, child, diaryFilter]);

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!activeChildId || !child) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">No active child.</p>
      </main>
    );
  }

  const onCardTap = (activity: Activity | null) => {
    if (!activity) return;
    setReflectActivityId(activity.id);
  };

  const onReflected = async () => {
    setReflectActivityId(null);
    await reload();
    toast("Logged. See you tomorrow.");
  };

  const reflectActivity = reflectActivityId
    ? getActivityById(reflectActivityId)
    : null;

  const needsDeeperProfile =
    child.englishConfidence === "developing" &&
    child.interests.length === 0 &&
    child.struggles.length === 0 &&
    child.engagement.goesDeepOn.length === 0;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-[50px] font-extrabold text-ink"
          style={{
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            paddingTop: 6,
            marginBottom: 22,
          }}
        >
          Today&apos;s
          <br />
          Focus
        </h1>

        {needsDeeperProfile ? (
          <TellMoreNudge childName={child.name} />
        ) : null}

        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 30 }}>
          {cards.map(({ spec, activity }) => (
            <StatCard
              key={spec.key}
              spec={spec}
              activity={activity}
              onTap={() => onCardTap(activity)}
            />
          ))}
        </div>

        <h2
          className="text-[22px] font-bold text-ink"
          style={{ letterSpacing: "-0.02em", marginBottom: 16 }}
        >
          Child&apos;s Diary
        </h2>

        <div className="-mr-6 mb-5 flex gap-2 overflow-x-auto pb-1">
          {(["today", "yesterday", "week", "month"] as const).map((k) => {
            const on = diaryFilter === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setDiaryFilter(k)}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
                style={{
                  background: on ? "var(--ink)" : "var(--bg-elevated)",
                  border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                  color: on ? "#fff" : "var(--ink)",
                }}
              >
                {k[0]!.toUpperCase() + k.slice(1)}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-col">
          {diaryRows.length === 0 ? (
            <li className="rounded-[20px] border-[1.5px] border-dashed border-ink-quaternary p-5">
              <p className="text-[14px] text-ink-secondary" style={{ lineHeight: 1.55 }}>
                Your first logged moment will land here. Tap a card above to
                begin.
              </p>
            </li>
          ) : null}
          {diaryRows.map((s, i) => (
            <DiaryRow
              key={s.id}
              session={s}
              isLast={i === diaryRows.length - 1}
            />
          ))}
        </ul>
      </div>

      <ReflectSheet
        open={reflectActivity !== null}
        activity={reflectActivity ?? null}
        childId={activeChildId}
        childName={child.name}
        onClose={() => setReflectActivityId(null)}
        onLogged={() => void onReflected()}
      />
    </main>
  );
}

// ---------- Stat card (2x2 grid) ----------

function StatCard({
  spec,
  activity,
  onTap,
}: {
  spec: CardSpec;
  activity: Activity | null;
  onTap: () => void;
}) {
  const title = activity ? activity.title : spec.fallbackTitle;
  const badge = activity
    ? `${activity.duration} min · ${badgeWord(activity.skill)}`
    : spec.fallbackBadge;

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex min-h-[152px] flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left transition-transform duration-fast active:scale-[0.99]"
      style={{ background: spec.bg }}
    >
      <div>
        <p
          className="text-[12px] font-semibold"
          style={{ color: "rgba(255,255,255,0.68)", marginBottom: 6 }}
        >
          {spec.label}
        </p>
        <p
          className="font-extrabold text-white"
          style={{
            fontSize: title.length > 18 ? 20 : 22,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          {title}
        </p>
      </div>
      <span
        className="inline-flex items-center gap-1 rounded-[10px] px-2.5 py-[3px] text-[11px] font-bold"
        style={{
          background: "rgba(255,255,255,0.22)",
          color: "rgba(255,255,255,0.92)",
          width: "fit-content",
        }}
      >
        {badge}
      </span>
      {spec.key === "primary" || spec.key === "compass" ? (
        <svg
          aria-hidden
          viewBox="0 0 170 38"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-0 right-0"
          height={38}
          width="100%"
        >
          <path
            d="M0 24C18 10 30 32 48 22C66 12 76 34 96 22C116 10 128 32 148 22C158 16 164 20 170 18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
        </svg>
      ) : null}
    </button>
  );
}

function badgeWord(skill: SkillKey): string {
  switch (skill) {
    case "emotional":
      return "Empathy";
    case "creativity":
      return "Creative";
    case "language":
      return "Confidence";
    case "decisiveness":
      return "Confidence";
    case "curiosity":
      return "Curiosity";
    case "thinking":
      return "Curiosity";
    case "resilience":
      return "Resilience";
    case "observation":
      return "Resilience";
  }
}

// ---------- Diary row ----------

function DiaryRow({ session, isLast }: { session: Session; isLast: boolean }) {
  const activity = getActivityById(session.activityId);
  const created = new Date(session.createdAt);
  const ago = relativeTime(created, new Date());
  const time = created.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const duration = activity ? `${activity.duration} minutes` : "";

  return (
    <li className="flex items-start gap-3.5">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink-quaternary">
          <span
            aria-hidden
            className="grid grid-cols-2 gap-[3px]"
            style={{ width: 9, height: 9 }}
          >
            <span className="block h-[3.5px] w-[3.5px] rounded-sm bg-ink-quaternary" />
            <span className="block h-[3.5px] w-[3.5px] rounded-sm bg-ink-quaternary" />
            <span className="block h-[3.5px] w-[3.5px] rounded-sm bg-ink-quaternary" />
            <span className="block h-[3.5px] w-[3.5px] rounded-sm bg-ink-quaternary" />
          </span>
        </div>
        {!isLast ? <span className="my-1 block h-5 w-[1.5px] bg-line" /> : null}
      </div>
      <div className="flex-1 pb-5">
        <div className="flex justify-between text-[12px] text-ink-tertiary">
          <span>{ago}</span>
          <span>{time}</span>
        </div>
        <p
          className="text-[18px] font-bold text-ink"
          style={{ letterSpacing: "-0.01em" }}
        >
          {activity?.title ?? "Logged moment"}
        </p>
        <p
          className="text-[14px] font-semibold"
          style={{
            color:
              session.response === "skipped"
                ? "var(--ink-tertiary)"
                : "var(--accent)",
            marginTop: 1,
          }}
        >
          {session.response === "skipped" ? "Skipped" : duration}
        </p>
      </div>
    </li>
  );
}

function relativeTime(then: Date, now: Date): string {
  const diff = (now.getTime() - then.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
