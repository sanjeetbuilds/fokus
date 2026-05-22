"use client";

import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import SkillIcon from "@/components/SkillIcon";
import Wordmark from "@/components/shared/Wordmark";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getActivityById } from "@/lib/content/activities";
import { SKILLS } from "@/lib/content/skills";
import { insertActivityLog } from "@/lib/supabase/queries";
import { prependActivityLogToCache } from "@/lib/use-activity-log";
import { useChild } from "@/lib/use-child";
import type { Activity, ActivityExample } from "@/types";

/**
 * Activity detail — three-part structure, no redundancy.
 *
 *   HEADER       lg SkillIcon, title (32/800), meta row
 *   DIVIDER
 *   WHAT TO DO   heading, instruction body, "See an example" toggle
 *                (the only collapsed thing on the page)
 *   DIVIDER
 *   WHY IT WORKS heading, reason body
 *
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
  const fromContext = searchParams?.get("from") ?? null;

  const id = params?.id;
  const activity = useMemo(
    () => (id ? getActivityById(id) : undefined),
    [id],
  );

  const { child } = useChild();
  const childName = child?.name ?? null;
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  /**
   * Back behaviour: if the route was opened with ?from=<screen>, we
   * navigate explicitly to that screen via router.replace so a deep
   * link / refresh of the activity URL still returns somewhere
   * sensible. Otherwise plain router.back() pops history.
   *
   *   from=track   → /map
   *   from=library → /library
   *   from=today   → /today
   *   missing      → router.back()
   */
  const onBack = useCallback(() => {
    if (fromContext === "track") {
      router.replace("/map");
      return;
    }
    if (fromContext === "library") {
      router.replace("/library");
      return;
    }
    if (fromContext === "today") {
      router.replace("/today");
      return;
    }
    router.back();
  }, [fromContext, router]);

  const onMarkDone = useCallback(async () => {
    if (!activity || submitting) return;
    setSubmitting(true);
    try {
      const row = await insertActivityLog(activity.id);
      prependActivityLogToCache(row);
      router.push(`/done/${row.id}`);
    } catch (err) {
      console.error("[/activity] insertActivityLog:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setSubmitting(false);
    }
  }, [activity, router, submitting, toast]);

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
    <main className="mx-auto flex min-h-[100svh] max-w-[680px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+144px)]">
      {/* Top bar: Back left, Wordmark (no dot on this page) right */}
      <div className="-mx-2 mb-6 flex h-9 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-[15px] text-ink-secondary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
        <Wordmark size="sm" noDot />
      </div>

      <ActivityHeader activity={activity} />

      <SectionWhatToDo
        activity={activity}
        childName={childName ?? "your child"}
      />

      <Divider />

      <SectionWhyItWorks activity={activity} />

      {/* Sticky bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3"
        style={{
          borderTop: "1px solid #E5E3DA",
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "saturate(180%) blur(12px)",
          WebkitBackdropFilter: "saturate(180%) blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-[680px]">
          <button
            type="button"
            onClick={onMarkDone}
            disabled={submitting}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition-opacity duration-fast ease-out active:opacity-80 disabled:opacity-60"
            style={{
              background: "#252630",
            }}
          >
            {submitting ? "Saving…" : "Mark done"}
          </button>
        </div>
      </div>
    </main>
  );
}

// ---------- header ----------

function ActivityHeader({ activity }: { activity: Activity }) {
  const skill = SKILLS[activity.skill];
  const [minAge, maxAge] = activity.ageRange;
  // 8-digit hex: hex + "14" ≈ 8% alpha wash. Browsers support #RRGGBBAA.
  const tint = `${skill.color}14`;
  return (
    <header
      style={{
        // Bleed past main's px-5 (20px) so the zone spans full width.
        margin: "0 -20px 28px -20px",
        padding: "32px 24px 28px 24px",
        background: tint,
      }}
    >
      {/* Animated skill aura — three expanding rings, a soft glow,
          and three orbiting dots, all tinted with the skill colour
          via --aura-color. Reference: onboarding slide 3 + skill
          detail. Honours prefers-reduced-motion. */}
      <div
        className="fokus-aura"
        style={
          { ["--aura-color" as string]: skill.color } as React.CSSProperties
        }
      >
        <span aria-hidden className="fokus-aura-glow" />
        <span aria-hidden className="fokus-aura-ring" />
        <span aria-hidden className="fokus-aura-ring d2" />
        <span aria-hidden className="fokus-aura-ring d3" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SkillIcon
            skillId={activity.skill}
            size="lg"
            iconName={activity.iconName}
          />
        </div>
        <div aria-hidden className="fokus-aura-orbits">
          <span className="fokus-aura-orb o1" />
          <span className="fokus-aura-orb o2" />
          <span className="fokus-aura-orb o3" />
        </div>
      </div>

      <h1
        style={{
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          color: "#252630",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {activity.title}
      </h1>

      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          color: "#8E8D9B",
          lineHeight: 1.5,
        }}
      >
        {skill.label}
        <span style={{ color: "#C8C8C8", padding: "0 6px" }}>·</span>
        {activity.duration} min
        <span style={{ color: "#C8C8C8", padding: "0 6px" }}>·</span>
        ages {minAge}-{maxAge}
      </p>
    </header>
  );
}

