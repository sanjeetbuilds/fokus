"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import ActivityIcon from "@/components/activity/ActivityIcon";
import Wordmark from "@/components/shared/Wordmark";
import Button from "@/components/ui/Button";
import { getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import { getChild } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type {
  Activity,
  ActivityExample,
  ActivityDifficulty,
  ChildMood,
  TimeAvailable,
} from "@/types";

const DIFFICULTY_LABEL: Record<ActivityDifficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

/**
 * Activity detail — restructured into three explicit visual tiers:
 *
 *   header   icon + skill caption + title + tagline
 *   PRIMARY  "What to do tonight" — full-flow howTo, no card wrapper
 *   SECONDARY "Example" — left-border inset, subtle
 *   sticky   action bar (Pick another / We did it →)
 *   TERTIARY "Learn more ↓" — 5 collapsed cards (builds, watch for,
 *            one thing to say, trap, adapt). Below the sticky bar so the
 *            primary action is always reachable without scrolling past it.
 *
 * The "WHAT THIS BUILDS" italic line that used to sit at the top is gone
 * from the header — it's now the first card inside Learn More.
 */
export default function ActivityDetailPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <ActivityDetailBody />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-5">
      <p className="text-footnote text-ink-tertiary">Loading…</p>
    </main>
  );
}

function ActivityDetailBody() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params?.id;
  const activity = useMemo(
    () => (id ? getActivityById(id) : undefined),
    [id],
  );

  const lastPickContext = useAppStore((s) => s.lastPickContext);
  const activeChildId = useAppStore((s) => s.activeChildId);
  const [childName, setChildName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!activeChildId) {
      setChildName(null);
      return;
    }
    void (async () => {
      try {
        const c = await getChild(activeChildId);
        if (!cancelled) setChildName(c?.name ?? null);
      } catch (err) {
        console.error("[/activity] load child:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  const time = (searchParams?.get("time") as TimeAvailable | null) ??
    (lastPickContext?.activityId === id ? lastPickContext.time : null) ??
    "medium";
  const mood = (searchParams?.get("mood") as ChildMood | null) ??
    (lastPickContext?.activityId === id ? lastPickContext.mood : null) ??
    "normal";

  const fromLibrary = searchParams?.get("from") === "library";

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onLeftCta = useCallback(() => {
    if (fromLibrary) {
      router.replace("/library");
    } else {
      router.replace("/today");
    }
  }, [fromLibrary, router]);

  const onLogIt = useCallback(() => {
    if (!activity) return;
    const qs = new URLSearchParams({ time, mood });
    router.push(`/log/${activity.id}?${qs.toString()}`);
  }, [activity, mood, router, time]);

  if (!activity) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <p className="text-headline text-ink">Activity not found.</p>
        <p className="mt-2 text-body text-ink-secondary">
          That id isn&apos;t in the current library.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => router.replace("/today")}
        >
          Back to Today
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[680px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+128px)]">
      {/* Top bar: Back left, Wordmark right */}
      <div className="-mx-2 mb-6 flex h-9 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-[15px] font-extrabold text-ink-secondary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
        <Wordmark size="sm" />
      </div>

      <ActivityHeader activity={activity} />

      {/* PRIMARY: What to do tonight — no card wrapper, full-flow */}
      <section className="mt-8">
        <p
          className="text-[13px] font-extrabold uppercase"
          style={{ color: "var(--accent-deep)", letterSpacing: "0.1em" }}
        >
          What to do tonight
        </p>
        <p
          className="mt-3 whitespace-pre-line text-ink"
          style={{ fontSize: 17, lineHeight: 1.65, fontWeight: 400 }}
        >
          {activity.howTo}
        </p>
      </section>

      {/* SECONDARY: Example — subtle left-border inset, no card bg */}
      <section className="mt-7">
        <p
          className="text-[12px] font-extrabold uppercase"
          style={{ color: "var(--ink-secondary)", letterSpacing: "0.1em" }}
        >
          Example
        </p>
        <ExampleBlock
          example={activity.example}
          childName={childName ?? "your child"}
        />
      </section>

      {/* TERTIARY: Learn more — sits below the sticky bar, scrolled to */}
      <LearnMoreSection activity={activity} />

      {/* Sticky bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 border-t px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3"
        style={{
          borderColor: "var(--line-subtle)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "saturate(180%) blur(12px)",
          WebkitBackdropFilter: "saturate(180%) blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-[680px] gap-3">
          <button
            type="button"
            onClick={onLeftCta}
            className="h-11 flex-[0_0_38%] rounded-full bg-bg-elevated text-[14px] font-extrabold text-ink"
            style={{ border: "1.5px solid var(--line)" }}
          >
            {fromLibrary ? "Back to library" : "Pick another"}
          </button>
          <button
            type="button"
            onClick={onLogIt}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full text-[14px] font-extrabold text-white"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 14px -4px rgba(156,165,255,0.45)",
            }}
          >
            We did it →
          </button>
        </div>
      </div>
    </main>
  );
}

// ---------- header block ----------

function ActivityHeader({ activity }: { activity: Activity }) {
  const skill = SKILLS[activity.skill];

  return (
    <header>
      {/* Big skill-coloured icon hero. Reduced from round-3's 80px to 72px
          so the hero title below has more breathing room. */}
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px]"
        style={{
          backgroundColor: skill.color,
          color: "#FFFFFF",
        }}
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={34}
          strokeWidth={1.75}
        />
      </div>

      <p className="mt-4 text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-secondary">
        <span style={{ color: skill.color }}>{skill.label}</span>
        <span className="text-ink-quaternary"> · </span>
        <span>{activity.duration} min</span>
        <span className="text-ink-quaternary"> · </span>
        <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
      </p>

      <h1
        className="mt-3 text-ink"
        style={{
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
        }}
      >
        {activity.title}
      </h1>

      <p
        className="mt-3 text-[16px] italic text-ink-secondary"
        style={{ lineHeight: 1.55 }}
      >
        {activity.description}
      </p>
    </header>
  );
}

