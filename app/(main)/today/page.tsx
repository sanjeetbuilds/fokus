"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import LogSheet from "@/components/today/LogSheet";
import Wordmark from "@/components/shared/Wordmark";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import { createSession, db, getChild, getSessionsByDate } from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type {
  Activity,
  ActivityDifficulty,
  Child,
  ChildMood,
  Session,
  TimeAvailable,
} from "@/types";

const TIME_CHIPS: { value: TimeAvailable; label: string }[] = [
  { value: "short", label: "5 min" },
  { value: "medium", label: "15 min" },
  { value: "long", label: "25 min" },
];

const MOOD_CHIPS: { value: ChildMood; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

const DIFFICULTY_LABEL: Record<ActivityDifficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

export default function TodayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setLastPickContext = useAppStore((s) => s.setLastPickContext);

  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [time, setTime] = useState<TimeAvailable>("medium");
  const [mood, setMood] = useState<ChildMood>("normal");
  const [pickedActivityId, setPickedActivityId] = useState<string | null>(null);
  const [restDay, setRestDay] = useState(false);

  const [showLogSheet, setShowLogSheet] = useState(false);
  // When the parent already finished today but taps "One more moment", we
  // override the done-state and show the chips + card again.
  const [showOverride, setShowOverride] = useState(false);
  const [skipBusy, setSkipBusy] = useState(false);

  const todayDate = useMemo(() => todayIso(), []);

  const reloadSessions = useCallback(async () => {
    if (!activeChildId) return;
    const [allSessions, todaysRows] = await Promise.all([
      db.sessions.where("childId").equals(activeChildId).toArray(),
      getSessionsByDate(activeChildId, todayDate),
    ]);
    setSessions(allSessions);
    setTodaysSessions(todaysRows);
  }, [activeChildId, todayDate]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) {
      setLoaded(true);
      return;
    }
    void (async () => {
      try {
        const [c, allSessions, todaysRows] = await Promise.all([
          getChild(activeChildId),
          db.sessions.where("childId").equals(activeChildId).toArray(),
          getSessionsByDate(activeChildId, todayDate),
        ]);
        if (cancelled) return;
        setChild(c ?? null);
        setSessions(allSessions);
        setTodaysSessions(todaysRows);
      } catch (err) {
        console.error("[/today] load:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId, todayDate]);

  // Whether to render the active picker. Default: show picker if no sessions
  // logged today. Override: parent tapped "One more moment".
  const showingPicker =
    todaysSessions.length === 0 || showOverride;

  // Re-pick whenever child/sessions/time/mood change AND we're showing the
  // picker. The engine is pure, so this is idempotent given inputs.
  useEffect(() => {
    if (!showingPicker || !child) return;
    try {
      const result = pickActivity(
        child,
        sessions,
        { timeAvailable: time, childMood: mood },
        new Date(),
        ACTIVITIES,
      );
      setPickedActivityId(result.pick.id);
      setRestDay(false);
      setLastPickContext({
        childId: child.id,
        activityId: result.pick.id,
        time,
        mood,
        date: todayDate,
      });
    } catch (err) {
      if (err instanceof RestDayError) {
        setPickedActivityId(null);
        setRestDay(true);
      } else {
        console.error("[/today] pickActivity:", err);
        toast("Couldn't pick. See console.", { tone: "danger" });
      }
    }
    // intentionally exclude setLastPickContext from deps; it's stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, sessions, time, mood, todayDate, showingPicker]);

  const pickedActivity = useMemo(
    () => (pickedActivityId ? getActivityById(pickedActivityId) : null),
    [pickedActivityId],
  );

  const onMoreDetail = useCallback(() => {
    if (!pickedActivity) return;
    const params = new URLSearchParams({ time, mood, from: "today" });
    router.push(`/activity/${pickedActivity.id}?${params.toString()}`);
  }, [pickedActivity, mood, router, time]);

  const onDidIt = useCallback(() => {
    if (!pickedActivity) return;
    setShowLogSheet(true);
  }, [pickedActivity]);

  const onSkipToday = useCallback(async () => {
    if (!pickedActivity || !activeChildId || skipBusy) return;
    setSkipBusy(true);
    try {
      await createSession({
        childId: activeChildId,
        activityId: pickedActivity.id,
        date: todayDate,
        response: "skipped",
        context: { timeAvailable: time, childMood: mood },
      });
      await reloadSessions();
      setShowOverride(false);
    } catch (err) {
      console.error("[/today] skip:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
    } finally {
      setSkipBusy(false);
    }
  }, [activeChildId, mood, pickedActivity, reloadSessions, skipBusy, time, todayDate, toast]);

  const onLogged = useCallback(async () => {
    setShowLogSheet(false);
    setShowOverride(false);
    await reloadSessions();
  }, [reloadSessions]);

  const onAnotherMoment = useCallback(() => {
    setShowOverride(true);
  }, []);

  // ---------- render ----------

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!activeChildId) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">No active child.</p>
        <p className="mt-2 text-footnote text-ink-tertiary">
          The gate should redirect. Try /profile to switch children.
        </p>
      </main>
    );
  }

  const childName = child?.name ?? "your child";
  const headerSub = "Whenever feels right today.";
  // First-time hint: nothing ever logged, never finished today.
  const isFirstTime = sessions.length === 0 && todaysSessions.length === 0;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Wordmark size="sm" />
        <button
          type="button"
          aria-label="Menu"
          onClick={() => router.push("/profile")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      {/* Header: date, title, subhead */}
      <header className="mt-6">
        <p className="text-footnote text-ink-tertiary">
          {longDate(new Date())}
        </p>
        <h1
          className="mt-1 font-display text-[40px] font-semibold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.05 }}
        >
          Tonight with {childName}.
        </h1>
        {showingPicker ? (
          <p className="mt-2 text-footnote text-ink-tertiary">{headerSub}</p>
        ) : null}
      </header>

      <AnimatePresence mode="wait">
        {restDay ? (
          <motion.section
            key="rest"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-10 rounded-lg border border-line bg-bg-elevated p-6"
          >
            <p className="text-body-large text-ink">
              Take today off. Just be with{" "}
              <span className="font-medium">{childName}</span>. The work is the
              relationship.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-5"
              onClick={() => setRestDay(false)}
            >
              Got it
            </Button>
          </motion.section>
        ) : showingPicker ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* Time chips */}
            <section className="mt-8">
              <p className="text-caption uppercase tracking-[0.1em] font-medium text-ink-tertiary">
                Time you have
              </p>
              <div className="mt-2 flex gap-2">
                {TIME_CHIPS.map((c) => (
                  <Chip
                    key={c.value}
                    size="sm"
                    selected={c.value === time}
                    onClick={() => setTime(c.value)}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </section>

            {/* Mood chips */}
            <section className="mt-5">
              <p className="text-caption uppercase tracking-[0.1em] font-medium text-ink-tertiary">
                {child?.name ? `${child.name}'s energy` : "Their energy"}
              </p>
              <div className="mt-2 flex gap-2">
                {MOOD_CHIPS.map((c) => (
                  <Chip
                    key={c.value}
                    size="sm"
                    selected={c.value === mood}
                    onClick={() => setMood(c.value)}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </section>

            {isFirstTime ? (
              <p className="mt-6 text-footnote text-ink-tertiary">
                Your first moment is below. Tap &ldquo;Did it&rdquo; when
                you&apos;ve finished.
              </p>
            ) : null}

            {/* Activity card */}
            <AnimatePresence mode="wait">
              {pickedActivity ? (
                <motion.div
                  key={pickedActivity.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5"
                >
                  <ActivityCardInline
                    activity={pickedActivity}
                    onMore={onMoreDetail}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => void onSkipToday()}
                disabled={!pickedActivity || skipBusy}
              >
                Skip today
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={onDidIt}
                disabled={!pickedActivity}
              >
                Did it
              </Button>
            </div>
          </motion.div>
        ) : (
          <DoneForToday
            key="done"
            childName={childName}
            todaysSessions={todaysSessions}
            onAnother={onAnotherMoment}
            onLookBack={() => router.push("/map")}
            onLibrary={() => router.push("/library")}
          />
        )}
      </AnimatePresence>

      <LogSheet
        open={showLogSheet}
        onClose={() => setShowLogSheet(false)}
        onLogged={() => void onLogged()}
        activity={pickedActivity ?? null}
        childId={activeChildId}
        time={time}
        mood={mood}
      />
    </main>
  );
}

// ---------- Done-for-today state ----------

function DoneForToday({
  childName,
  todaysSessions,
  onAnother,
  onLookBack,
  onLibrary,
}: {
  childName: string;
  todaysSessions: Session[];
  onAnother: () => void;
  onLookBack: () => void;
  onLibrary: () => void;
}) {
  const lastLogged = todaysSessions[todaysSessions.length - 1];
  const lastActivity = lastLogged ? getActivityById(lastLogged.activityId) : null;
  const wasSkipped = lastLogged?.response === "skipped";

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="mt-16 flex flex-col items-center text-center"
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full bg-ink"
      />
      <p className="mt-6 text-body-large text-ink">
        {wasSkipped ? "Marked as skipped." : "Done for today."}
      </p>
      {lastActivity ? (
        <p className="mt-2 text-footnote text-ink-tertiary">
          {wasSkipped
            ? `Skipped ${lastActivity.title}.`
            : `You and ${childName} did ${lastActivity.title}.`}
        </p>
      ) : null}
      <p className="mt-6 text-footnote text-ink-tertiary">See you tomorrow.</p>

      <div className="mt-10 flex gap-6">
        <button
          type="button"
          onClick={onAnother}
          className="text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed"
        >
          One more moment →
        </button>
        <button
          type="button"
          onClick={onLookBack}
          className="text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed"
        >
          Look back →
        </button>
      </div>

      <button
        type="button"
        onClick={onLibrary}
        className="mt-12 text-footnote text-ink-tertiary transition-colors duration-fast ease-out hover:text-ink"
      >
        Browse all activities
      </button>
    </motion.section>
  );
}

// ---------- Inline activity card ----------

function ActivityCardInline({
  activity,
  onMore,
}: {
  activity: Activity;
  onMore: () => void;
}) {
  const skill = SKILLS[activity.skill];
  const shortHowTo = truncateWords(activity.howTo, 55);

  return (
    <article
      className="rounded-[10px] border border-line bg-bg-elevated"
      style={{ padding: "24px" }}
    >
      {/* Eyebrow */}
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
        <span style={{ color: skill.color }}>{skill.label}</span>
        <span className="text-ink-quaternary">·</span>
        <span className="text-ink-secondary">{activity.duration} min</span>
        <span className="text-ink-quaternary">·</span>
        <span className="text-ink-secondary">
          {DIFFICULTY_LABEL[activity.difficulty]}
        </span>
      </p>

      {/* Title */}
      <h2 className="mt-3 font-display text-[26px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">
        {activity.title}
      </h2>

      {/* Description */}
      <p className="mt-2 text-[15px] italic leading-[1.45] text-ink-secondary">
        {activity.description}
      </p>

      {/* Short howTo */}
      <p className="mt-4 text-[14px] leading-[1.55] text-ink">{shortHowTo}</p>

      {/* The one thing to say */}
      <p className="mt-4 flex gap-2 text-[14px] leading-[1.55] text-ink">
        <span
          aria-hidden
          className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
        <span>{activity.oneLineToSay}</span>
      </p>

      {/* More link */}
      <button
        type="button"
        onClick={onMore}
        className="mt-5 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        More →
      </button>
    </article>
  );
}

// ---------- helpers ----------

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ").replace(/[,.;:]$/, "") + "…";
}

function longDate(d: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
  return `${weekday} · ${day} ${month}`;
}