function Divider() {
  return (
    <hr
      style={{
        marginTop: 28,
        marginBottom: 28,
        border: 0,
        borderTop: "1px solid #E5E3DA",
      }}
    />
  );
}

// ---------- What to do ----------

function SectionWhatToDo({
  activity,
  childName,
}: {
  activity: Activity;
  childName: string;
}) {
  const hasExample = activity.example.exchange.length > 0;
  return (
    <section>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#252630",
          letterSpacing: "-0.005em",
        }}
      >
        What to do
      </h2>
      <p
        className="whitespace-pre-line"
        style={{
          marginTop: 12,
          fontSize: 15,
          fontWeight: 400,
          color: "#252630",
          lineHeight: 1.55,
        }}
      >
        {activity.howTo}
      </p>
      {hasExample ? (
        <ExampleToggle example={activity.example} childName={childName} />
      ) : null}
    </section>
  );
}

function ExampleToggle({
  example,
  childName,
}: {
  example: ActivityExample;
  childName: string;
}) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid #E5E3DA",
          background: "#FFFFFF",
          color: "#8E8D9B",
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        <span>See an example</span>
        <Chevron size={14} strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <ExampleBody example={example} childName={childName} />
      ) : null}
    </div>
  );
}

function ExampleBody({
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
      style={{
        marginTop: 12,
        paddingLeft: 16,
        borderLeft: "2px solid #E5E3DA",
      }}
    >
      {example.setup ? (
        <p
          style={{
            fontSize: 14,
            color: "#8E8D9B",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {fill(example.setup)}
        </p>
      ) : null}
      <dl style={{ marginTop: example.setup ? 10 : 0 }}>
        {example.exchange.map((turn, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              marginTop: i === 0 ? 0 : 6,
            }}
          >
            <dt
              style={{
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#252630",
                lineHeight: 1.6,
              }}
            >
              {turn.speaker === "you" ? "You:" : `${childName}:`}
            </dt>
            <dd
              style={{
                fontSize: 14,
                color: "#8E8D9B",
                lineHeight: 1.6,
              }}
            >
              {fill(turn.line)}
            </dd>
          </div>
        ))}
      </dl>
      {example.closing ? (
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "#8E8D9B",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {fill(example.closing)}
        </p>
      ) : null}
    </div>
  );
}

// ---------- Why it works ----------

function SectionWhyItWorks({ activity }: { activity: Activity }) {
  return (
    <section>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#252630",
          letterSpacing: "-0.005em",
        }}
      >
        Why it works
      </h2>
      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          fontWeight: 400,
          color: "#252630",
          lineHeight: 1.55,
        }}
      >
        {activity.hiddenCurriculum}
      </p>
    </section>
  );
}
