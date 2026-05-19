"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import TodayActivityCard from "@/components/activity/TodayActivityCard";
import CategoryPills, {
  type CategoryValue,
} from "@/components/layout/CategoryPills";
import GreetBar from "@/components/layout/GreetBar";
import TipCard from "@/components/layout/TipCard";
import WeeklyBars from "@/components/map/WeeklyBars";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import LogSheet from "@/components/today/LogSheet";
import ReflectionBlock from "@/components/today/ReflectionBlock";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { createSession, db, getChild, getSessionsByDate } from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type {
  Child,
  ChildMood,
  Session,
  TimeAvailable,
} from "@/types";

export default function TodayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setLastPickContext = useAppStore((s) => s.setLastPickContext);

  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [category, setCategory] = useState<CategoryValue>("all");
  const [pickedActivityId, setPickedActivityId] = useState<string | null>(null);
  const [restDay, setRestDay] = useState(false);

  const [showLogSheet, setShowLogSheet] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [skipBusy, setSkipBusy] = useState(false);

  // Engine context — sensible defaults; the new design doesn't expose
  // time/mood as chips. Power users can still hit /activity/[id] to
  // tweak via URL parameters.
  const time: TimeAvailable = "medium";
  const mood: ChildMood = "normal";

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

  const showingPicker = todaysSessions.length === 0 || showOverride;

  // Filter activities by category before letting the engine choose.
  const candidatePool = useMemo(() => {
    if (category === "all") return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.skill === category);
  }, [category]);

  useEffect(() => {
    if (!showingPicker || !child) return;
    if (candidatePool.length === 0) {
      setPickedActivityId(null);
      setRestDay(false);
      return;
    }
    try {
      const result = pickActivity(
        child,
        sessions,
        { timeAvailable: time, childMood: mood },
        new Date(),
        candidatePool,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, sessions, candidatePool, todayDate, showingPicker]);

  const pickedActivity = useMemo(
    () => (pickedActivityId ? getActivityById(pickedActivityId) : null),
    [pickedActivityId],
  );

  const onMoreDetail = useCallback(() => {
    if (!pickedActivity) return;
    const params = new URLSearchParams({ time, mood, from: "today" });
    router.push(`/activity/${pickedActivity.id}?${params.toString()}`);
  }, [pickedActivity, router]);

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
  }, [activeChildId, pickedActivity, reloadSessions, skipBusy, todayDate, toast]);

  const onLogged = useCallback(async () => {
    setShowLogSheet(false);
    setShowOverride(false);
    await reloadSessions();
  }, [reloadSessions]);

  const childName = child?.name ?? "your child";
  const truncatedHowTo = useMemo(
    () => (pickedActivity ? truncateWords(pickedActivity.howTo, 38) : ""),
    [pickedActivity],
  );

  // Frequency stat for the right-hand TipCard.
  const monthCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    return sessions.filter(
      (s) => s.date >= cutoffIso && s.response !== "skipped",
    ).length;
  }, [sessions]);

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
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <GreetBar />

      <header className="mt-5">
        <h1
          className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.15 }}
        >
          Tonight with {childName}.
        </h1>
        <p className="mt-1 text-[14px] text-ink-tertiary">
          Gentle moments for what schools can&apos;t measure.
        </p>
      </header>

      {child ? (
        <ReflectionBlock child={child} sessionCount={sessions.length} />
      ) : null}

      <div className="mt-5">
        <CategoryPills selected={category} onChange={setCategory} />
      </div>

      <AnimatePresence mode="wait">
        {restDay ? (
          <motion.section
            key="rest"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-6 rounded-[18px] bg-bg-elevated p-6 shadow-md"
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
                  <TodayActivityCard
                    activity={pickedActivity}
                    onMore={onMoreDetail}
                    onDidIt={onDidIt}
                    onSkip={() => void onSkipToday()}
                    skipBusy={skipBusy}
                    truncatedHowTo={truncatedHowTo}
                  />
                </motion.div>
              ) : (
                <p className="mt-10 text-center text-footnote text-ink-tertiary">
                  No activities in this skill yet.
                </p>
              )}
            </AnimatePresence>

            {/* Weekly bar chart — hidden for first-time users; an empty
                grid of bars would read as "nothing happening" rather than
                "you haven't started." */}
            <section className="mt-6">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[17px] font-bold text-ink">
                  This week
                </span>
                {sessions.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => router.push("/map")}
                    className="text-[13px] font-medium text-accent-mid hover:text-accent"
                  >
                    Details →
                  </button>
                ) : null}
              </div>
              <div className="rounded-[18px] bg-bg-elevated p-4 shadow-md">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <span
                      aria-hidden
                      className="h-1 w-1 rounded-full bg-accent"
                    />
                    <p className="mt-3 text-center text-[12px] text-ink-tertiary">
                      Your week will fill in here. One small moment is all
                      it takes.
                    </p>
                  </div>
                ) : (
                  <WeeklyBars sessions={sessions} today={new Date()} />
                )}
              </div>
            </section>

            {/* Tip cards row */}
            <div className="mt-5 flex gap-3">
              <TipCard
                tone="warm"
                icon={
                  <span aria-hidden role="img">
                    ☼
                  </span>
                }
                title="One a day"
                body="One real moment beats ten rushed ones."
              />
              <TipCard
                tone="coral"
                icon={
                  <span aria-hidden role="img">
                    ◆
                  </span>
                }
                title="This month"
                body={
                  monthCount === 0 ? (
                    "Your first moments are still ahead."
                  ) : (
                    <>
                      <span className="text-[18px] font-bold text-ink">
                        {monthCount}
                      </span>{" "}
                      moment{monthCount === 1 ? "" : "s"} together.
                    </>
                  )
                }
              />
            </div>
          </motion.div>
        ) : (
          <DoneForToday
            key="done"
            childName={childName}
            todaysSessions={todaysSessions}
            onAnother={() => setShowOverride(true)}
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
      <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ink" />
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

// ---------- helpers ----------

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ").replace(/[,.;:]$/, "") + "…";
}
