"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import TodayActivityCard from "@/components/activity/TodayActivityCard";
import AppHeader from "@/components/layout/AppHeader";
import ReflectSheet from "@/components/today/ReflectSheet";
import WelcomeModal from "@/components/today/WelcomeModal";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { db, getSessionsByDate } from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import type { ChildRow } from "@/lib/supabase/queries";
import { useChild } from "@/lib/use-child";
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
 * Today screen, rewired to read child from useChild() (Supabase).
 *
 *   AppHeader
 *   HomeHeader      avatar + name + "Age N · pronouns"   (T2.4)
 *   "Today's focus." (28 / 800)
 *   Activity card                                         (primary)
 *   "Tune today" chips + "pick another"                   (secondary)
 *
 * Sessions still read from Dexie in this commit (T2.5 will move
 * completion writes to Supabase activity_log; for now Dexie is empty
 * so the engine sees a fresh-history child and picks normally).
 */
export default function TodayPage() {
  const router = useRouter();
  const { toast: _toast } = useToast();
  const setLastPickContext = useAppStore((s) => s.setLastPickContext);

  const { child: childRow, loading: childLoading } = useChild();
  const legacyChild = useMemo(
    () => (childRow ? toLegacyChild(childRow) : null),
    [childRow],
  );

  const [sessions, setSessions] = useState<Session[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const [time, setTime] = useState<TimeAvailable>("medium");
  const [mood, setMood] = useState<ChildMood>("normal");
  const [pickedActivityId, setPickedActivityId] = useState<string | null>(null);
  const [restDay, setRestDay] = useState(false);
  const [reflectActivityId, setReflectActivityId] = useState<string | null>(
    null,
  );
  // Salt that lets "Pick a different activity" re-run the engine with the
  // same time/mood — incrementing it bumps the effect below.
  const [pickSalt, setPickSalt] = useState(0);

  const todayDate = useMemo(() => todayIso(), []);

  const reload = useCallback(async () => {
    if (!childRow) {
      setSessions([]);
      setTodaysSessions([]);
      setSessionsLoaded(true);
      return;
    }
    try {
      const [all, todays] = await Promise.all([
        db.sessions.where("childId").equals(childRow.id).toArray(),
        getSessionsByDate(childRow.id, todayDate),
      ]);
      setSessions(all);
      setTodaysSessions(todays);
    } catch (err) {
      console.error("[/today] load sessions:", err);
    } finally {
      setSessionsLoaded(true);
    }
  }, [childRow, todayDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!legacyChild || todaysSessions.length > 0) {
      setRestDay(false);
      return;
    }
    try {
      const r = pickActivity(
        legacyChild,
        sessions,
        { timeAvailable: time, childMood: mood },
        new Date(),
        ACTIVITIES,
      );
      setPickedActivityId(r.pick.id);
      setRestDay(false);
      setLastPickContext({
        childId: legacyChild.id,
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
    legacyChild,
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

  const onMoreDetail = useCallback(() => {
    if (!pickedActivity) return;
    const qs = new URLSearchParams({ time, mood, from: "today" });
    router.push(`/activity/${pickedActivity.id}?${qs.toString()}`);
  }, [mood, pickedActivity, router, time]);

  const onReflected = useCallback(async () => {
    setReflectActivityId(null);
    await reload();
  }, [reload]);

  const loaded = !childLoading && sessionsLoaded;

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  if (!childRow || !legacyChild) {
    // OnboardingGate will redirect; this guards the brief in-between frame.
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-body text-ink-secondary">Setting up…</p>
      </main>
    );
  }

  const reflectActivity = reflectActivityId
    ? getActivityById(reflectActivityId) ?? null
    : null;
  const alreadyLogged = todaysSessions.length > 0;
  const childName = childRow.name;

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-2">
        <HomeHeader child={childRow} />

        <h1
          className="text-ink"
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Today&apos;s focus.
        </h1>

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
              onStart={onMoreDetail}
            />
          ) : (
            <p className="mt-6 text-center text-footnote text-ink-tertiary">
              No activity matches that filter right now.
            </p>
          )}
        </div>

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
      </div>

      <ReflectSheet
        open={reflectActivity !== null}
        activity={reflectActivity}
        childId={childRow.id}
        childName={childName}
        onClose={() => setReflectActivityId(null)}
        onLogged={() => void onReflected()}
      />

      <WelcomeModal
        childName={childName}
        parentId={null}
        alreadySeen={false}
      />
    </main>
  );
}

// ---------- Home header (T2.4) ----------

function HomeHeader({ child }: { child: ChildRow }) {
  const info = ageFromDob(child.dob);
  const age = info?.years ?? 0;
  const initial = child.name.trim().charAt(0).toUpperCase() || "•";
  const pronouns = pronounsLabel(child.pronouns);

  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: child.photo_url ? "transparent" : "#1A1A1A",
          backgroundImage: child.photo_url
            ? `url(${child.photo_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 18,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {child.photo_url ? null : initial}
      </div>
      <div className="min-w-0 flex-1">
        <p
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#1A1A1A",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {child.name}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#6B6B6B",
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

// ---------- Supabase → legacy Child adapter for the engine ----------

function toLegacyChild(row: ChildRow): Child {
  const info = ageFromDob(row.dob);
  const age = info?.years ?? 0;
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    age,
    dateOfBirth: row.dob,
    grade: "",
    engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
    primaryLanguage: "",
    interests: [],
    strengths: [],
    struggles: [],
    photoUrl: row.photo_url,
    gender:
      row.pronouns === "she"
        ? "girl"
        : row.pronouns === "he"
          ? "boy"
          : "unspecified",
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

// ---------- CompactChipRow + states (unchanged from prior file) ----------

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
    <div className="flex gap-2">
      {options.map((opt) => {
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rounded-full px-3 transition-colors"
            style={{
              height: 36,
              fontSize: 13,
              fontWeight: 800,
              background: on ? "#1A1A1A" : "#FFFFFF",
              color: on ? "#FFFFFF" : "#1A1A1A",
              border: `1px solid ${on ? "#1A1A1A" : "#EEEEEE"}`,
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
    <article
      className="w-full"
      style={{
        background: "#F7F7F5",
        borderRadius: 24,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1A1A1A",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        Rest tonight.
      </p>
      <p
        className="mt-3"
        style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.5 }}
      >
        {childName} has had enough recent practice. We&apos;ll have something
        new tomorrow.
      </p>
    </article>
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
  return (
    <article
      className="w-full"
      style={{
        background: "#F7F7F5",
        borderRadius: 24,
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1A1A1A",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        Done for today.
      </p>
      <p
        className="mt-3"
        style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.5 }}
      >
        {activity
          ? `${activity.title}, with ${childName}.`
          : `One moment together with ${childName}.`}
      </p>
    </article>
  );
}
