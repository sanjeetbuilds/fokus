"use client";

/**
 * /dev/identity: Visual identity preview.
 *
 * INTERNAL ONLY. This page exists so the new warm-cream / bold-wordmark
 * identity can be reviewed in one scrollable view BEFORE any production
 * screen is touched. It does not import production primitives (Button,
 * Chip, etc.) so the preview can't accidentally drift back toward the
 * old visual system.
 *
 * Palette is applied as inline CSS variable overrides on the page root.
 * Anything in this tree using bg-bg / text-ink / text-accent / etc. picks
 * up the new values automatically; nothing outside this page is affected.
 *
 * Constraints honoured here (do not violate when propagating):
 *   - No "Level N" anywhere
 *   - No "Exercise". Say "moment" or "activity"
 *   - No "Building [child]". Say "Today with [child]"
 *   - No progress bar showing the child's "level"
 *   - No streaks / badges / achievements / wins
 */

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// ---------- palette ----------

const PALETTE = {
  bg: "#FFFFFF",
  bgElevated: "#FFFFFF",
  ink: "#1A1A1A",
  inkSecondary: "#6B6B6B",
  inkTertiary: "#8A8A8A",
  line: "#EEEEEE",
  lineSubtle: "#F2F2F2",
  accent: "#A8A4E8",
  accentPressed: "#8E89D6",
  accentBg: "#F1F0FC",
  accentDeep: "#6B5B95",
  warning: "#8A6B12",
  success: "#3F7A3D",
  danger: "#B85738",
} as const;

// Display sans stack: Inter if loaded, otherwise the platform display family.
const FONT_STACK =
  '"Inter", system-ui, -apple-system, "Segoe UI Variable", "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

// Cast through CSSProperties so the custom-property keys typecheck.
const PALETTE_VARS = {
  "--bg": PALETTE.bg,
  "--bg-elevated": PALETTE.bgElevated,
  "--ink": PALETTE.ink,
  "--ink-secondary": PALETTE.inkSecondary,
  "--ink-tertiary": PALETTE.inkTertiary,
  "--line": PALETTE.line,
  "--line-subtle": PALETTE.lineSubtle,
  "--accent": PALETTE.accent,
  "--accent-pressed": PALETTE.accentPressed,
  "--accent-bg": PALETTE.accentBg,
  "--accent-deep": PALETTE.accentDeep,
  "--warning": PALETTE.warning,
  "--success": PALETTE.success,
  "--danger": PALETTE.danger,
  fontFamily: FONT_STACK,
} as CSSProperties;

// ---------- entry ----------

export default function IdentityDevPage() {
  return (
    <main style={PALETTE_VARS} className="min-h-[100svh] bg-bg text-ink">
      <div className="mx-auto max-w-[480px] px-5 pb-20">
        <TopBar />
        <Section1Palette />
        <Section2Type />
        <Section3Today />
        <Section4Activity />
        <Section5Intro />
        <Section6Illustrations />
      </div>
    </main>
  );
}

// ---------- chrome ----------

function TopBar() {
  return (
    <div className="flex items-center justify-between pt-5">
      <Link
        href="/dev/ui"
        className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-[13px] font-extrabold text-ink-secondary hover:text-ink"
      >
        <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        back to dev
      </Link>
      <WordmarkSmall />
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink-tertiary"
    >
      {children}
    </p>
  );
}

function SectionDivider() {
  return <div className="my-16 h-px w-full bg-line" />;
}

// ---------- wordmark ----------

function WordmarkHero() {
  return (
    <div className="flex items-baseline gap-3">
      <span
        aria-hidden
        className="inline-block h-3 w-3 translate-y-[-6px] rounded-full"
        style={{ backgroundColor: "var(--accent)" }}
      />
      <span
        className="text-[64px] font-extrabold uppercase tracking-[-0.04em] text-accent"
        style={{ lineHeight: 1 }}
      >
        Fokus
      </span>
    </div>
  );
}