// ---------- example block ----------

function ExampleBlock({
  example,
  childName,
}: {
  example: ActivityExample;
  childName: string;
}) {
  const fill = useCallback(
    (s: string) => s.replace(/\{childName\}/g, childName),
    [childName],
  );

  return (
    <div
      className="mt-2 pl-4"
      style={{ borderLeft: "2px solid var(--ink-quaternary)" }}
    >
      <p
        className="text-[14px] italic text-ink-secondary"
        style={{ lineHeight: 1.55 }}
      >
        {fill(example.setup)}
      </p>

      <dl className="mt-3 flex flex-col gap-2">
        {example.exchange.map((turn, i) => (
          <div key={i} className="flex gap-2">
            <dt
              className="shrink-0 text-[14px]"
              style={{
                fontWeight: turn.speaker === "you" ? 600 : 400,
                color:
                  turn.speaker === "you"
                    ? "var(--ink)"
                    : "var(--ink-secondary)",
              }}
            >
              {turn.speaker === "you" ? "You" : childName}:
            </dt>
            <dd
              className="text-[14px]"
              style={{
                lineHeight: 1.55,
                fontWeight: turn.speaker === "you" ? 600 : 400,
                color:
                  turn.speaker === "you"
                    ? "var(--ink)"
                    : "var(--ink-secondary)",
              }}
            >
              {fill(turn.line)}
            </dd>
          </div>
        ))}
      </dl>

      {example.closing ? (
        <p
          className="mt-3 text-[14px] italic text-ink-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {fill(example.closing)}
        </p>
      ) : null}
    </div>
  );
}

// ---------- learn more (tertiary tier) ----------

function LearnMoreSection({ activity }: { activity: Activity }) {
  const skill = SKILLS[activity.skill];
  return (
    <section className="mt-10">
      <p
        className="text-[11px] font-extrabold uppercase"
        style={{ color: "var(--ink-tertiary)", letterSpacing: "0.1em" }}
      >
        Learn more ↓
      </p>
      <p
        className="mt-1 text-[13px] text-ink-tertiary"
        style={{ lineHeight: 1.5 }}
      >
        Optional. For when you want to go deeper.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <CollapsibleRow label="What this builds">
          <p className="text-[15px] text-ink" style={{ lineHeight: 1.6 }}>
            {skill.description}
          </p>
        </CollapsibleRow>
        <CollapsibleRow label="What you're really building">
          <p className="text-[15px] text-ink" style={{ lineHeight: 1.6 }}>
            {activity.hiddenCurriculum}
          </p>
        </CollapsibleRow>
        <CollapsibleRow label="What to watch for">
          <p className="text-[15px] text-ink" style={{ lineHeight: 1.6 }}>
            {activity.watchFor}
          </p>
        </CollapsibleRow>
        <CollapsibleRow label="The one thing to say" accentStripe>
          <blockquote className="border-l-2 border-accent pl-3">
            <p
              className="text-[16px] italic text-ink"
              style={{ lineHeight: 1.55 }}
            >
              {activity.oneLineToSay}
            </p>
          </blockquote>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            Drop it once, casually. Don&apos;t repeat.
          </p>
        </CollapsibleRow>
        <CollapsibleRow label="The trap to avoid" tone="warning">
          <p className="text-[15px] text-ink" style={{ lineHeight: 1.6 }}>
            {activity.trap}
          </p>
        </CollapsibleRow>
        <CollapsibleRow label="If it's too easy or too hard">
          <p className="text-[15px] text-ink" style={{ lineHeight: 1.6 }}>
            <span className="font-extrabold">Easier:</span> {activity.adapt.easier}
          </p>
          <p
            className="mt-2 text-[15px] text-ink"
            style={{ lineHeight: 1.6 }}
          >
            <span className="font-extrabold">Harder:</span> {activity.adapt.harder}
          </p>
        </CollapsibleRow>
      </div>
    </section>
  );
}

function CollapsibleRow({
  label,
  children,
  accentStripe = false,
  tone,
}: {
  label: string;
  children: ReactNode;
  accentStripe?: boolean;
  tone?: "warning";
}) {
  const [open, setOpen] = useState(false);
  const labelColor = accentStripe
    ? "var(--accent-deep)"
    : tone === "warning"
      ? "var(--warning)"
      : "var(--ink-secondary)";

  return (
    <div
      className="relative rounded-[8px] bg-bg-elevated"
      style={{ border: "1px solid var(--line)" }}
    >
      {accentStripe ? (
        <span
          aria-hidden
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[8px] py-3.5 pl-4 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span
          className="text-[12px] font-extrabold uppercase"
          style={{ color: labelColor, letterSpacing: "0.08em" }}
        >
          {label}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className={`shrink-0 text-ink-tertiary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? <div className="px-4 pb-4 pt-1">{children}</div> : null}
    </div>
  );
}
