"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import TodayActivityCard from "@/components/activity/TodayActivityCard";
import AppHeader from "@/components/layout/AppHeader";
import ReflectionBlock from "@/components/today/ReflectionBlock";
import ReflectSheet from "@/components/today/ReflectSheet";
import { useToast } from "@/components/ui/Toast";
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

const TIME_OPTIONS: { value: TimeAvailable; label: string }[] = [
  { value: "short", label: "5 min" },
  { value: "medium", label: "10–15 min" },
  { value: "long", label: "20+ min" },
];

const MOOD_OPTIONS: { value: ChildMood; label: string }[] = [
  { value: "low", label: "Low energy" },
  { value: "normal", label: "Steady" },
  { value: "high", label: "Buzzing" },
];

/**
 * Today — back to the SPEC shape after the round-4 detour:
 *   header → page title → reflection block → time chips → mood chips →
 *   single activity card.
 *
 * No 2x2 stat grid, no Child's Diary, no "tell us more" nudge — those
 * either belonged on Track (the recent-moments memory) or had to go
 * entirely (the nudge duplicated what the reflection block already says).
 */
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
  const [reflectActivityId, setReflectActivityId] = useState<string | null>(
    null,
  );
  const [skipBusy, setSkipBusy] = useState(false);

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
      setSessions(all);
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

  // Re-pick whenever the active child or time/mood changes, if the parent
  // hasn't yet logged anything today.
  useEffect(() => {
    if (!child || todaysSessions.length > 0) {
      setRestDay(false);
      return;
    }
    try {
      const r = pickActivity(
        child,
        sessions,
        { timeAvailable: time, childMood: mood },
        new Date(),
        ACTIVITIES,
      );
      setPickedActivityId(r.pick.id);
      setRestDay(false);
      setLastPickContext({
        childId: child.id,
        activityId: r.pick.id,
        time,
        mood,
        date: todayDate,
      });
    } catch (err) {
      if (err instanceof RestDayError) {
        setPickedActivityId(null);
        setRestDay(true);
        return;
      }
      console.error("[/today] pickActivity:", err);
    }
  }, [child, sessions, todaysSessions.length, time, mood, todayDate, setLastPickContext]);

  const pickedActivity = useMemo(
    () => (pickedActivityId ? getActivityById(pickedActivityId) ?? null : null),
    [pickedActivityId],
  );

  const truncatedHowTo = useMemo(
    () => (pickedActivity ? truncateWords(pickedActivity.howTo, 38) : ""),
    [pickedActivity],
  );

  const onMoreDetail = useCallback(() => {
    if (!pickedActivity) return;
    const qs = new URLSearchParams({ time, mood, from: "today" });
    router.push(`/activity/${pickedActivity.id}?${qs.toString()}`);
  }, [mood, pickedActivity, router, time]);

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
      await reload();
    } catch (err) {
      console.error("[/today] skip:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
    } finally {
      setSkipBusy(false);
    }
  }, [activeChildId, mood, pickedActivity, reload, skipBusy, time, todayDate, toast]);

  const onReflected = useCallback(async () => {
    setReflectActivityId(null);
    await reload();
  }, [reload]);

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

  const reflectActivity = reflectActivityId
    ? getActivityById(reflectActivityId) ?? null
    : null;
  const alreadyLogged = todaysSessions.length > 0;
  const childName = child.name;

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
          focus.
        </h1>

        <ReflectionBlock child={child} sessionCount={sessions.length} />

        {!alreadyLogged ? (
          <>
            <ChipRow
              eyebrow="How much time do you have?"
              options={TIME_OPTIONS}
              value={time}
              onChange={setTime}
            />
            <ChipRow
              eyebrow={`How is ${childName} right now?`}
              options={MOOD_OPTIONS}
              value={mood}
              onChange={setMood}
            />
          </>
        ) : null}

        {restDay ? (
          <RestDay childName={childName} />
        ) : alreadyLogged ? (
          <DoneForToday
            childName={childName}
            lastSession={todaysSessions[todaysSessions.length - 1]!}
          />
        ) : pickedActivity ? (
          <div className="mt-2">
            <TodayActivityCard
              activity={pickedActivity}
              onMore={onMoreDetail}
              onDidIt={() => setReflectActivityId(pickedActivity.id)}
              onSkip={() => void onSkipToday()}
              skipBusy={skipBusy}
              truncatedHowTo={truncatedHowTo}
            />
          </div>
        ) : (
          <p className="mt-10 text-center text-footnote text-ink-tertiary">
            No activity matches that filter right now.
          </p>
        )}
      </div>

      <ReflectSheet
        open={reflectActivity !== null}
        activity={reflectActivity}
        childId={activeChildId}
        childName={childName}
        onClose={() => setReflectActivityId(null)}
        onLogged={() => void onReflected()}
      />
    </main>
  );
}

function ChipRow<T extends string>({
  eyebrow,
  options,
  value,
  onChange,
}: {
  eyebrow: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section className="mb-4">
      <p
        className="mb-2 text-[12px] font-semibold uppercase"
        style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
      >
        {eyebrow}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
              style={{
                background: on ? "var(--ink)" : "var(--bg-elevated)",
                border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                color: on ? "#fff" : "var(--ink)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RestDay({ childName }: { childName: string }) {
  return (
    <section
      className="mt-2 rounded-[22px] bg-bg-elevated p-5"
      style={{ border: "1.5px solid var(--line)" }}
    >
      <p className="text-[17px] text-ink" style={{ lineHeight: 1.55 }}>
        Take today off. Just be with{" "}
        <span className="font-bold">{childName}</span>. The work is the
        relationship.
      </p>
    </section>
  );
}

function DoneForToday({
  childName,
  lastSession,
}: {
  childName: string;
  lastSession: Session;
}) {
  const activity = getActivityById(lastSession.activityId);
  const wasSkipped = lastSession.response === "skipped";
  return (
    <section
      className="mt-2 flex flex-col items-center rounded-[22px] bg-bg-elevated p-6 text-center"
      style={{ border: "1.5px solid var(--line)" }}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
      <p
        className="mt-4 text-[18px] font-bold text-ink"
        style={{ letterSpacing: "-0.01em" }}
      >
        {wasSkipped ? "Marked as skipped." : "Done for today."}
      </p>
      {activity ? (
        <p className="mt-1.5 text-[13px] text-ink-tertiary">
          {wasSkipped
            ? `Skipped ${activity.title}.`
            : `You and ${childName} did ${activity.title}.`}
        </p>
      ) : null}
      <p className="mt-4 text-[13px] text-ink-tertiary">See you tomorrow.</p>
    </section>
  );
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ").replace(/[,.;:]$/, "") + "…";
}
