"use client";

import {
  Anchor,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  Heart,
  Sparkles,
  Wind,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

import { ACTIVITIES } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import {
  pickActivity,
  RestDayError,
  scoreActivity,
  type PickContext,
  type PickResult,
  type ScoredActivity,
} from "@/lib/engine";
import { db, getCurrentParent, listChildren } from "@/lib/db";
import type {
  ActivityDifficulty,
  Child,
  Session,
  SkillKey,
  TimeAvailable,
  ChildMood,
} from "@/types";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>> = {
  Sparkles,
  BookOpen,
  Heart,
  Brain,
  Anchor,
  Wind,
  Eye,
  Compass,
};

const TIMES: TimeAvailable[] = ["short", "medium", "long"];
const MOODS: ChildMood[] = ["low", "normal", "high"];
const DIFF_LABEL: Record<ActivityDifficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

export default function EngineDevPage() {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [time, setTime] = useState<TimeAvailable>("medium");
  const [mood, setMood] = useState<ChildMood>("normal");
  const [result, setResult] = useState<PickResult | null>(null);
  const [restDay, setRestDay] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Load children from DB
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const parent = await getCurrentParent();
        if (!parent) {
          if (!cancelled) setChildren([]);
          return;
        }
        const list = await listChildren(parent.id);
        if (cancelled) return;
        setChildren(list);
        if (list.length > 0) setChildId((prev) => prev ?? list[0]!.id);
      } catch (err) {
        console.error("[/dev/engine] load children:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load sessions for the selected child
  useEffect(() => {
    if (!childId) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await db.sessions
          .where("childId")
          .equals(childId)
          .toArray();
        if (!cancelled) setSessions(rows);
      } catch (err) {
        console.error("[/dev/engine] load sessions:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const child = useMemo(
    () => children.find((c) => c.id === childId) ?? null,
    [children, childId],
  );

  const ctx: PickContext = useMemo(
    () => ({ timeAvailable: time, childMood: mood }),
    [time, mood],
  );

  const onPick = useCallback(() => {
    if (!child) return;
    setBusy(true);
    try {
      const r = pickActivity(child, sessions, ctx, new Date(), ACTIVITIES);
      setResult(r);
      setRestDay(false);
      setExpanded(new Set());
    } catch (err) {
      if (err instanceof RestDayError) {
        setRestDay(true);
        setResult(null);
      } else {
        console.error(err);
        toast("Engine error. See console.", { tone: "danger" });
      }
    } finally {
      setBusy(false);
    }
  }, [child, sessions, ctx, toast]);

  const live: ScoredActivity[] = useMemo(() => {
    if (!child) return [];
    return ACTIVITIES.map((a) =>
      scoreActivity(a, child, sessions, ctx, new Date()),
    ).sort((a, b) => b.score - a.score);
  }, [child, sessions, ctx]);

  const top10 = result?.scored.slice(0, 10) ?? live.slice(0, 10);

  const toggleRow = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <main className="mx-auto max-w-[900px] px-5 pb-40">
      <div className="flex items-center justify-between pt-8 pb-6">
        <div>
          <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
            Internal · Engine
          </p>
          <h1 className="mt-1 text-display text-ink">Adaptive picker</h1>
        </div>
        <ThemeToggle />
      </div>

      {children.length === 0 ? (
        <Card>
          <h2 className="text-title-3 text-ink">No children yet</h2>
          <p className="mt-2 text-body text-ink-secondary">
            The engine needs a child profile to score against. Create one from
            the DB console first.
          </p>
          <p className="mt-3 text-footnote">
            <a className="text-accent hover:text-accent-pressed" href="/dev/db">
              Go to /dev/db →
            </a>
          </p>
        </Card>
      ) : (
        <>
          {/* Controls */}
          <section className="mb-8 flex flex-col gap-5">
            {/* Child */}
            <div>
              <label className="mb-2 block text-footnote text-ink-secondary">
                Child
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((c) => (
                  <Chip
                    key={c.id}
                    selected={c.id === childId}
                    onClick={() => setChildId(c.id)}
                  >
                    {c.name} · {c.age}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="mb-2 block text-footnote text-ink-secondary">
                Time available
              </label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <Chip
                    key={t}
                    selected={t === time}
                    onClick={() => setTime(t)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="mb-2 block text-footnote text-ink-secondary">
                Child mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <Chip
                    key={m}
                    selected={m === mood}
                    onClick={() => setMood(m)}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onPick} disabled={!child || busy}>
                Pick activity
              </Button>
              {result ? (
                <Button variant="secondary" onClick={onPick} disabled={busy}>
                  Re-pick
                </Button>
              ) : null}
            </div>
          </section>

          {/* Pick */}
          {restDay ? (
            <Card className="mb-8 border border-warning/40">
              <h2 className="text-title-2 text-ink">Rest day</h2>
              <p className="mt-2 text-body text-ink-secondary">
                Every activity scored below zero. Take today off. Just be with{" "}
                {child?.name ?? "your child"}. The work is the relationship.
              </p>
            </Card>
          ) : result ? (
            <PickCard scored={result.scored[0]!} pick={result} />
          ) : (
            <Card className="mb-8">
              <p className="text-body text-ink-tertiary">
                Tap <span className="text-ink">Pick activity</span> to run the
                engine. Live scores update as you change controls.
              </p>
            </Card>
          )}

          {/* Top 10 */}
          <section>
            <h2 className="mb-3 text-title-2 text-ink">Top 10 scored</h2>
            <Card className="overflow-hidden p-0">
              <table className="w-full text-left text-footnote">
                <thead className="border-b border-line-subtle bg-bg text-caption uppercase tracking-[0.08em] text-ink-tertiary">
                  <tr>
                    <th className="px-3 py-3 font-extrabold">#</th>
                    <th className="px-3 py-3 font-extrabold">Title</th>
                    <th className="px-3 py-3 font-extrabold">Skill</th>
                    <th className="px-3 py-3 font-extrabold">Min</th>
                    <th className="px-3 py-3 font-extrabold">Diff</th>
                    <th className="px-3 py-3 font-extrabold">Score</th>
                    <th className="px-3 py-3 font-extrabold"></th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map((s, i) => (
                    <Row
                      key={s.activity.id}
                      rank={i + 1}
                      scored={s}
                      expanded={expanded.has(s.activity.id)}
                      onToggle={() => toggleRow(s.activity.id)}
                      highlighted={
                        result?.pick.id === s.activity.id ? true : false
                      }
                    />
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}
    </main>
  );
}

// ---------- subcomponents ----------

function PickCard({
  scored,
  pick,
}: {
  scored: ScoredActivity;
  pick: PickResult;
}) {
  const a = pick.pick;
  const def = SKILLS[a.skill];
  const Icon = ICONS[def.iconName];
  return (
    <Card className="mb-8">
      <p className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
        Today's pick
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h2 className="text-title-1 text-ink">{a.title}</h2>
        <span className="shrink-0 text-title-2 text-ink-secondary">
          {pick.scored.find((s) => s.activity.id === a.id)?.score ?? scored.score}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SkillChip skill={a.skill} />
        <span className="text-footnote text-ink-tertiary">
          {a.duration} min
        </span>
        <span className="text-footnote text-ink-tertiary">·</span>
        <span className="text-footnote text-ink-tertiary">
          {DIFF_LABEL[a.difficulty]}
        </span>
        {Icon ? null : null}
      </div>
      <p className="mt-4 text-body text-ink-secondary">{a.description}</p>
    </Card>
  );
}

function SkillChip({ skill }: { skill: SkillKey }) {
  const def = SKILLS[skill];
  const Icon = ICONS[def.iconName];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-extrabold text-white"
      style={{ backgroundColor: def.color }}
    >
      {Icon ? <Icon size={12} strokeWidth={2} aria-hidden /> : null}
      {def.label}
    </span>
  );
}

function Row({
  rank,
  scored,
  expanded,
  onToggle,
  highlighted,
}: {
  rank: number;
  scored: ScoredActivity;
  expanded: boolean;
  onToggle: () => void;
  highlighted: boolean;
}) {
  const a = scored.activity;
  const def = SKILLS[a.skill];
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-line-subtle hover:bg-bg ${
          highlighted ? "bg-accent-bg/40" : ""
        }`}
      >
        <td className="px-3 py-3 font-mono text-ink-tertiary">{rank}</td>
        <td className="px-3 py-3 text-ink">{a.title}</td>
        <td className="px-3 py-3">
          <span
            className="inline-flex h-5 items-center gap-1 rounded-full px-2 text-caption font-extrabold text-white"
            style={{ backgroundColor: def.color }}
          >
            {def.label}
          </span>
        </td>
        <td className="px-3 py-3 text-ink-secondary">{a.duration}</td>
        <td className="px-3 py-3 text-ink-secondary">
          {DIFF_LABEL[a.difficulty]}
        </td>
        <td className="px-3 py-3 text-headline text-ink">{scored.score}</td>
        <td className="px-3 py-3 text-ink-tertiary">
          {expanded ? (
            <ChevronDown size={16} strokeWidth={1.75} />
          ) : (
            <ChevronRight size={16} strokeWidth={1.75} />
          )}
        </td>
      </tr>
      {expanded ? (
        <tr className="border-b border-line-subtle bg-bg">
          <td colSpan={7} className="px-4 py-3">
            {scored.reasons.length === 0 ? (
              <p className="text-footnote text-ink-tertiary">
                No rule fired. Starts at 100 with no adjustments.
              </p>
            ) : (
              <ul className="space-y-1">
                {scored.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="font-mono text-caption text-ink-secondary"
                  >
                    · {r}
                  </li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}
