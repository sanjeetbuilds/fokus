"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITIES } from "@/lib/content/activities";
import { db, getChild, getSessionsByDate } from "@/lib/db";
import { pickActivity, RestDayError } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type { Child, ChildMood, Session, TimeAvailable } from "@/types";

const TIME_CHIPS: { value: TimeAvailable; label: string }[] = [
  { value: "short", label: "5-10 min" },
  { value: "medium", label: "10-20 min" },
  { value: "long", label: "20-30 min" },
];

const MOOD_CHIPS: { value: ChildMood; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export default function TodayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setLastPickContext = useAppStore((s) => s.setLastPickContext);

  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [time, setTime] = useState<TimeAvailable>("medium");
  const [mood, setMood] = useState<ChildMood>("normal");
  const [busy, setBusy] = useState(false);
  const [restDay, setRestDay] = useState(false);

  const todayDate = useMemo(() => todayIso(), []);

  // Load active child + all sessions + today's sessions (for the count line)
  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) return;

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
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeChildId, todayDate]);

  const onGetMoment = useCallback(() => {
    if (!child || busy) return;
    setBusy(true);
    try {
      const result = pickActivity(
        child,
        sessions,
        { timeAvailable: time, childMood: mood },
        new Date(),
        ACTIVITIES,
      );
      // Persist context so /activity falls back to it if the URL is stripped.
      setLastPickContext({
        childId: child.id,
        activityId: result.pick.id,
        time,
        mood,
        date: todayDate,
      });
      const params = new URLSearchParams({
        time,
        mood,
        from: "today",
      });
      router.push(`/activity/${result.pick.id}?${params.toString()}`);
    } catch (err) {
      if (err instanceof RestDayError) {
        setRestDay(true);
      } else {
        console.error("[/today] pickActivity:", err);
        toast("Couldn't pick. See console.", { tone: "danger" });
      }
    } finally {
      setBusy(false);
    }
  }, [busy, child, mood, router, sessions, setLastPickContext, time, todayDate, toast]);

  // ---------- render ----------

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

  if (restDay) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <div className="flex items-center justify-between">
          <Wordmark size="sm" />
        </div>
        <div className="my-auto">
          <p className="text-[13px] font-medium text-ink-secondary">
            {longDate(new Date())}
          </p>
          <h1
            className="mt-2 text-[44px] font-bold tracking-[-0.02em] text-ink"
            style={{ lineHeight: 1.05 }}
          >
            A rest day.
          </h1>
          <p className="mt-6 text-body-large text-ink-secondary">
            Take today off. Just be with{" "}
            <span className="text-ink">{child?.name ?? "your child"}</span>. The
            work is the relationship.
          </p>
        </div>
        <div className="pt-8">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => setRestDay(false)}
          >
            Try a different context
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+180px)]">
      {/* Top bar: wordmark + menu */}
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

      <header className="mt-6">
        <p className="text-[13px] font-medium text-ink-secondary">
          {longDate(new Date())}
        </p>
        <h1
          className="mt-2 font-display text-[44px] font-semibold tracking-[-0.02em] text-ink"
          style={{ lineHeight: 1.05 }}
        >
          Today with {child?.name ?? "your child"}
        </h1>
        {todaysSessions.length > 0 ? (
          <p className="mt-4 text-callout text-accent-deep">
            ✓ {todaysSessions.length} moment
            {todaysSessions.length === 1 ? "" : "s"} done today
          </p>
        ) : null}
      </header>

      <div className="mt-8 h-px w-full bg-line-subtle" />

      <section className="mt-7">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
          Time available
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIME_CHIPS.map((c) => (
            <Chip
              key={c.value}
              selected={c.value === time}
              onClick={() => setTime(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
          {child?.name ? `${child.name}'s energy` : "Their energy"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOOD_CHIPS.map((c) => (
            <Chip
              key={c.value}
              selected={c.value === mood}
              onClick={() => setMood(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* If they already logged today, hint that they can do another or stop */}
      {todaysSessions.length > 0 ? (
        <Card className="mt-8">
          <p className="text-callout text-ink">
            One moment is plenty. If you want another, pick one, but there&apos;s
            no streak to keep.
          </p>
        </Card>
      ) : null}

      {/* Sticky bottom CTA, sits above the TabBar */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+56px)] left-0 right-0 z-30 border-t border-line-subtle bg-bg px-5 pb-4 pt-4">
        <div className="mx-auto max-w-[640px]">
          <Button
            onClick={onGetMoment}
            fullWidth
            size="lg"
            disabled={!child || busy}
          >
            Find today&apos;s moment →
          </Button>
        </div>
      </div>
    </main>
  );
}

// ---------- date formatting ----------

/**
 * "Wednesday, 14 May": long weekday + day + short month. The new identity
 * uses normal case for the date stamp (caption above the big title) instead
 * of the previous ALL-CAPS treatment.
 */
function longDate(d: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
  return `${weekday}, ${day} ${month}`;
}
