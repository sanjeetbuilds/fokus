"use client";

import { CalendarDays, Flame, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import SessionCard from "@/components/map/SessionCard";
import SkillBar from "@/components/map/SkillBar";
import StatCard from "@/components/map/StatCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SKILL_KEYS } from "@/lib/content/skills";
import { db, getChild } from "@/lib/db";
import { computeMapStats, skillCoverage } from "@/lib/engine";
import { useAppStore } from "@/lib/store/useAppStore";
import { today as todayIso } from "@/lib/utils/dates";
import type { Child, Session } from "@/types";

export default function MapPage() {
  const router = useRouter();
  const activeChildId = useAppStore((s) => s.activeChildId);

  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) {
      setLoaded(true);
      return;
    }
    void (async () => {
      try {
        const [c, allSessions] = await Promise.all([
          getChild(activeChildId),
          db.sessions.where("childId").equals(activeChildId).toArray(),
        ]);
        if (cancelled) return;
        setChild(c ?? null);
        setSessions(allSessions);
      } catch (err) {
        console.error("[/map] load:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const today = useMemo(() => todayIso(), []);
  const stats = useMemo(
    () => computeMapStats(sessions, today),
    [sessions, today],
  );
  const coverage = useMemo(() => skillCoverage(sessions), [sessions]);

  // Most recent 5 sessions (sessions already insertion-ordered; sort by
  // date desc, then by createdAt desc as a tiebreaker for same-day ones).
  const recent = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return sorted.slice(0, 5);
  }, [sessions]);

  // ---------- render ----------

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  const childName = child?.name ?? "your child";

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <header>
        <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
          Map
        </p>
        <h1 className="mt-1 text-display text-ink">{childName}&apos;s map</h1>
      </header>

      {sessions.length === 0 ? (
        <div className="mt-16">
          <EmptyState
            icon={<Sparkles size={28} strokeWidth={1.5} />}
            title={`When you start, ${childName}'s map will build itself here.`}
            description="One moment a day. Five to twenty-five minutes. The picture forms over weeks, not days."
            cta={
              <Button size="lg" onClick={() => router.push("/today")}>
                Pick today&apos;s moment
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-3 gap-3">
            <StatCard label="Streak" value={stats.streak} icon={Flame} />
            <StatCard
              label="Total days"
              value={stats.totalDays}
              icon={CalendarDays}
            />
            <StatCard label="Sessions" value={stats.sessions} />
          </section>

          <section className="mt-10">
            <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
              Skill development
            </p>
            <ul className="mt-3 -mx-3 flex flex-col">
              {SKILL_KEYS.map((k) => (
                <li key={k}>
                  <SkillBar
                    skillKey={k}
                    sessionsCount={coverage[k].sessions}
                    confidence={coverage[k].confidence}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
              Recent moments
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {recent.map((s) => (
                <li key={s.id}>
                  <SessionCard session={s} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
