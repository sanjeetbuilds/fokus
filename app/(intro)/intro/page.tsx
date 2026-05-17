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
      illustration={<Silhouettes />}
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
      illustration={<ScatteredMoments />}
      headline="These aren't taught anywhere."
      body={
        <>
          <p>
            They&apos;re built at home — in small moments, between ages 5 and
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
      illustration={<HandWithDot />}
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
      illustration={<TwoFigures />}
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
  // Hint at "measurement" — a ruler with tick marks under a small data pulse.
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

function Silhouettes() {
  // Three abstract figures, centered slightly taller — "a different list".
  return (
    <svg {...SVG_BASE} role="img" aria-label="Three figures">
      {[26, 60, 94].map((cx, i) => {
        const headR = i === 1 ? 9 : 7;
        const shoulderW = i === 1 ? 26 : 22;
        return (
          <g key={cx}>
            <circle cx={cx} cy={48} r={headR} />
            <path
              d={`M ${cx - shoulderW / 2} ${100} Q ${cx} ${64}, ${cx + shoulderW / 2} ${100}`}
            />
          </g>
        );
      })}
      <line x1={14} x2={106} y1={110} y2={110} strokeDasharray="2 4" />
    </svg>
  );
}

function ScatteredMoments() {
  // A scattered arc of dots — small moments along a gentle curve, not a
  // ruler. One dot in the accent colour to suggest the moment you're in.
  const dots: Array<{ x: number; y: number; r: number; accent?: boolean }> = [
    { x: 18, y: 78, r: 2 },
    { x: 28, y: 64, r: 2.5 },
    { x: 38, y: 54, r: 2 },
    { x: 48, y: 47, r: 3 },
    { x: 58, y: 44, r: 2.5 },
    { x: 64, y: 50, r: 2 },
    { x: 72, y: 44, r: 3.5, accent: true },
    { x: 82, y: 50, r: 2 },
    { x: 90, y: 60, r: 2.5 },
    { x: 100, y: 74, r: 2 },
  ];
  return (
    <svg
      {...SVG_BASE}
      role="img"
      aria-label="A scattered arc of small moments"
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={d.accent ? "var(--accent)" : "currentColor"}
          stroke="none"
        />
      ))}
    </svg>
  );
}

function HandWithDot() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="A cupped hand holding a small moment">
      <path d="M 22 72 Q 60 110, 98 72" />
      <line x1={22} y1={72} x2={22} y2={58} />
      <line x1={98} y1={72} x2={98} y2={58} />
      <circle cx={60} cy={36} r={3.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwoFigures() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="A parent and child, abstract">
      <circle cx={44} cy={46} r={9} />
      <path d="M 28 98 Q 44 62, 60 98" />
      <circle cx={80} cy={58} r={7} />
      <path d="M 68 98 Q 80 72, 92 98" />
      <line x1={18} x2={102} y1={108} y2={108} strokeDasharray="2 4" />
    </svg>
  );
}
