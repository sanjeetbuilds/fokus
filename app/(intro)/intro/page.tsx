"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode, type SVGProps } from "react";

import { IntroCarousel } from "@/components/intro/IntroCarousel";
import { INTRO_SCREENS, type IntroScreen } from "@/lib/content/intro";

/**
 * Production intro carousel. Three screens, each with:
 *   - one abstract line-art illustration on a soft accent disc
 *   - a Fraunces title (centered, weight 500, ~32px)
 *   - a Inter body line (centered, ink-secondary)
 *
 * Screens 1 and 2 use the standard "Skip + arrow" bottom row provided
 * by IntroCarousel. Screen 3 collapses the row into a single
 * full-width "Set up Fokus →" CTA (handled inside IntroCarousel).
 */
export default function IntroPage() {
  const router = useRouter();
  const finish = useCallback(() => {
    router.push("/onboarding/parent");
  }, [router]);

  const illustrations: ReactNode[] = [
    <Ruler key="i1" />,
    <WindingPath key="i2" />,
    <DoorwayRays key="i3" />,
  ];

  const slides = INTRO_SCREENS.map((screen, i) => (
    <Slide
      key={screen.id}
      screen={screen}
      illustration={illustrations[i]}
    />
  ));

  return (
    <IntroCarousel
      slides={slides}
      onComplete={finish}
      finishLabel="Set up Fokus"
    />
  );
}

// ---------- slide layout ----------

function Slide({
  screen,
  illustration,
}: {
  screen: IntroScreen;
  illustration: ReactNode;
}) {
  return (
    <article className="flex flex-col items-center gap-10 pt-2 text-center">
      <IllustrationDisc>{illustration}</IllustrationDisc>
      <div className="space-y-4">
        <h2
          className="font-display text-[32px] font-medium tracking-[-0.01em] text-ink"
          style={{ lineHeight: 1.15 }}
        >
          {screen.title}
        </h2>
        <p
          className="text-[17px] text-ink-secondary"
          style={{ lineHeight: 1.5 }}
        >
          {screen.body}
        </p>
      </div>
    </article>
  );
}

function IllustrationDisc({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[180px] w-[180px] items-center justify-center rounded-full"
      style={{ backgroundColor: "var(--accent-bg)" }}
    >
      <div className="text-ink">{children}</div>
    </div>
  );
}

// ---------- SVG illustrations ----------

const SVG_BASE: SVGProps<SVGSVGElement> = {
  width: 120,
  height: 120,
  viewBox: "0 0 120 120",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Ruler() {
  // Slide 1 — a horizontal ruler with three tick marks above the bar,
  // each labelled in tiny text: marks / behavior / speed.
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A ruler with marks, behavior, and speed labels"
    >
      <rect x={14} y={62} width={92} height={18} rx={3} />
      <line x1={32} y1={52} x2={32} y2={62} />
      <line x1={60} y1={52} x2={60} y2={62} />
      <line x1={88} y1={52} x2={88} y2={62} />
      {/* One centered label with middots — three separate <text> tags at
          x=32/60/88 collide at fontSize 8 in this 120-wide viewBox because
          the inherited Fraunces face is wider than the tick spacing. */}
      <text
        x={60}
        y={44}
        textAnchor="middle"
        fontSize="8"
        fontFamily="inherit"
        fill="currentColor"
        stroke="none"
      >
        marks · behavior · speed
      </text>
    </svg>
  );
}

function WindingPath() {
  // Slide 2 — a curving path from lower-left to upper-right with a
  // small filled dot at the destination. Reads as "a journey to who
  // your child becomes."
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A path winding to a destination"
    >
      <path d="M 14 88 Q 32 60, 50 72 T 82 50 Q 92 44, 102 40" />
      <circle
        cx={102}
        cy={40}
        r={4}
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function DoorwayRays() {
  // Slide 3 — a small doorway with a few light rays radiating outward.
  // The rays use a softer ink-tertiary so the door reads as primary.
  const rays = [
    { x1: 60, y1: 28, x2: 60, y2: 12 },
    { x1: 76, y1: 36, x2: 92, y2: 22 },
    { x1: 44, y1: 36, x2: 28, y2: 22 },
    { x1: 84, y1: 50, x2: 100, y2: 50 },
    { x1: 36, y1: 50, x2: 20, y2: 50 },
  ];
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A small open doorway with light rays"
    >
      {/* Rays first (under the door outline) */}
      {rays.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke="var(--ink-tertiary)"
          strokeWidth={1.25}
        />
      ))}
      {/* Doorway: arched top, two vertical jambs, ground line */}
      <path d="M 44 100 V 60 Q 44 46, 60 46 Q 76 46, 76 60 V 100" />
      <line x1={38} y1={100} x2={82} y2={100} />
    </svg>
  );
}
