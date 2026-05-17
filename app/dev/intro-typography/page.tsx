"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { IntroCarousel } from "@/components/intro/IntroCarousel";

/**
 * Typography pass — same five INTRO_SCREENS, presented with editorial weight:
 *   - serif type at ~32–40px
 *   - one emphasized phrase per slide (accent-bar pull-quote treatment)
 *   - one abstract visual per slide (geometry, no illustration)
 *
 * /dev only — not part of the production gate. Compare in /dev/intro-compare.
 */
export default function IntroTypographyPage() {
  const router = useRouter();
  const finish = useCallback(() => {
    router.push("/onboarding/parent");
  }, [router]);

  const slides: ReactNode[] = [
    <Slide1Measures key="s1" />,
    <Slide2DifferentList key="s2" />,
    <Slide3AgeRange key="s3" />,
    <Slide4OneMoment key="s4" />,
    <Slide5Closing key="s5" />,
  ];

  return <IntroCarousel slides={slides} onComplete={finish} />;
}

// ---------- shared pieces ----------

const SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, Cambria, "Times New Roman", Times, serif';

function Lede({ children }: { children: ReactNode }) {
  return (
    <p
      style={{ fontFamily: SERIF }}
      className="text-[28px] leading-[1.35] tracking-[-0.01em] text-ink"
    >
      {children}
    </p>
  );
}

function PullQuote({ children }: { children: ReactNode }) {
  return (
    <span className="border-l-2 border-accent pl-3 text-ink">{children}</span>
  );
}

// ---------- slides ----------

function Slide1Measures() {
  return (
    <article className="flex flex-col items-start gap-10">
      {/* Three small horizontal bars at the top — abstract "what school measures" */}
      <div className="w-full max-w-[280px] space-y-3">
        {(["Marks", "Behavior", "Speed"] as const).map((label) => (
          <div
            key={label}
            className="flex items-center gap-3 text-caption uppercase tracking-[0.12em] text-ink-tertiary"
          >
            <div className="h-[2px] flex-1 bg-line" />
            <span className="w-[64px] shrink-0 text-right">{label}</span>
          </div>
        ))}
      </div>

      <Lede>
        School measures{" "}
        <PullQuote>what&apos;s easy to measure.</PullQuote> Marks. Behavior.
        Speed.
      </Lede>
    </article>
  );
}

function Slide2DifferentList() {
  return (
    <article className="flex flex-col gap-8">
      <Lede>
        But the people who do well in life — not just careers, life — usually
        share{" "}
        <PullQuote>a different list of skills.</PullQuote>
      </Lede>
      <p
        style={{ fontFamily: SERIF }}
        className="text-[20px] leading-[1.55] text-ink-secondary"
      >
        How to think. How to recover. How to read other people. How to start
        something hard. How to lose. How to keep going.
      </p>
    </article>
  );
}

function Slide3AgeRange() {
  // Visual: a horizontal axis from 5 to 15, with the middle highlighted with
  // a soft accent band. Pure CSS — no SVG required.
  return (
    <article className="flex flex-col gap-10">
      <div>
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-line">
          {/* Highlight band — roughly middle 60% */}
          <div className="absolute left-[18%] top-0 h-full w-[64%] bg-accent/30" />
        </div>
        <div className="mt-3 flex justify-between text-caption uppercase tracking-[0.12em] text-ink-tertiary">
          <span>Age 5</span>
          <span>Age 15</span>
        </div>
      </div>

      <Lede>
        These aren&apos;t taught anywhere. They&apos;re built at home, in small
        moments,{" "}
        <PullQuote>between ages 5 and 15.</PullQuote>
      </Lede>

      <p
        style={{ fontFamily: SERIF }}
        className="text-[18px] leading-[1.55] text-ink-secondary"
      >
        Most parents miss them — not because they don&apos;t care, but because
        nobody told them what the moments are.
      </p>
    </article>
  );
}

function Slide4OneMoment() {
  return (
    <article className="flex flex-col items-center gap-10 text-center">
      {/* A single ring + dot, with the phrase orbiting */}
      <div className="relative h-[120px] w-[120px]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border border-line"
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        />
        <p
          aria-hidden
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-caption uppercase tracking-[0.16em] text-ink-tertiary"
        >
          one moment a day
        </p>
      </div>

      <Lede>
        Fokus gives you{" "}
        <PullQuote>one thing to focus on each day.</PullQuote> Ten minutes.
        Designed for who your child actually is.
      </Lede>

      <p
        style={{ fontFamily: SERIF }}
        className="text-[18px] leading-[1.55] text-ink-secondary"
      >
        You&apos;ll know what you&apos;re building, what to watch for, and what
        to leave alone.
      </p>
    </article>
  );
}

function Slide5Closing() {
  // Just typography — no visual.
  return (
    <article className="flex flex-col gap-8 text-center">
      <p
        style={{ fontFamily: SERIF }}
        className="text-[32px] leading-[1.3] tracking-[-0.015em] text-ink"
      >
        This is a tool{" "}
        <PullQuote>for you, not for them.</PullQuote>
      </p>
      <p
        style={{ fontFamily: SERIF }}
        className="text-[20px] leading-[1.55] text-ink-secondary"
      >
        They&apos;ll never see this app. They&apos;ll just feel a parent
        who&apos;s quietly paying attention to the right things.
      </p>
    </article>
  );
}
