"use client";

import { useEffect, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import SessionCard from "@/components/map/SessionCard";
import SkillFrequencyTiles from "@/components/track/SkillFrequencyTiles";
import { db, getChild } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Child, Session } from "@/types";

/**
 * Round-5 Track surface — replaces the previous Compass mockup and
 * honors SPEC §2: no scores, no goals, no progress bars on the child.
 *
 * Layout:
 *   header → "Track." title → subtitle naming the active child →
 *   SkillFrequencyTiles (top-4 this week, expand to all 8) →
 *   "Recent moments" eyebrow → up to 5 SessionCards
 *
 * The "Nurture today", "Growth this month / Goal 12", weekly-hour goal,
 * and milestones-journal sections from the prior pass are intentionally
 * gone. Today is for the daily moment; Track is for the parent's memory.
 */
export default function TrackPage() {
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
        const [c, all] = await Promise.all([
          getChild(activeChildId),
          db.sessions.where("childId").equals(activeChildId).toArray(),
        ]);
        if (cancelled) return;
        setChild(c ?? null);
        setSessions(all);
      } catch (err) {
        console.error("[/track] load:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const recent = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [sessions],
  );

  if (!loaded) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-5">
        <p className="text-footnote text-ink-tertiary">Loading…</p>
      </main>
    );
  }

  const childName = child?.name ?? "your child";

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
            marginBottom: 8,
          }}
        >
          Track.
        </h1>
        <p
          className="text-[14px] text-ink-tertiary"
          style={{ marginBottom: 24 }}
        >
          What you&apos;ve done with {childName} so far.
        </p>

        <SkillFrequencyTiles sessions={sessions} />

        <p
          className="mb-3 mt-2 text-[12px] font-extrabold uppercase"
          style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
        >
          Recent moments
        </p>

        {recent.length === 0 ? (
          <div
            className="rounded-[20px] border-[1.5px] border-dashed p-5 text-center"
            style={{ borderColor: "var(--ink-quaternary)" }}
          >
            <p
              className="text-[14px] text-ink-secondary"
              style={{ lineHeight: 1.55 }}
            >
              Your first moments are still ahead. Log one from Today and it
              will land here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((s) => (
              <li key={s.id}>
                <SessionCard session={s} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
