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
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-[15px] font-medium text-ink-secondary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
        <Wordmark size="sm" />
      </div>

      <ActivityHeader activity={activity} />

      {/* Hero How To card */}
      <HeroHowTo text={activity.howTo} />

      {/* Worked example: what this looks like at your kitchen table */}
      <ExampleCard
        example={activity.example}
        childName={childName ?? "your child"}
      />

      {/* Collapsible details */}
      <div className="mt-3 flex flex-col gap-2.5">
        <CollapsibleCard label="What you're really building">
          <p className="text-body text-ink" style={{ lineHeight: 1.6 }}>
            {activity.hiddenCurriculum}
          </p>
        </CollapsibleCard>

        <CollapsibleCard label="What to watch for">
          <p className="text-body text-ink" style={{ lineHeight: 1.6 }}>
            {activity.watchFor}
          </p>
        </CollapsibleCard>

        <CollapsibleCard label="The one thing to say" accentStripe>
          <blockquote className="border-l-2 border-accent pl-4">
            <p className="text-body-large italic text-ink">
              {activity.oneLineToSay}
            </p>
          </blockquote>
          <p className="mt-3 text-[13px] text-ink-tertiary">
            Drop it once, casually. Don&apos;t repeat.
          </p>
        </CollapsibleCard>

        <CollapsibleCard label="The trap to avoid" tone="warning">
          <p className="text-body text-ink" style={{ lineHeight: 1.6 }}>
            {activity.trap}
          </p>
        </CollapsibleCard>

        <CollapsibleCard label="If it's too easy / too hard">
          <p className="text-body text-ink">
            <span className="font-semibold">Easier:</span>{" "}
            {activity.adapt.easier}
          </p>
          <p className="mt-3 text-body text-ink">
            <span className="font-semibold">Harder:</span>{" "}
            {activity.adapt.harder}
          </p>
        </CollapsibleCard>
      </div>

      {/* Sticky bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-line-subtle bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="mx-auto flex max-w-[680px] gap-3">
          <Button variant="secondary" size="lg" onClick={onLeftCta}>
            {fromLibrary ? "Back to library" : "Pick another"}
          </Button>
          <Button size="lg" className="flex-1" onClick={onLogIt}>
            We did it →
          </Button>
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
      {/* Big skill-coloured icon hero showing the activity's own glyph. */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[20px]"
        style={{
          backgroundColor: skill.color,
          color: "#FFFFFF",
        }}
      >
        <ActivityIcon
          iconName={activity.iconName}
          skill={activity.skill}
          size={36}
          strokeWidth={1.75}
        />
      </div>

      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-secondary">
        <span style={{ color: skill.color }}>{skill.label}</span>
        <span className="text-ink-quaternary"> · </span>
        <span>{activity.duration} min</span>
        <span className="text-ink-quaternary"> · </span>
        <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
      </p>

      <h1
        className="mt-3 font-display text-[40px] font-semibold tracking-[-0.02em] text-ink"
        style={{ lineHeight: 1.05 }}
      >
        {activity.title}
      </h1>

      <p
        className="mt-4 text-[19px] italic text-ink-secondary"
        style={{ lineHeight: 1.5 }}
      >
        {activity.description}
      </p>

      <div className="mt-5">
        <p
          className="text-[11px] font-semibold uppercase text-ink-tertiary"
          style={{ letterSpacing: "0.1em" }}
        >
          What this builds
        </p>
        <p
          className="mt-1.5 text-[14px] italic text-ink-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {skill.description}
        </p>
      </div>
    </header>
  );
}

// ---------- hero "How to do it" card ----------

function HeroHowTo({ text }: { text: string }) {
  return (
    <div className="mt-8 rounded-[18px] bg-bg-elevated p-6 shadow-md">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-mid">
        How to do it
      </p>
      <p
        className="mt-3 whitespace-pre-line text-[17px] text-ink"
        style={{ lineHeight: 1.65 }}
      >
        {text}
      </p>
    </div>
  );
}

// ---------- worked example ----------

function ExampleCard({
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
    <div className="mt-3 rounded-[18px] bg-bg-elevated p-6 shadow-md">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-mid">
        Example
      </p>

      <p
        className="mt-3 text-[16px] italic text-ink-secondary"
        style={{ lineHeight: 1.55 }}
      >
        {fill(example.setup)}
      </p>

      <dl className="mt-4 flex flex-col gap-2.5">
        {example.exchange.map((turn, i) => (
          <div key={i} className="flex gap-2">
            <dt
              className={`shrink-0 text-[15px] ${
                turn.speaker === "you"
                  ? "font-semibold text-ink"
                  : "text-ink-secondary"
              }`}
            >
              {turn.speaker === "you" ? "You" : childName}:
            </dt>
            <dd
              className={`text-[15px] ${
                turn.speaker === "you"
                  ? "font-semibold text-ink"
                  : "font-normal text-ink-secondary"
              }`}
              style={{ lineHeight: 1.55 }}
            >
              {fill(turn.line)}
            </dd>
          </div>
        ))}
      </dl>

      {example.closing ? (
        <p
          className="mt-5 border-t border-line-subtle pt-4 text-[15px] italic text-ink-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {fill(example.closing)}
        </p>
      ) : null}
    </div>
  );
}

// ---------- collapsible section ----------

function CollapsibleCard({
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
    ? "text-accent"
    : tone === "warning"
      ? "text-warning"
      : "text-ink-secondary";

  return (
    <div className="relative rounded-[14px] bg-bg-elevated shadow-md transition-shadow duration-fast ease-out">
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
        className="flex w-full items-center justify-between rounded-[14px] py-4 pl-5 pr-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span
          className={`text-[13px] font-semibold uppercase tracking-[0.12em] ${labelColor}`}
        >
          {label}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          aria-hidden
          className={`shrink-0 text-ink-tertiary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="px-5 pb-5 pt-1">{children}</div>
      ) : null}
    </div>
  );
}
