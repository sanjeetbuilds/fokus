"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  IconClock,
  IconSchool,
  IconSparkles,
  type IconProps,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Wordmark from "@/components/shared/Wordmark";

const STORAGE_KEY = "fokus_intro_step";
const SCREEN_COUNT = 4;
const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";

/**
 * Unauthenticated entry point. Four screens on a shared white canvas:
 *
 *   0  Splash: wordmark + tagline + Continue
 *   1  Intro 1: school icon; "Schools measure what's easy to measure."
 *   2  Intro 2: clock icon;  "Ten minutes. One activity. Every day."
 *   3  Intro 3: sparkles;    "Nine skills. 72 small things."
 *
 * URL stays /welcome through all four. Get started on screen 3 routes
 * to /sign-in.
 */
export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const guardedRef = useRef(false);

  useEffect(() => {
    let restored = 0;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const n = parseInt(raw, 10);
        if (Number.isInteger(n) && n >= 0 && n < SCREEN_COUNT) restored = n;
      }
    } catch {
      /* private browsing; harmless */
    }
    setStep(restored);
    setHydrated(true);
    if (typeof window !== "undefined") {
      window.history.replaceState({ introStep: restored }, "");
    }
    const onPopState = (e: PopStateEvent) => {
      const next = (e.state as { introStep?: number } | null)?.introStep;
      if (typeof next === "number" && next >= 0 && next < SCREEN_COUNT) {
        setDirection(-1);
        setStep(next);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(step));
    } catch {
      /* private browsing; harmless */
    }
  }, [step, hydrated]);

  const advanceTo = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === step) return;
      if (next < 0 || next >= SCREEN_COUNT) return;
      setDirection(dir);
      setStep(next);
      if (typeof window !== "undefined") {
        window.history.pushState({ introStep: next }, "");
      }
    },
    [step],
  );

  const next = useCallback(() => {
    advanceTo(Math.min(step + 1, SCREEN_COUNT - 1), 1);
  }, [advanceTo, step]);

  const goSignIn = useCallback(() => {
    if (guardedRef.current) return;
    guardedRef.current = true;
    router.push("/sign-in");
  }, [router]);

  const onDragEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      const dx = info.offset.x;
      const vx = info.velocity.x;
      if (dx < -50 || vx < -400) {
        if (step < SCREEN_COUNT - 1) next();
        else goSignIn();
      } else if ((dx > 50 || vx > 400) && step > 0) {
        if (typeof window !== "undefined") window.history.back();
      }
    },
    [goSignIn, next, step],
  );

  if (!hydrated) {
    return <main style={{ minHeight: "100svh", background: "#FFFFFF" }} />;
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.18}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        style={{
          position: "relative",
          minHeight: "100svh",
          touchAction: "pan-y",
        }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "relative",
              minHeight: "100svh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {step === 0 ? (
              <Splash onContinue={next} />
            ) : (
              <IntroScreen
                config={INTROS[step - 1]!}
                step={step}
                onContinue={step === SCREEN_COUNT - 1 ? goSignIn : next}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

// ============================================================
// Splash (screen 0)
// ============================================================

function Splash({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={FRAME}>
      <div style={{ height: 50, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            paddingTop: "30vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Wordmark size="xl" />
          <p
            style={{
              marginTop: 16,
              fontSize: 16,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            ten minutes a day,
            <br />
            with your child.
          </p>
        </div>
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />
        <Dots active={0} />
        <div style={{ marginTop: 12 }}>
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Intro screens (1, 2, 3)
// ============================================================

interface IntroConfig {
  icon: ComponentType<IconProps>;
  iconColor: string;
  circleBg: string;
  blob: string;
  headline: ReactNode;
  subhead: string;
  buttonLabel: string;
}

const INTROS: IntroConfig[] = [
  {
    icon: IconSchool,
    iconColor: "#252630",
    circleBg: "#E8F4FF",
    blob: "rgba(156,165,255,0.20)",
    headline: (
      <>
        Schools
        <br />
        measure what&apos;s
        <br />
        <span style={{ color: ACCENT }}>easy to measure.</span>
      </>
    ),
    subhead:
      "Marks. Behaviour. Speed. None of which build the things that actually matter for your child's future.",
    buttonLabel: "Continue",
  },
  {
    icon: IconClock,
    iconColor: "#8A6200",
    circleBg: "#FFF6DC",
    blob: "rgba(244,200,74,0.20)",
    headline: (
      <>
        Ten minutes.
        <br />
        <span style={{ color: ACCENT }}>One activity.</span>
        <br />
        Every day.
      </>
    ),
    subhead:
      "No screens for your child. No scores. Just you and them, ten minutes, the right small thing.",
    buttonLabel: "Continue",
  },
  {
    icon: IconSparkles,
    iconColor: "#943200",
    circleBg: "#FCEEE8",
    blob: "rgba(232,128,107,0.20)",
    headline: (
      <>
        Nine skills.
        <br />
        <span style={{ color: ACCENT }}>72 small things</span>
        <br />
        to do together.
      </>
    ),
    subhead:
      "Curiosity, resilience, perspective, emotional awareness, and more. Built between ages 5 and 10.",
    buttonLabel: "Get started",
  },
];

function IntroScreen({
  config,
  step,
  onContinue,
}: {
  config: IntroConfig;
  step: number;
  onContinue: () => void;
}) {
  const Icon = config.icon;
  return (
    <div style={FRAME}>
      <div style={{ marginTop: 50 }}>
        <Wordmark size="sm" />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: "30vh",
        }}
      >
        {/* Icon zone */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: config.blob,
              zIndex: 0,
            }}
          />
          <span
            aria-hidden
            style={{
              position: "relative",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: config.circleBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.iconColor,
              zIndex: 2,
            }}
          >
            <Icon size={26} stroke={2} aria-hidden />
          </span>
        </div>

        <h1
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: 800,
            color: INK,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            textAlign: "center",
          }}
        >
          {config.headline}
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            fontWeight: 400,
            color: MUTED,
            lineHeight: 1.55,
            textAlign: "center",
            maxWidth: 240,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {config.subhead}
        </p>
      </div>

      <Dots active={step} />
      <div style={{ marginTop: 12 }}>
        <PrimaryButton onClick={onContinue}>{config.buttonLabel}</PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================
// Shared chrome
// ============================================================

const FRAME: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: "100svh",
  paddingTop: "calc(env(safe-area-inset-top, 0px) + 0px)",
  paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
  paddingLeft: 20,
  paddingRight: 20,
};

function Dots({ active }: { active: number }) {
  return (
    <ol
      aria-hidden
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {Array.from({ length: SCREEN_COUNT }).map((_, i) => (
        <li
          key={i}
          style={{
            width: i === active ? 14 : 5,
            height: 5,
            borderRadius: 3,
            background: i === active ? INK : "#E5E3DA",
            transition: "width 250ms ease-out, background 250ms ease-out",
          }}
        />
      ))}
    </ol>
  );
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: INK,
        color: "#FFFFFF",
        borderRadius: 999,
        padding: 12,
        fontSize: 13,
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
      }}
      className="transition-opacity active:opacity-90"
    >
      {children}
    </button>
  );
}

