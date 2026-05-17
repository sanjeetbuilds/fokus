"use client";

import { ChevronLeft, Clock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, type ReactNode } from "react";

import Button from "@/components/ui/Button";
import { getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import { useAppStore } from "@/lib/store/useAppStore";
import type {
  Activity,
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

  // URL params → store fallback. Both default to medium/normal if absent.
  const time = (searchParams?.get("time") as TimeAvailable | null) ??
    (lastPickContext?.activityId === id ? lastPickContext.time : null) ??
    "medium";
  const mood = (searchParams?.get("mood") as ChildMood | null) ??
    (lastPickContext?.activityId === id ? lastPickContext.mood : null) ??
    "normal";

  // `from=library` flips the left CTA to "Back to library"; everything else
  // (today flow, store-restored, missing) keeps "Pick another" → /today.
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
    <main className="mx-auto flex min-h-[100svh] max-w-[680px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+120px)]">
      {/* Top bar */}
      <div className="-mx-2 mb-4 flex h-9 items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
      </div>

      <ActivityHeader activity={activity} />

      <div className="mt-8 flex flex-col">
        <Section eyebrow="What you're really building">
          <p className="text-body text-ink">{activity.hiddenCurriculum}</p>
        </Section>

        <Section eyebrow="How to do it">
          <p className="whitespace-pre-line text-body leading-[1.7] text-ink">
            {activity.howTo}
          </p>
        </Section>

        <Section eyebrow="What to watch for">
          <p className="text-body text-ink">{activity.watchFor}</p>
        </Section>

        <Section eyebrow="The one thing to say">
          <blockquote className="border-l-2 border-accent pl-4">
            <p className="text-body-large italic text-ink">
              {activity.oneLineToSay}
            </p>
          </blockquote>
          <p className="mt-3 text-footnote text-ink-tertiary">
            Drop it once, casually. Don&apos;t repeat.
          </p>
        </Section>

        <Section eyebrow="The trap to avoid" tone="warning">
          <p className="text-body text-ink">{activity.trap}</p>
        </Section>

        <Section eyebrow="If it's too easy / too hard">
          <p className="text-body text-ink">
            <span className="font-semibold">Easier:</span> {activity.adapt.easier}
          </p>
          <p className="mt-3 text-body text-ink">
            <span className="font-semibold">Harder:</span> {activity.adapt.harder}
          </p>
        </Section>
      </div>

      {/* Sticky bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-line-subtle bg-bg px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
        <div className="mx-auto flex max-w-[680px] gap-3">
          <Button variant="secondary" size="lg" onClick={onLeftCta}>
            {fromLibrary ? "Back to library" : "Pick another"}
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={onLogIt}
          >
            We did it — log it →
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
      <div className="flex items-center gap-2 text-caption uppercase tracking-[0.1em] text-ink-secondary">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: skill.color }}
        />
        <span>{skill.label}</span>
        <span aria-hidden className="text-ink-quaternary">·</span>
        <span>{activity.duration} min</span>
        <span aria-hidden className="text-ink-quaternary">·</span>
        <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
      </div>

      <p className="mt-2 text-footnote text-ink-tertiary">
        builds: {skill.description}
      </p>

      <h1 className="mt-4 text-display text-ink">{activity.title}</h1>

      <div className="mt-3 flex items-center gap-3 text-footnote text-ink-secondary">
        <Clock size={14} strokeWidth={1.75} aria-hidden />
        <span>{activity.duration} min</span>
        <span aria-hidden className="text-ink-quaternary">·</span>
        <span>{DIFFICULTY_LABEL[activity.difficulty]}</span>
      </div>

      <p className="mt-5 text-body-large italic text-ink-secondary">
        {activity.description}
      </p>
    </header>
  );
}

// ---------- section primitive ----------

function Section({
  eyebrow,
  tone,
  children,
}: {
  eyebrow: string;
  tone?: "warning";
  children: ReactNode;
}) {
  const eyebrowColor =
    tone === "warning" ? "text-warning" : "text-ink-tertiary";
  return (
    <section className="border-t border-line-subtle pt-6 mt-6 first:mt-0 first:border-t-0 first:pt-0">
      <p
        className={`text-caption uppercase tracking-[0.12em] font-medium ${eyebrowColor}`}
      >
        {eyebrow}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
