"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import TodayActivityCard from "@/components/activity/TodayActivityCard";
import AppHeader from "@/components/layout/AppHeader";
import ReflectSheet from "@/components/today/ReflectSheet";
import WelcomeModal from "@/components/today/WelcomeModal";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import {
  createSession,
  db,
  getChild,
  getCurrentParent,
  getSessionsByDate,
} from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { ageFromDob, today as todayIso } from "@/lib/utils/dates";
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
 * Today — restructured so the activity card is the second thing the
 * parent sees (after the eyebrow + title), not buried at the bottom.
 *
 *   greet bar
 *   eyebrow "TONIGHT WITH {NAME}" + 28px "Today's focus."
 *   ACTIVITY CARD  (primary)
 *   "TUNE TODAY" small chips + "pick another"   (secondary, demoted)
 *   bottom caption  "{name} is {age}. {English status}." + "+ tell us more"
 *
 * The round-5 reflection card and the duplicate "tell us more" link at
 * the top are gone — that whole role is collapsed into the bottom caption.
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
  const [parentId, setParentId] = useState<string | null>(null);
  const [welcomeAlreadySeen, setWelcomeAlreadySeen] = useState(true);

  const [time, setTime] = useState<TimeAvailable>("medium");
  const [mood, setMood] = useState<ChildMood>("normal");
  const [pickedActivityId, setPickedActivityId] = useState<string | null>(null);
  const [restDay, setRestDay] = useState(false);
  const [reflectActivityId, setReflectActivityId] = useState<string | null>(
    null,
  );
  const [skipBusy, setSkipBusy] = useState(false);
  // Salt that lets "Pick a different activity" re-run the engine with the
  // same time/mood — incrementing it bumps the effect below.
  const [pickSalt, setPickSalt] = useState(0);

  const todayDate = useMemo(() => todayIso(), []);

  const reload = useCallback(async () => {
    if (!activeChildId) {
      setLoaded(true);
      return;
    }
    try {
      const [c, all, todays, parent] = await Promise.all([
        getChild(activeChildId),
        db.sessions.where("childId").equals(activeChildId).toArray(),
        getSessionsByDate(activeChildId, todayDate),
        getCurrentParent(),
      ]);
      setChild(c ?? null);
      setSessions(all);
      setTodaysSessions(todays);
      setParentId(parent?.id ?? null);
      setWelcomeAlreadySeen(parent?.preferences?.hasSeenWelcomeModal === true);
    } catch (err) {
      console.error("[/today] load:", err);
    } finally {
      setLoaded(true);
    }
  }, [activeChildId, todayDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
  }, [
    child,
    mood,
    pickSalt,
    sessions,
    setLastPickContext,
    time,
    todayDate,
    todaysSessions.length,
  ]);

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

      <div className="px-6 pt-2">
        {/* Tier 1: small eyebrow + reduced page title */}
        <p
          className="text-ink-tertiary"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Tonight with {childName}
        </p>
        <h1
          className="text-ink"
          style={{
            marginTop: 6,
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          Today&apos;s focus.
        </h1>

        {/* Tier 2: the activity card — the primary content */}
        <div className="mt-6">
          {restDay ? (
            <RestDay childName={childName} />
          ) : alreadyLogged ? (
            <DoneForToday
              childName={childName}
              lastSession={todaysSessions[todaysSessions.length - 1]!}
            />
          ) : pickedActivity ? (
            <TodayActivityCard
              activity={pickedActivity}
              onMore={onMoreDetail}
              onDidIt={() => setReflectActivityId(pickedActivity.id)}
              onSkip={() => void onSkipToday()}
              skipBusy={skipBusy}
              truncatedHowTo={truncatedHowTo}
            />
          ) : (
            <p className="mt-6 text-center text-footnote text-ink-tertiary">
              No activity matches that filter right now.
            </p>
          )}
        </div>

        {/* Tier 3: Tune today — demoted */}
        {!alreadyLogged && !restDay ? (
          <section className="mt-8">
            <p
              className="text-ink-tertiary"
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Tune today
            </p>
            <p
              className="mt-1 text-ink-tertiary"
              style={{ fontSize: 12, lineHeight: 1.5 }}
            >
              Adjust if the activity doesn&apos;t fit right now.
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              <CompactChipRow
                options={TIME_OPTIONS}
                value={time}
                onChange={setTime}
              />
              <CompactChipRow
                options={MOOD_OPTIONS}
                value={mood}
                onChange={setMood}
              />
            </div>
            <button
              type="button"
              onClick={() => setPickSalt((s) => s + 1)}
              className="mt-3 text-[13px] font-extrabold transition-colors hover:underline"
              style={{ color: "var(--accent-deep)" }}
            >
              Pick a different activity
            </button>
          </section>
        ) : null}

        {/* Tier 4: bottom caption replacing the old reflection card */}
        <section className="mt-10">
          <p
            className="text-ink-tertiary"
            style={{ fontSize: 13, lineHeight: 1.55 }}
          >
            {bottomCaption(child)}
          </p>
          <Link
            href={`/profile/about/${child.id}`}
            className="mt-1.5 inline-flex items-center gap-1 transition-colors"
            style={{
              color: "var(--accent-deep)",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            + Tell us more about {childName} →
          </Link>
        </section>
      </div>

      <ReflectSheet
        open={reflectActivity !== null}
        activity={reflectActivity}
        childId={activeChildId}
        childName={childName}
        onClose={() => setReflectActivityId(null)}
        onLogged={() => void onReflected()}
      />

      <WelcomeModal
        childName={childName}
        parentId={parentId}
        alreadySeen={welcomeAlreadySeen}
      />
    </main>
  );
}

function CompactChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rounded-full px-3 text-[12px] font-extrabold transition-colors"
            style={{
              height: 36,
              background: on ? "var(--ink)" : "var(--bg-elevated)",
              border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
              color: on ? "#fff" : "var(--ink)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function RestDay({ childName }: { childName: string }) {
  return (
    <section
      className="rounded-[18px] bg-bg-elevated p-5"
      style={{ border: "1.5px solid var(--line)" }}
    >
      <p className="text-[16px] text-ink" style={{ lineHeight: 1.55 }}>
        Take today off. Just be with{" "}
        <span className="font-extrabold">{childName}</span>. The work is the
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
      className="flex flex-col items-center rounded-[18px] bg-bg-elevated p-6 text-center"
      style={{ border: "1.5px solid var(--line)" }}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
      <p
        className="mt-4 text-[18px] font-extrabold text-ink"
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

// ---------- bottom caption helpers ----------

function bottomCaption(child: Child): string {
  return `${child.name} is ${ageDescriptionFor(child)}. ${englishStatusFor(child)}.`;
}

function ageDescriptionFor(child: Child): string {
  if (child.dateOfBirth) {
    const info = ageFromDob(child.dateOfBirth);
    if (info) {
      if (info.years === 0) {
        return `${info.months} ${plural(info.months, "month")}`;
      }
      if (info.months === 0) {
        return `${info.years} ${plural(info.years, "year")}`;
      }
      return `${info.years} ${plural(info.years, "year")} ${info.months} ${plural(info.months, "month")}`;
    }
  }
  return `${child.age}`;
}

function englishStatusFor(child: Child): string {
  switch (child.englishConfidence) {
    case "hesitant":
      return "Just starting English";
    case "developing":
      return "Building English";
    case "comfortable":
      return "Comfortable in English";
    default:
      return "Building English";
  }
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ").replace(/[,.;:]$/, "") + "…";
}
