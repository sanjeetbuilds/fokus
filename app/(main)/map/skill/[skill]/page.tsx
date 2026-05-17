"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ActivityCard from "@/components/activity/ActivityCard";
import SessionCard from "@/components/map/SessionCard";
import StatCard from "@/components/map/StatCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { SKILLS, SKILL_KEYS } from "@/lib/content/skills";
import { db } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import { daysSince } from "@/lib/utils/dates";
import type { Session, SkillKey } from "@/types";

function isSkillKey(value: string | undefined): value is SkillKey {
  return !!value && SKILL_KEYS.includes(value as SkillKey);
}

export default function SkillDetailPage() {
  const router = useRouter();
  const params = useParams<{ skill: string }>();
  const activeChildId = useAppStore((s) => s.activeChildId);

  const skillKey: SkillKey | null = isSkillKey(params?.skill)
    ? (params!.skill as SkillKey)
    : null;

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
        const rows = await db.sessions
          .where("childId")
          .equals(activeChildId)
          .toArray();
        if (!cancelled) setSessions(rows);
      } catch (err) {
        console.error("[/map/skill] load:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  // Filter sessions to this skill (via the activity's skill).
  const skillSessions = useMemo(
    () =>
      skillKey
        ? sessions.filter((s) => getActivityById(s.activityId)?.skill === skillKey)
        : [],
    [sessions, skillKey],
  );

  // Sort skill sessions desc by date then createdAt for the recent list.
  const recent = useMemo(() => {
    const sorted = [...skillSessions].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    return sorted;
  }, [skillSessions]);

  // "Last moment" stat: days since the most recent session in this skill.
  // We report frequency / recency, never a level.
  const lastDoneLabel = useMemo(() => {
    if (recent.length === 0) return "not yet";
    const days = daysSince(recent[0].date, new Date());
    if (days <= 0) return "today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  }, [recent]);

  const skillActivities = useMemo(
    () => (skillKey ? ACTIVITIES.filter((a) => a.skill === skillKey) : []),
    [skillKey],
  );

  if (!skillKey) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <p className="text-headline text-ink">Unknown skill.</p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => router.replace("/map")}
        >
          Back to Map
        </Button>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  const skill = SKILLS[skillKey];

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+48px)]">
      <div className="-mx-2 mb-4 flex h-9 items-center">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
      </div>

      <header>
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: skill.color }}
          />
          <h1 className="font-display text-display leading-[1.1] text-ink">
            {skill.label}
          </h1>
        </div>
        <p className="mt-3 text-body text-ink-secondary">{skill.description}</p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3">
        <StatCard label="Moments" value={skillSessions.length} />
        <StatCard label="Last done" value={lastDoneLabel} />
      </section>

      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
          Recent moments in {skill.label}
        </p>
        {recent.length === 0 ? (
          <EmptyState
            className="mt-2"
            title="No sessions yet in this skill."
            description="Pick one from the activities below to start."
          />
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {recent.map((s) => (
              <li key={s.id}>
                <SessionCard session={s} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-medium text-ink-tertiary">
          Activities for {skill.label}
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {skillActivities.map((a) => (
            <li key={a.id}>
              <Link
                href={`/activity/${a.id}?from=library`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
              >
                <ActivityCard activity={a} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