function WordmarkSmall() {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full"
        style={{ backgroundColor: "var(--accent)" }}
      />
      <span className="text-[18px] font-extrabold uppercase tracking-[-0.02em] text-accent">
        Fokus
      </span>
    </span>
  );
}

// ============================================================
// Section 1: wordmark + palette
// ============================================================

function Section1Palette() {
  return (
    <section className="mt-12">
      <Eyebrow>Section 1: Wordmark &amp; Palette</Eyebrow>
      <div className="mt-6 space-y-10">
        <div>
          <WordmarkHero />
          <p className="mt-3 text-[13px] text-ink-tertiary">
            Hero · 64px · weight 800 · tracking −0.04em
          </p>
        </div>
        <div>
          <WordmarkSmall />
          <p className="mt-3 text-[13px] text-ink-tertiary">
            Header · 18px · weight 700 · tracking −0.02em
          </p>
        </div>

        <PaletteRow />
      </div>
    </section>
  );
}

function PaletteRow() {
  const swatches: { label: string; value: string; border?: boolean }[] = [
    { label: "bg", value: PALETTE.bg, border: true },
    { label: "bg-elev", value: PALETTE.bgElevated, border: true },
    { label: "ink", value: PALETTE.ink },
    { label: "ink-sec", value: PALETTE.inkSecondary },
    { label: "line", value: PALETTE.line, border: true },
    { label: "accent", value: PALETTE.accent },
    { label: "accent-bg", value: PALETTE.accentBg, border: true },
    { label: "warning", value: PALETTE.warning },
  ];

  return (
    <div className="grid grid-cols-8 gap-2">
      {swatches.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1.5">
          <div
            className="h-12 w-full rounded-md"
            style={{
              backgroundColor: s.value,
              boxShadow: s.border ? "inset 0 0 0 1px var(--line)" : undefined,
            }}
          />
          <span className="text-[10px] font-extrabold text-ink">{s.label}</span>
          <span className="text-[9px] font-mono text-ink-tertiary">
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Section 2: type scale
// ============================================================

function Section2Type() {
  return (
    <>
      <SectionDivider />
      <section>
        <Eyebrow>Section 2: Type Scale</Eyebrow>
        <div className="mt-8 space-y-8">
          <TypeRow label="Display · 44px · 700 · tracking −0.02em">
            <h2
              className="text-[44px] font-extrabold tracking-[-0.02em] text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Today with Leo
            </h2>
          </TypeRow>

          <TypeRow label="Page title · 32px · 700">
            <h2
              className="text-[32px] font-extrabold tracking-[-0.02em] text-ink"
              style={{ lineHeight: 1.1 }}
            >
              All activities
            </h2>
          </TypeRow>

          <TypeRow label="Section title · 22px · 600">
            <h3 className="text-[22px] font-extrabold leading-[1.2] text-ink">
              What you&apos;re really building
            </h3>
          </TypeRow>

          <TypeRow label="Headline · 17px · 600">
            <p className="text-[17px] font-extrabold leading-[1.35] text-ink">
              The Why Chain
            </p>
          </TypeRow>

          <TypeRow label="Body · 17px · 400 · line-height 1.6">
            <p className="text-[17px] text-ink" style={{ lineHeight: 1.6 }}>
              Pick anything Leo points to today and ask &ldquo;why&rdquo; five
              times together.
            </p>
          </TypeRow>

          <TypeRow label="Caption · 13px · 500 · ink-secondary">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink-secondary">
              Curiosity · 10 min
            </p>
          </TypeRow>
        </div>
      </section>
    </>
  );
}

function TypeRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-tertiary">
        {label}
      </p>
      {children}
    </div>
  );
}

// ============================================================
// Section 3: Today mockup
// ============================================================

function Section3Today() {
  return (
    <>
      <SectionDivider />
      <section>
        <Eyebrow>Section 3: Today screen (mockup)</Eyebrow>

        <PhoneFrame>
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <WordmarkSmall />
            <button
              type="button"
              aria-label="Menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary hover:text-ink"
            >
              <Menu size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </div>

          {/* Body */}
          <div className="mt-8">
            <p className="text-[13px] font-extrabold text-ink-secondary">
              Wednesday, 14 May
            </p>
            <h1
              className="mt-2 text-[44px] font-extrabold tracking-[-0.02em] text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Today with Leo
            </h1>

            <div className="mt-7 h-px w-full bg-line-subtle" />

            <div className="mt-7">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-tertiary">
                Time available
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MockChip>5-10 min</MockChip>
                <MockChip selected>10-20 min</MockChip>
                <MockChip>20-30 min</MockChip>
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-tertiary">
                Leo&apos;s energy
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MockChip>Low</MockChip>
                <MockChip selected>Normal</MockChip>
                <MockChip>High</MockChip>
              </div>
            </div>

            <div className="mt-16">
              <MockPrimary>Find today&apos;s moment →</MockPrimary>
            </div>
          </div>
        </PhoneFrame>
      </section>
    </>
  );
}

function MockChip({
  children,
  selected = false,
}: {
  children: ReactNode;
  selected?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-11 select-none items-center rounded-full px-5 text-[15px] font-extrabold ${
        selected
          ? "bg-accent text-white"
          : "border border-line bg-bg text-ink"
      }`}
    >
      {children}
    </span>
  );
}

function MockPrimary({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-14 w-full select-none items-center justify-center rounded-[14px] bg-accent text-[17px] font-extrabold text-white"
      style={{ boxShadow: "0 6px 16px rgba(58, 79, 204, 0.25)" }}
    >
      {children}
    </div>
  );
}

function MockSecondary({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-14 select-none items-center justify-center rounded-[14px] border border-line bg-bg-elevated px-5 text-[16px] font-extrabold text-ink">
      {children}
    </div>
  );
}

// ============================================================
// Section 4: Activity detail mockup
// ============================================================

function Section4Activity() {
  return (
    <>
      <SectionDivider />
      <section>
        <Eyebrow>Section 4: Activity detail (mockup)</Eyebrow>

        <PhoneFrame>
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Back"
              className="inline-flex h-9 items-center gap-1 rounded-md px-1 text-[15px] font-extrabold text-ink-secondary"
            >
              <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
              Back
            </button>
            <WordmarkSmall />
          </div>

          {/* Big icon square */}
          <div className="mt-6">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-[20px]"
              style={{
                backgroundColor: "var(--accent-bg)",
                boxShadow:
                  "0 8px 24px rgba(58, 79, 204, 0.12), inset 0 0 0 1px rgba(58,79,204,0.04)",
              }}
            >
              <Sparkles
                size={36}
                strokeWidth={1.75}
                aria-hidden
                style={{ color: "var(--accent)" }}
              />
            </div>
          </div>

          <p className="mt-5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-secondary">
            Curiosity · 10 min · Medium
          </p>

          <h1
            className="mt-3 text-[40px] font-extrabold tracking-[-0.02em] text-ink"
            style={{ lineHeight: 1.05 }}
          >
            The Why Chain
          </h1>

          <p className="mt-4 text-[19px] italic text-ink-secondary" style={{ lineHeight: 1.5 }}>
            Pick anything Leo points to today and ask &ldquo;why&rdquo; five
            times together.
          </p>

          {/* Hero "How to" card */}
          <div
            className="mt-8 rounded-[18px] p-6"
            style={{
              backgroundColor: "var(--bg-elevated)",
              boxShadow: "inset 0 0 0 1px var(--line-subtle)",
            }}
          >
            <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-accent">
              How to do it
            </p>
            <p
              className="mt-3 text-[17px] text-ink"
              style={{ lineHeight: 1.6 }}
            >
              Choose something Leo notices: a fan, a bird, traffic. Ask
              &ldquo;Why does it work like that?&rdquo; When he answers, ask
              &ldquo;But why does THAT happen?&rdquo; Continue 5 times. If he
              says &ldquo;I don&apos;t know,&rdquo; respond:{" "}
              &ldquo;Great, let&apos;s think about it together.&rdquo; Never
              give the answer first.
            </p>
          </div>

          {/* Collapsible cards stack */}
          <div className="mt-4 flex flex-col gap-2.5">
            <ClosedCard label="What you’re really building" />
            <ClosedCard label="What to watch for" />
            <ClosedCard label="The one thing to say" accentStripe />
            <ClosedCard label="The trap to avoid" />
            <ClosedCard label="If it’s too easy / too hard" />
          </div>

          {/* Sticky-style bottom buttons */}
          <div className="mt-8 grid grid-cols-[auto_1fr] gap-3">
            <MockSecondary>Pick another</MockSecondary>
            <MockPrimary>We did it →</MockPrimary>
          </div>
        </PhoneFrame>
      </section>
    </>
  );
}

function ClosedCard({
  label,
  accentStripe = false,
}: {
  label: string;
  accentStripe?: boolean;
}) {
  return (
    <div
      className="relative flex h-14 items-center justify-between rounded-[14px] pl-5 pr-4"
      style={{
        backgroundColor: "var(--bg-elevated)",
        boxShadow: "inset 0 0 0 1px var(--line-subtle)",
      }}
    >
      {accentStripe ? (
        <span
          aria-hidden
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      ) : null}
      <span
        className={`text-[13px] font-extrabold uppercase tracking-[0.12em] ${
          accentStripe ? "text-accent" : "text-ink-secondary"
        }`}
      >
        {label}
      </span>
      <ChevronRight
        size={18}
        strokeWidth={1.75}
        aria-hidden
        className="text-ink-tertiary"
      />
    </div>
  );
}

// ============================================================
// Section 5: Intro Screen 3 redesigned
// ============================================================

function Section5Intro() {
  return (
    <>
      <SectionDivider />
      <section>
        <Eyebrow>Section 5: Intro screen 3 (redesigned)</Eyebrow>

        <PhoneFrame tall>
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <WordmarkSmall />
            <span aria-hidden className="h-9" />
          </div>

          {/* Generous top space */}
          <div className="mt-16 flex justify-center">
            <AxisIllustration />
          </div>

          {/* Body text: bigger, looser */}
          <div className="mt-12 space-y-5">
            <p
              className="text-[24px] font-extrabold tracking-[-0.01em] text-ink"
              style={{ lineHeight: 1.25 }}
            >
              These aren&apos;t taught anywhere.
            </p>
            <p
              className="text-[19px] text-ink-secondary"
              style={{ lineHeight: 1.55 }}
            >
              They&apos;re built at home, in small moments, between ages 5
              and 15.
            </p>
            <p
              className="text-[19px] text-ink-secondary"
              style={{ lineHeight: 1.55 }}
            >
              Most parents miss them. Not because they don&apos;t care, but
              because nobody told them what the moments are.
            </p>
          </div>

          {/* Progress dots, third filled */}
          <div className="mt-16 flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                aria-hidden
                className={`h-2 rounded-full ${
                  i === 2 ? "w-7 bg-accent" : "w-2 bg-line"
                }`}
              />
            ))}
          </div>

          {/* Footer row */}
          <div className="mt-10 flex items-center justify-between">
            <span className="text-[15px] font-extrabold text-ink-tertiary">
              Skip
            </span>
            <div
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white"
              style={{ boxShadow: "0 6px 16px rgba(58, 79, 204, 0.25)" }}
            >
              <ArrowRight size={22} strokeWidth={2} aria-hidden />
            </div>
          </div>
        </PhoneFrame>
      </section>
    </>
  );
}

function AxisIllustration() {
  // 200×200, axis from 5 to 15, soft accent band, single dot marker.
  return (
    <svg
      width={200}
      height={200}
      viewBox="0 0 200 200"
      role="img"
      aria-label="A path from age 5 to age 15"
    >
      {/* soft accent band */}
      <rect
        x={36}
        y={92}
        width={128}
        height={16}
        rx={8}
        fill="var(--accent-bg)"
      />
      {/* horizontal axis */}
      <line
        x1={30}
        x2={170}
        y1={100}
        y2={100}
        stroke="var(--ink)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* 5 marker */}
      <line x1={36} x2={36} y1={92} y2={108} stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" />
      <text
        x={36}
        y={128}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="var(--ink-secondary)"
        fontFamily="inherit"
      >
        5
      </text>
      {/* 15 marker */}
      <line x1={164} x2={164} y1={92} y2={108} stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" />
      <text
        x={164}
        y={128}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="var(--ink-secondary)"
        fontFamily="inherit"
      >
        15
      </text>
      {/* single dot marker */}
      <circle cx={100} cy={100} r={5} fill="var(--accent)" />
    </svg>
  );
}

// ============================================================
// Section 6: Illustration samples
// ============================================================

function Section6Illustrations() {
  return (
    <>
      <SectionDivider />
      <section>
        <Eyebrow>Section 6: Illustration style</Eyebrow>
        <p className="mt-2 text-[15px] text-ink-secondary" style={{ lineHeight: 1.5 }}>
          Single-line, single-color, abstract. No characters, no faces, no
          clothing details. Same stroke weight, same energy.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <IllustrationTile label="Small moment">
            <HandWithDot />
          </IllustrationTile>
          <IllustrationTile label="Journey">
            <WindingPath />
          </IllustrationTile>
          <IllustrationTile label="Attention">
            <WindowWithRay />
          </IllustrationTile>
          <IllustrationTile label="Together">
            <TwoFigures />
          </IllustrationTile>
        </div>
      </section>
    </>
  );
}

function IllustrationTile({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--accent-bg)" }}
      >
        <div className="text-ink">{children}</div>
      </div>
      <span className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-tertiary">
        {label}
      </span>
    </div>
  );
}

// SVG glyphs: 120x120, single-stroke, `currentColor` so they re-skin
// against the surrounding text color (here: ink on accent-bg).
const SVG_BASE = {
  width: 120,
  height: 120,
  viewBox: "0 0 120 120",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HandWithDot() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="A cupped hand holding a small moment">
      {/* Cupped palm: wide, gentle curve, with thumb hint at left and pinky at right */}
      <path d="M 22 72 Q 60 110, 98 72" />
      <line x1={22} y1={72} x2={22} y2={58} />
      <line x1={98} y1={72} x2={98} y2={58} />
      {/* Small dot above */}
      <circle cx={60} cy={36} r={3.5} fill="currentColor" />
    </svg>
  );
}

function WindingPath() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="A winding path">
      <path d="M 14 88 Q 36 40, 60 64 T 106 50" />
      <circle cx={60} cy={64} r={3.5} fill="currentColor" />
    </svg>
  );
}

function WindowWithRay() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="A window with a single ray of light">
      <rect x={28} y={24} width={48} height={62} rx={2} />
      <line x1={52} y1={24} x2={52} y2={86} />
      <line x1={28} y1={55} x2={76} y2={55} />
      {/* Ray escaping out the corner */}
      <line x1={76} y1={48} x2={104} y2={20} />
    </svg>
  );
}

function TwoFigures() {
  return (
    <svg {...SVG_BASE} role="img" aria-label="Two figures, abstract, facing each other">
      {/* Larger figure on left */}
      <circle cx={42} cy={46} r={9} />
      <path d="M 26 98 Q 42 62, 58 98" />
      {/* Smaller figure on right */}
      <circle cx={80} cy={58} r={7} />
      <path d="M 68 98 Q 80 72, 92 98" />
      {/* Subtle ground line so the two share a footing */}
      <line x1={18} x2={102} y1={108} y2={108} strokeDasharray="2 4" />
    </svg>
  );
}

// ============================================================
// Phone frame: visually delineates a screen mockup from the page chrome
// ============================================================

function PhoneFrame({
  children,
  tall = false,
}: {
  children: ReactNode;
  tall?: boolean;
}) {
  return (
    <div
      className="mt-8 rounded-[28px] bg-bg p-6"
      style={{
        boxShadow:
          "0 1px 0 0 var(--line) inset, 0 0 0 1px var(--line), 0 16px 40px -16px rgba(26, 24, 20, 0.18)",
        minHeight: tall ? 620 : 540,
      }}
    >
      {children}
    </div>
  );
}
