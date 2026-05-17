"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode, type SVGProps } from "react";

import { IntroCarousel } from "@/components/intro/IntroCarousel";

/**
 * Production intro carousel (round-2 identity). Each slide has:
 *   - one abstract line-art illustration on a soft accent disc
 *   - a bold headline (the most striking line of the copy)
 *   - one or two supporting paragraphs underneath
 *
 * Copy is hand-shaped per slide here rather than read from
 * /lib/content/intro.ts because the new design splits the original
 * single-paragraph entries into headline + body and the data shape
 * doesn't have a place for that yet.
 */
export default function IntroPage() {
  const router = useRouter();
  const finish = useCallback(() => {
    router.push("/onboarding/parent");
  }, [router]);

  const slides: ReactNode[] = [
    <Slide1 key="s1" />,
    <Slide2 key="s2" />,
    <Slide3 key="s3" />,
    <Slide4 key="s4" />,
    <Slide5 key="s5" />,
  ];

  return <IntroCarousel slides={slides} onComplete={finish} />;
}

// ---------- slide layout primitive ----------

function SlideShell({
  illustration,
  headline,
  body,
}: {
  illustration: ReactNode;
  headline: string;
  body: ReactNode;
}) {
  return (
    <article className="flex flex-col items-stretch gap-10">
      <div className="flex justify-center pt-4">
        <IllustrationDisc>{illustration}</IllustrationDisc>
      </div>
      <div className="space-y-5">
        <h2
          className="text-[26px] font-bold tracking-[-0.015em] text-ink"
          style={{ lineHeight: 1.2 }}
        >
          {headline}
        </h2>
        <div
          className="text-[18px] text-ink-secondary"
          style={{ lineHeight: 1.55 }}
        >
          {body}
        </div>
      </div>
    </article>
  );
}

function IllustrationDisc({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-[176px] w-[176px] items-center justify-center rounded-full"
      style={{ backgroundColor: "var(--accent-bg)" }}
    >
      <div className="text-ink">{children}</div>
    </div>
  );
}

// ---------- slides ----------

function Slide1() {
  return (
    <SlideShell
      illustration={<Ruler />}
      headline="School measures what's easy to measure."
      body={<p>Marks. Behavior. Speed.</p>}
    />
  );
}

function Slide2() {
  return (
    <SlideShell
      illustration={<WindingPath />}
      headline="The people who do well in life share a different list of skills."
      body={
        <p>
          How to think. How to recover. How to read other people. How to start
          something hard. How to lose. How to keep going.
        </p>
      }
    />
  );
}

function Slide3() {
  return (
    <SlideShell
      illustration={<DoorwayLight />}
      headline="These aren't taught anywhere."
      body={
        <>
          <p>
            They&apos;re built at home, in small moments, between ages 5 and
            15.
          </p>
          <p className="mt-4">
            Most parents miss them. Not because they don&apos;t care, but
            because nobody told them what the moments are.
          </p>
        </>
      }
    />
  );
}

function Slide4() {
  return (
    <SlideShell
      illustration={<DotInRing />}
      headline="One thing each day. Ten minutes."
      body={
        <>
          <p>Designed for who your child actually is.</p>
          <p className="mt-4">
            You&apos;ll know what to do, what to watch for, and what to leave
            alone.
          </p>
        </>
      }
    />
  );
}

function Slide5() {
  return (
    <SlideShell
      illustration={<PalmCradle />}
      headline="This is for you, not for them."
      body={
        <>
          <p>They&apos;ll never see this app.</p>
          <p className="mt-4">
            They&apos;ll just feel a parent who&apos;s quietly paying attention
            to the right things.
          </p>
        </>
      }
    />
  );
}

// ---------- inline SVG illustrations ----------
//
// 120×120 viewBox, single ink stroke, currentColor so they re-skin with
// the surrounding text colour. Same family used in /dev/identity Section 6.

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
  // Hint at measurement: a ruler with tick marks under a small data pulse.
  return (
    <svg {...SVG_BASE} role="img" aria-label="A ruler measuring small marks">
      <rect x={18} y={56} width={84} height={26} rx={3} />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 25 + i * 10.5;
        const long = i % 2 === 0;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={56}
            y2={56 + (long ? 11 : 7)}
          />
        );
      })}
      <polyline points="26,40 40,32 56,36 70,28 86,32 100,28" />
    </svg>
  );
}

function WindingPath() {
  // A trail meandering left to right, ending in a filled dot. Suggests the
  // journey through life skills without depicting a person.
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A path winding to a destination"
    >
      <path d="M 14 86 Q 30 56, 48 70 T 80 50 Q 92 44, 100 38" />
      <circle cx={100} cy={38} r={3.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

function DoorwayLight() {
  // A doorway shape with a soft glow inside: home, small light. The glow is
  // a single filled accent circle behind the doorway rectangle.
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A doorway with a soft glow inside"
    >
      <circle
        cx={60}
        cy={68}
        r={16}
        fill="var(--accent)"
        fillOpacity={0.22}
        stroke="none"
      />
      <path d="M 40 96 V 50 Q 40 36, 60 36 Q 80 36, 80 50 V 96" />
      <line x1={32} y1={96} x2={88} y2={96} />
    </svg>
  );
}

function DotInRing() {
  // A small filled circle held within a thin-outlined larger circle.
  // One moment held within time.
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A small moment held within a larger circle"
    >
      <circle cx={60} cy={60} r={32} />
      <circle cx={60} cy={60} r={4.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

function PalmCradle() {
  // An open cradling palm shape (no fingers) holding a single dot above.
  // No face, no body, just the gesture of holding.
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="An open palm holding a small dot"
    >
      <path d="M 18 70 Q 60 110, 102 70" />
      <circle cx={60} cy={50} r={4} fill="currentColor" stroke="none" />
    </svg>
  );
}
