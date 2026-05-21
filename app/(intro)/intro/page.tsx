"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import Wordmark from "@/components/shared/Wordmark";

/**
 * Round-6 intro: three light-background narrative screens with line-art
 * illustrations on a soft accent-tinted circle. No setup form here —
 * pressing "Set up Fokus →" on screen 3 routes to /onboarding, which
 * captures the 20-second form (name + age + English).
 *
 * The previous five-slide intro (which embedded the setup form on slide 5
 * and used dark mood-board imagery) was replaced wholesale. This intro is
 * the parent's first taste of the product's calmness; nothing on it
 * should feel like a sales pitch.
 */

const TOTAL_SCREENS = 3;

export default function IntroPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next > TOTAL_SCREENS - 1) return;
      setDirection(next > step ? 1 : -1);
      setStep(next);
    },
    [step],
  );

  const skip = useCallback(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Wordmark size="sm" />
        {step < TOTAL_SCREENS - 1 ? (
          <button
            type="button"
            onClick={skip}
            className="rounded-md px-2 py-1.5 text-[14px] font-extrabold text-ink-tertiary transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Skip
          </button>
        ) : (
          <span aria-hidden className="h-9 w-9" />
        )}
      </header>

      <section className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center px-8 pt-12"
          >
            {step === 0 ? <Slide0 /> : null}
            {step === 1 ? <Slide1 /> : null}
            {step === 2 ? <Slide2 /> : null}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-2">
        <Dots active={step} total={TOTAL_SCREENS} />
        <div className="mt-5">
          {step < TOTAL_SCREENS - 1 ? (
            <div className="flex items-center justify-between">
              <span aria-hidden className="h-12 w-12" />
              <button
                type="button"
                onClick={() => go(step + 1)}
                aria-label="Next"
                className="inline-flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform duration-fast active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                style={{ background: "#1A1A1A" }}
              >
                <ArrowRight size={22} strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.replace("/onboarding")}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-extrabold text-white transition-transform duration-fast active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              style={{
                background: "#1A1A1A",
                letterSpacing: "-0.01em",
              }}
            >
              Set up Fokus
              <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}

function Dots({ active, total }: { active: number; total: number }) {
  return (
    <ol
      aria-label={`Step ${active + 1} of ${total}`}
      className="flex items-center justify-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => {
        const on = i === active;
        return (
          <li
            key={i}
            aria-current={on ? "step" : undefined}
            className="rounded-full transition-all duration-300"
            style={{
              width: on ? 22 : 6,
              height: 6,
              background: on ? "#1A1A1A" : "rgba(26,26,26,0.16)",
            }}
          />
        );
      })}
    </ol>
  );
}

// ---------- Slide shells (illustration + title + body) ----------

function SlideShell({
  illustration,
  title,
  body,
}: {
  illustration: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <>
      <IlloHalo>{illustration}</IlloHalo>
      <h1
        className="mt-10 text-center text-ink"
        style={{
          fontSize: 32,
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>
      <p
        className="mt-4 max-w-[320px] text-center text-ink-secondary"
        style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.5 }}
      >
        {body}
      </p>
    </>
  );
}

function IlloHalo({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 180,
        height: 180,
        background: "#F7F7F5",
      }}
    >
      {children}
    </div>
  );
}

// ---------- Slide 0: ruler / marks · behavior · speed ----------

function Slide0() {
  return (
    <SlideShell
      illustration={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
          {/* Three tick marks above the bar */}
          <line x1="32" y1="48" x2="32" y2="58" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="60" y1="48" x2="60" y2="58" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="88" y1="48" x2="88" y2="58" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Horizontal bar */}
          <line
            x1="18"
            y1="64"
            x2="102"
            y2="64"
            stroke="var(--ink)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Labels — one centered text with middots so spacing always reads */}
          <text
            x="60"
            y="80"
            textAnchor="middle"
            fontSize="7.5"
            fontFamily="var(--font-inter)"
            fontWeight="800"
            fill="var(--ink-tertiary)"
          >
            marks · behavior · speed
          </text>
        </svg>
      }
      title="School teaches reading. Math. Science."
      body="Those things matter. But they're not the whole picture."
    />
  );
}

// ---------- Slide 1: winding path ----------

function Slide1() {
  return (
    <SlideShell
      illustration={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
          <path
            d="M 14 88 Q 30 60 50 72 T 82 50 Q 92 44 102 40"
            stroke="var(--ink)"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="102" cy="40" r="4" fill="var(--ink)" />
        </svg>
      }
      title="What school doesn't teach: how to think, how to feel, how to recover."
      body="Critical thinking. Emotional steadiness. Creativity. The skills that decide how a child turns out get built at home."
    />
  );
}

// ---------- Slide 2: window with glow ----------

function Slide2() {
  return (
    <SlideShell
      illustration={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
          {/* Glow lines coming out of the top-right of the window */}
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={70 + i * 4}
              y1={32 - i * 3}
              x2={86 + i * 6}
              y2={16 - i * 4}
              stroke="#1A1A1A"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={1 - i * 0.25}
            />
          ))}
          {/* Window frame */}
          <rect
            x="36"
            y="36"
            width="44"
            height="60"
            rx="3"
            stroke="var(--ink)"
            strokeWidth="1.75"
            fill="none"
          />
          {/* Inner crossbar */}
          <line
            x1="36"
            y1="66"
            x2="80"
            y2="66"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="58"
            y1="36"
            x2="58"
            y2="96"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
      title="Fokus is one small moment a day."
      body="For the parts no one teaches anywhere else. You and your child. Five to twenty minutes. That's the whole app."
    />
  );
}
